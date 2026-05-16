import { describe, it, expect, beforeEach } from 'vitest';
import { Booking, Slot } from '@hetcho/domain';
import {
  BookingId,
  CustomerId,
  NotFoundError,
  ServiceId,
  StaffId,
  TenantId,
  ValidationError,
} from '@hetcho/shared';
import { CheckInBookingUseCase } from './check-in-booking.use-case.js';
import { StartServiceUseCase } from './start-service.use-case.js';
import { CompleteBookingUseCase } from './complete-booking.use-case.js';
import { MarkNoShowUseCase } from './mark-no-show.use-case.js';
import { MarkDepositPaidUseCase } from './mark-deposit-paid.use-case.js';
import type { BookingDependencies } from './ports.js';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const SERVICE_ID = '22222222-2222-2222-2222-222222222222';
const CUSTOMER_ID = '33333333-3333-3333-3333-333333333333';
const STAFF_ID = '44444444-4444-4444-4444-444444444444';
const BOOKING_ID = '55555555-5555-5555-5555-555555555555';
const OTHER_TENANT = '99999999-9999-9999-9999-999999999999';
const FIXED_NOW = new Date('2026-06-01T10:30:00Z');

function makeBooking(opts?: { status?: 'pending' | 'confirmed' | 'checked_in' | 'in_service'; depositRequired?: number; depositPaid?: number }): Booking {
  const booking = Booking.create({
    id: BookingId(BOOKING_ID),
    tenantId: TenantId(TENANT_ID),
    customerId: CustomerId(CUSTOMER_ID),
    serviceId: ServiceId(SERVICE_ID),
    staffId: StaffId(STAFF_ID),
    slot: Slot.create(new Date('2026-06-01T10:00:00Z'), 60),
    isPeakSlot: false,
    depositRequiredVnd: opts?.depositRequired ?? 0,
  });
  if (opts?.depositPaid && opts.depositPaid > 0) {
    booking.payDeposit(opts.depositPaid, new Date('2026-05-30T10:00:00Z'));
  }
  if (opts?.status === 'checked_in') booking.checkIn(new Date('2026-06-01T10:05:00Z'));
  if (opts?.status === 'in_service') {
    booking.checkIn(new Date('2026-06-01T10:05:00Z'));
    booking.startService();
  }
  return booking;
}

interface State {
  saved: Booking[];
  audited: string[];
  notifications: string[];
}

function makeDeps(booking: Booking | null): { deps: BookingDependencies; state: State } {
  const state: State = { saved: [], audited: [], notifications: [] };
  const store = new Map<string, Booking>();
  if (booking) store.set(booking.id, booking);
  const deps: BookingDependencies = {
    now: () => FIXED_NOW,
    generateId: () => 'gen-id',
    tenants: { findById: async () => null },
    services: { findById: async () => null },
    customers: { findById: async () => null, save: async () => {} },
    bookings: {
      findById: async (id) => store.get(id) ?? null,
      findOverlapping: async () => [],
      findByTenantAndDate: async () => [],
      save: async (b) => {
        state.saved.push(b);
        store.set(b.id, b);
      },
    },
    unitOfWork: {
      run: async (work) =>
        work({
          bookings: deps.bookings,
          customers: deps.customers,
          audit: deps.audit,
        }),
    },
    payment: { createDeposit: async () => ({ paymentUrl: '', gatewayTxnId: '' }) },
    notification: {
      sendBookingConfirmation: async ({ bookingId }) => {
        state.notifications.push(`confirm:${bookingId}`);
      },
      sendBookingCancellation: async ({ bookingId }) => {
        state.notifications.push(`cancel:${bookingId}`);
      },
    },
    audit: {
      log: async ({ action, entityId }) => {
        state.audited.push(`${action}:${entityId}`);
      },
    },
  };
  return { deps, state };
}

