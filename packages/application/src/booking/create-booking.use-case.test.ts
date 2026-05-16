import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateBookingUseCase } from './create-booking.use-case.js';
import type { BookingDependencies } from './ports.js';
import { Booking, Customer, Service, Slot, Tenant } from '@hetcho/domain';
import {
  BookingConflictError,
  BookingId,
  CustomerId,
  NotFoundError,
  ServiceId,
  StaffId,
  TenantId,
} from '@hetcho/shared';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const SERVICE_ID = '22222222-2222-2222-2222-222222222222';
const CUSTOMER_ID = '33333333-3333-3333-3333-333333333333';
const STAFF_ID = '44444444-4444-4444-4444-444444444444';
const FIXED_NOW = new Date('2026-05-31T08:00:00Z');
const SAT_PEAK = new Date('2026-06-06T15:00:00Z');
const MON_NORMAL = new Date('2026-06-01T10:00:00Z');

function makeTenant() {
  return Tenant.create({
    id: TenantId(TENANT_ID),
    slug: 'demo',
    name: 'Demo',
    type: 'salon_toc',
    workingHours: {
      mon: { open: '08:00', close: '22:00' },
      sat: { open: '08:00', close: '22:00' },
    },
    peakWindows: [{ day: 'sat', from: '14:00', to: '22:00' }],
    slotMinutes: 30,
    timezone: 'UTC',
    cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
  });
}

function makeService(opts?: { depositNormal?: number; depositPeak?: number }) {
  return Service.create({
    id: ServiceId(SERVICE_ID),
    tenantId: TenantId(TENANT_ID),
    name: 'Cắt + Gội',
    durationMinutes: 60,
    priceVnd: 300_000,
    depositNormalVnd: opts?.depositNormal ?? 0,
    depositPeakVnd: opts?.depositPeak ?? 100_000,
    isActive: true,
  });
}

function makeCustomer() {
  return Customer.create({
    id: CustomerId(CUSTOMER_ID),
    tenantId: TenantId(TENANT_ID),
    name: 'Chị Hằng',
    phoneHash: 'hash',
    phoneMasked: '09***1234',
    zaloId: 'zalo123',
    tier: 'normal',
    lifetimeSpendVnd: 0,
    totalBookings: 0,
  });
}

interface MockDeps extends BookingDependencies {
  _state: {
    overlapping: Booking[];
    saved: Booking[];
    audited: string[];
    notifications: string[];
    paymentCalls: number;
  };
}

function makeDeps(opts?: { service?: Service; tenant?: Tenant | null; customer?: Customer | null; overlapping?: Booking[] }): MockDeps {
  const tenant = opts?.tenant === undefined ? makeTenant() : opts.tenant;
  const service = opts?.service ?? makeService();
  const customer = opts?.customer === undefined ? makeCustomer() : opts.customer;
  const state: MockDeps['_state'] = {
    overlapping: opts?.overlapping ?? [],
    saved: [],
    audited: [],
    notifications: [],
    paymentCalls: 0,
  };

  const deps: MockDeps = {
    _state: state,
    now: () => FIXED_NOW,
    generateId: () => '99999999-9999-9999-9999-999999999999',
    tenants: { findById: async () => tenant },
    services: { findById: async () => service },
    customers: { findById: async () => customer, save: async () => {} },
    bookings: {
      findById: async () => null,
      findOverlapping: async () => state.overlapping,
      findByTenantAndDate: async () => [],
      save: async (b) => { state.saved.push(b); },
    },
    unitOfWork: {
      run: async (work) =>
        work({
          bookings: deps.bookings,
          customers: deps.customers,
          audit: deps.audit,
        }),
    },
    payment: {
      createDeposit: async () => {
        state.paymentCalls++;
        return { paymentUrl: 'https://mock-gateway/pay/abc', gatewayTxnId: 'mock-txn-1' };
      },
    },
    notification: {
      sendBookingConfirmation: async ({ bookingId }) => { state.notifications.push(`confirm:${bookingId}`); },
      sendBookingCancellation: async ({ bookingId }) => { state.notifications.push(`cancel:${bookingId}`); },
    },
    audit: {
      log: async ({ action, entityId }) => { state.audited.push(`${action}:${entityId}`); },
    },
  };
  return deps;
}

