import { describe, it, expect } from 'vitest';
import { Booking, Slot } from '@hetcho/domain';
import { BookingId, CustomerId, NotFoundError, ServiceId, StaffId, TenantId } from '@hetcho/shared';
import { MarkDepositPaidUseCase } from './mark-deposit-paid.use-case.js';
import type { BookingDependencies } from './ports.js';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_TENANT = '22222222-2222-2222-2222-222222222222';
const SERVICE_ID = '33333333-3333-3333-3333-333333333333';
const CUSTOMER_ID = '44444444-4444-4444-4444-444444444444';
const STAFF_ID = '55555555-5555-5555-5555-555555555555';
const BOOKING_ID = '66666666-6666-6666-6666-666666666666';

function makePendingBooking(depositRequired = 50_000): Booking {
  return Booking.create({
    id: BookingId(BOOKING_ID),
    tenantId: TenantId(TENANT_ID),
    customerId: CustomerId(CUSTOMER_ID),
    serviceId: ServiceId(SERVICE_ID),
    staffId: StaffId(STAFF_ID),
    slot: Slot.create(new Date('2026-07-01T10:00:00+07:00'), 60),
    isPeakSlot: true,
    depositRequiredVnd: depositRequired,
  });
}

interface State {
  saves: number;
  audits: Array<{ action: string; gatewayTxnId?: string }>;
  notifications: number;
  broadcasts: number;
}

function makeDeps(booking: Booking | null): { deps: BookingDependencies; state: State } {
  const state: State = { saves: 0, audits: [], notifications: 0, broadcasts: 0 };
  const store = new Map<string, Booking>();
  if (booking) store.set(booking.id, booking);

  const deps: BookingDependencies = {
    now: () => new Date('2026-06-25T10:00:00+07:00'),
    generateId: () => 'gen-id',
    tenants: { findById: async () => null },
    services: { findById: async () => null },
    customers: { findById: async () => null, save: async () => undefined },
    bookings: {
      findById: async (id) => store.get(id) ?? null,
      findOverlapping: async () => [],
      findByTenantAndDate: async () => [],
      save: async (b) => {
        state.saves += 1;
        store.set(b.id, b);
      },
    },
    unitOfWork: {
      run: async (work) => work({ bookings: deps.bookings, customers: deps.customers, audit: deps.audit }),
    },
    payment: { createDeposit: async () => ({ paymentUrl: '', gatewayTxnId: '' }) },
    notification: {
      sendBookingConfirmation: async () => {
        state.notifications += 1;
      },
      sendBookingCancellation: async () => undefined,
    },
    audit: {
      log: async ({ action, payload }) => {
        state.audits.push({ action, gatewayTxnId: (payload as { gatewayTxnId?: string })?.gatewayTxnId });
      },
    },
    broadcaster: {
      publish: async () => {
        state.broadcasts += 1;
      },
    },
  };
  return { deps, state };
}

describe('Payment webhook idempotency (MarkDepositPaidUseCase)', () => {
  it('first webhook confirms; second duplicate (same txn id) is no-op', async () => {
    const booking = makePendingBooking();
    const { deps, state } = makeDeps(booking);
    const uc = new MarkDepositPaidUseCase(deps);

    const r1 = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      amountVnd: 50_000,
      gatewayTxnId: 'vnpay-tx-001',
    });
    const r2 = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      amountVnd: 50_000,
      gatewayTxnId: 'vnpay-tx-001',
    });

    expect(r1.alreadyConfirmed).toBe(false);
    expect(r2.alreadyConfirmed).toBe(true);
    expect(state.saves).toBe(1);
    expect(state.notifications).toBe(1);
    expect(state.audits.filter((a) => a.action === 'booking.deposit_paid')).toHaveLength(1);
    expect(state.broadcasts).toBe(1);
  });

  it('duplicate from rogue/parallel gateway (different txn id) is also no-op once already confirmed', async () => {
    const booking = makePendingBooking();
    const { deps, state } = makeDeps(booking);
    const uc = new MarkDepositPaidUseCase(deps);

    await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      amountVnd: 50_000,
      gatewayTxnId: 'vnpay-tx-001',
    });
    const r2 = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      amountVnd: 50_000,
      gatewayTxnId: 'momo-tx-999',
    });

    expect(r2.alreadyConfirmed).toBe(true);
    expect(state.saves).toBe(1);
    expect(state.notifications).toBe(1);
  });

  it('late webhook after booking was cancelled does NOT flip status back', async () => {
    const booking = makePendingBooking();
    booking.cancel('customer-cancel', new Date('2026-06-26T08:00:00+07:00'), 0);
    const { deps, state } = makeDeps(booking);
    const uc = new MarkDepositPaidUseCase(deps);

    const r = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      amountVnd: 50_000,
      gatewayTxnId: 'vnpay-late',
    });

    expect(r.alreadyConfirmed).toBe(true);
    expect(state.saves).toBe(0);
    expect(state.notifications).toBe(0);
    expect(booking.status).toBe('cancelled');
  });

  it('rejects webhook for booking belonging to another tenant (security)', async () => {
    const booking = makePendingBooking();
    const { deps } = makeDeps(booking);
    const uc = new MarkDepositPaidUseCase(deps);

    await expect(
      uc.execute({
        tenantId: OTHER_TENANT,
        bookingId: BOOKING_ID,
        amountVnd: 50_000,
        gatewayTxnId: 'vnpay-crosstenant',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('rejects webhook for unknown booking', async () => {
    const { deps } = makeDeps(null);
    const uc = new MarkDepositPaidUseCase(deps);

    await expect(
      uc.execute({
        tenantId: TENANT_ID,
        bookingId: BOOKING_ID,
        amountVnd: 50_000,
        gatewayTxnId: 'vnpay-ghost',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('accepts overpayment (amount > required)', async () => {
    const booking = makePendingBooking(50_000);
    const { deps, state } = makeDeps(booking);
    const uc = new MarkDepositPaidUseCase(deps);

    const r = await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      amountVnd: 200_000,
      gatewayTxnId: 'vnpay-over',
    });

    expect(r.alreadyConfirmed).toBe(false);
    expect(state.saves).toBe(1);
    expect(booking.toJSON().depositPaidVnd).toBe(200_000);
  });

  it('records gatewayTxnId in audit payload (for reconciliation)', async () => {
    const booking = makePendingBooking();
    const { deps, state } = makeDeps(booking);
    const uc = new MarkDepositPaidUseCase(deps);

    await uc.execute({
      tenantId: TENANT_ID,
      bookingId: BOOKING_ID,
      amountVnd: 50_000,
      gatewayTxnId: 'vnpay-tx-audit',
    });

    const event = state.audits.find((a) => a.action === 'booking.deposit_paid');
    expect(event?.gatewayTxnId).toBe('vnpay-tx-audit');
  });
});