describe('CheckInBookingUseCase', () => {
  it('should transition confirmed → checked_in', async () => {
    const booking = makeBooking({ status: 'confirmed' });
    const { deps, state } = makeDeps(booking);
    const uc = new CheckInBookingUseCase(deps);
    await uc.execute({ tenantId: TENANT_ID, bookingId: BOOKING_ID, actorType: 'owner' });
    expect(state.saved[0]?.status).toBe('checked_in');
    expect(state.audited).toContain(`booking.checked_in:${BOOKING_ID}`);
  });

  it('should reject if booking not in tenant', async () => {
    const booking = makeBooking({ status: 'confirmed' });
    const { deps } = makeDeps(booking);
    const uc = new CheckInBookingUseCase(deps);
    await expect(
      uc.execute({ tenantId: OTHER_TENANT, bookingId: BOOKING_ID, actorType: 'owner' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('should reject when not found', async () => {
    const { deps } = makeDeps(null);
    const uc = new CheckInBookingUseCase(deps);
    await expect(
      uc.execute({ tenantId: TENANT_ID, bookingId: BOOKING_ID, actorType: 'owner' }),
    ).rejects.toThrow(NotFoundError);
  });
});

describe('StartServiceUseCase', () => {
  it('should transition checked_in → in_service', async () => {
    const booking = makeBooking({ status: 'checked_in' });
    const { deps, state } = makeDeps(booking);
    const uc = new StartServiceUseCase(deps);
    await uc.execute({ tenantId: TENANT_ID, bookingId: BOOKING_ID, actorType: 'staff' });
    expect(state.saved[0]?.status).toBe('in_service');
    expect(state.audited).toContain(`booking.started:${BOOKING_ID}`);
  });

  it('should reject transition from confirmed (must check-in first)', async () => {
    const booking = makeBooking({ status: 'confirmed' });
    const { deps } = makeDeps(booking);
    const uc = new StartServiceUseCase(deps);
    await expect(
      uc.execute({ tenantId: TENANT_ID, bookingId: BOOKING_ID, actorType: 'staff' }),
    ).rejects.toThrow(/Cannot transition/);
  });
});

describe('CompleteBookingUseCase', () => {
  it('should complete in_service booking and compute remaining due', async () => {
    const booking = makeBooking({ status: 'in_service', depositRequired: 100_000, depositPaid: 100_000 });
    const { deps, state } = makeDeps(booking);
    const uc = new CompleteBookingUseCase(deps);
    const result = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      finalPriceVnd: 300_000,
      actorType: 'owner',
    });
    expect(state.saved[0]?.status).toBe('completed');
    expect(result.remainingDueVnd).toBe(200_000);
  });

  it('should accept zero final price', async () => {
    const booking = makeBooking({ status: 'in_service' });
    const { deps } = makeDeps(booking);
    const uc = new CompleteBookingUseCase(deps);
    const result = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      finalPriceVnd: 0,
      actorType: 'owner',
    });
    expect(result.remainingDueVnd).toBe(0);
  });
});

describe('MarkNoShowUseCase', () => {
  it('should mark confirmed booking as no_show and forfeit deposit', async () => {
    const booking = makeBooking({ status: 'confirmed', depositRequired: 100_000, depositPaid: 100_000 });
    const { deps, state } = makeDeps(booking);
    const uc = new MarkNoShowUseCase(deps);
    const result = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      actorType: 'system',
    });
    expect(state.saved[0]?.status).toBe('no_show');
    expect(result.depositForfeitedVnd).toBe(100_000);
    expect(state.audited).toContain(`booking.no_show:${BOOKING_ID}`);
  });

  it('should reject if already completed', async () => {
    const booking = makeBooking({ status: 'in_service' });
    booking.complete(100_000);
    const { deps } = makeDeps(booking);
    const uc = new MarkNoShowUseCase(deps);
    await expect(
      uc.execute({ tenantId: TENANT_ID, bookingId: BOOKING_ID, actorType: 'system' }),
    ).rejects.toThrow(/Cannot transition/);
  });
});

describe('MarkDepositPaidUseCase', () => {
  it('should confirm pending booking when amount sufficient', async () => {
    const booking = makeBooking({ depositRequired: 100_000 });
    const { deps, state } = makeDeps(booking);
    const uc = new MarkDepositPaidUseCase(deps);
    const result = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      amountVnd: 100_000,
      gatewayTxnId: 'vnpay-abc',
    });
    expect(state.saved[0]?.status).toBe('confirmed');
    expect(result.alreadyConfirmed).toBe(false);
    expect(state.notifications).toContain(`confirm:${BOOKING_ID}`);
  });

  it('should be idempotent when booking already confirmed', async () => {
    const booking = makeBooking({ status: 'confirmed' });
    const { deps, state } = makeDeps(booking);
    const uc = new MarkDepositPaidUseCase(deps);
    const result = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      amountVnd: 100_000,
      gatewayTxnId: 'vnpay-abc-retry',
    });
    expect(result.alreadyConfirmed).toBe(true);
    expect(state.saved).toHaveLength(0);
    expect(state.notifications).toHaveLength(0);
  });

  it('should reject when amount less than required', async () => {
    const booking = makeBooking({ depositRequired: 100_000 });
    const { deps } = makeDeps(booking);
    const uc = new MarkDepositPaidUseCase(deps);
    await expect(
      uc.execute({
        tenantId: TENANT_ID,
        bookingId: BOOKING_ID,
        amountVnd: 50_000,
        gatewayTxnId: 'vnpay-short',
      }),
    ).rejects.toThrow(ValidationError);
  });
});