describe('CreateBookingUseCase', () => {
  let deps: MockDeps;
  let useCase: CreateBookingUseCase;

  beforeEach(() => {
    deps = makeDeps();
    useCase = new CreateBookingUseCase(deps);
  });

  it('should create CONFIRMED booking when no deposit required (off-peak)', async () => {
    const result = await useCase.execute({
      tenantId: TENANT_ID,
      customerId: CUSTOMER_ID,
      serviceId: SERVICE_ID,
      staffId: STAFF_ID,
      startAt: MON_NORMAL.toISOString(),
    });

    expect(result.status).toBe('confirmed');
    expect(result.requiresPayment).toBe(false);
    expect(deps._state.saved).toHaveLength(1);
    expect(deps._state.audited).toContain('booking.created:99999999-9999-9999-9999-999999999999');
    expect(deps._state.notifications).toContain('confirm:99999999-9999-9999-9999-999999999999');
    expect(deps._state.paymentCalls).toBe(0);
  });

  it('should create PENDING booking with payment URL on peak slot', async () => {
    const result = await useCase.execute({
      tenantId: TENANT_ID,
      customerId: CUSTOMER_ID,
      serviceId: SERVICE_ID,
      staffId: STAFF_ID,
      startAt: SAT_PEAK.toISOString(),
      returnUrl: 'https://hetcho.vn/callback',
    });

    expect(result.status).toBe('pending');
    expect(result.requiresPayment).toBe(true);
    expect(result.paymentUrl).toBe('https://mock-gateway/pay/abc');
    expect(deps._state.paymentCalls).toBe(1);
    expect(deps._state.notifications).toHaveLength(0); // wait until paid
  });

  it('should reject when slot in the past', async () => {
    await expect(
      useCase.execute({
        tenantId: TENANT_ID,
        customerId: CUSTOMER_ID,
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startAt: new Date('2020-01-01T10:00:00Z').toISOString(),
      }),
    ).rejects.toThrow(/future/);
  });

  it('should reject when tenant not found', async () => {
    deps = makeDeps({ tenant: null });
    useCase = new CreateBookingUseCase(deps);
    await expect(
      useCase.execute({
        tenantId: TENANT_ID,
        customerId: CUSTOMER_ID,
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startAt: MON_NORMAL.toISOString(),
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('should reject booking that conflicts with existing same-staff booking', async () => {
    const existing = Booking.create({
      id: BookingId('existing'),
      tenantId: TenantId(TENANT_ID),
      customerId: CustomerId(CUSTOMER_ID),
      serviceId: ServiceId(SERVICE_ID),
      staffId: StaffId(STAFF_ID),
      slot: Slot.create(MON_NORMAL, 90),
      isPeakSlot: false,
      depositRequiredVnd: 0,
    });

    deps = makeDeps({ overlapping: [existing] });
    useCase = new CreateBookingUseCase(deps);

    await expect(
      useCase.execute({
        tenantId: TENANT_ID,
        customerId: CUSTOMER_ID,
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startAt: new Date(MON_NORMAL.getTime() + 30 * 60_000).toISOString(),
      }),
    ).rejects.toThrow(BookingConflictError);
  });

  it('should require returnUrl when deposit needed', async () => {
    await expect(
      useCase.execute({
        tenantId: TENANT_ID,
        customerId: CUSTOMER_ID,
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startAt: SAT_PEAK.toISOString(),
      }),
    ).rejects.toThrow(/returnUrl required/);
  });

  it('should reject booking outside working hours (Sunday closed)', async () => {
    const sunday = new Date('2026-06-07T10:00:00Z');
    await expect(
      useCase.execute({
        tenantId: TENANT_ID,
        customerId: CUSTOMER_ID,
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startAt: sunday.toISOString(),
      }),
    ).rejects.toThrow(/working hours/);
  });
});
