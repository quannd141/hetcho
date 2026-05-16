import { describe, it, expect } from 'vitest';
import { Customer, Service, Tenant } from '@hetcho/domain';
import { ServiceId, TenantId, ValidationError } from '@hetcho/shared';
import { WalkInBookingUseCase } from './walk-in-booking.use-case.js';
import type { BookingDependencies } from './ports.js';
import type { BookingEvent, RealtimeBroadcaster } from './realtime-broadcaster.js';

class CaptureBroadcaster implements RealtimeBroadcaster {
  readonly published: BookingEvent[] = [];
  async publish(event: BookingEvent): Promise<void> {
    this.published.push(event);
  }
}

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const SERVICE_ID = '22222222-2222-2222-2222-222222222222';
const STAFF_ID = '44444444-4444-4444-4444-444444444444';
const MON_NORMAL = new Date('2026-06-01T10:00:00Z');
const FIXED_NOW = new Date('2026-06-01T09:00:00Z');

function makeTenant() {
  return Tenant.create({
    id: TenantId(TENANT_ID),
    slug: 'demo',
    name: 'Demo',
    type: 'salon_toc',
    workingHours: { mon: { open: '08:00', close: '22:00' } },
    peakWindows: [],
    slotMinutes: 30,
    timezone: 'UTC',
    cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
  });
}

function makeService() {
  return Service.create({
    id: ServiceId(SERVICE_ID),
    tenantId: TenantId(TENANT_ID),
    name: 'Cắt + Gội',
    durationMinutes: 60,
    priceVnd: 300_000,
    depositNormalVnd: 0,
    depositPeakVnd: 100_000,
    isActive: true,
  });
}

interface DepsState {
  savedCustomers: Customer[];
  saved: number;
  audited: string[];
  broadcaster: CaptureBroadcaster;
}

function makeDeps(opts?: { tenant?: Tenant | null; service?: Service | null }): { deps: BookingDependencies; state: DepsState } {
  const tenant = opts?.tenant === undefined ? makeTenant() : opts.tenant;
  const service = opts?.service === undefined ? makeService() : opts.service;
  const broadcaster = new CaptureBroadcaster();
  const state: DepsState = { savedCustomers: [], saved: 0, audited: [], broadcaster };
  let idCounter = 0;
  const deps: BookingDependencies = {
    now: () => FIXED_NOW,
    generateId: () => {
      idCounter++;
      return idCounter === 1
        ? 'cccccccc-cccc-cccc-cccc-cccccccccccc'
        : 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    },
    tenants: { findById: async () => tenant },
    services: { findById: async () => service },
    customers: {
      findById: async () => null,
      save: async (c) => {
        state.savedCustomers.push(c);
      },
    },
    bookings: {
      findById: async () => null,
      findOverlapping: async () => [],
      findByTenantAndDate: async () => [],
      save: async () => {
        state.saved++;
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
      sendBookingConfirmation: async () => {},
      sendBookingCancellation: async () => {},
    },
    audit: {
      log: async ({ action, entityId }) => state.audited.push(`${action}:${entityId}`),
    },
    broadcaster,
  };
  return { deps, state };
}

describe('WalkInBookingUseCase', () => {
  it('should create confirmed booking + new customer + audit + broadcast', async () => {
    const { deps, state } = makeDeps();
    const uc = new WalkInBookingUseCase(deps);

    const result = await uc.execute({
      tenantId: TENANT_ID,
      serviceId: SERVICE_ID,
      staffId: STAFF_ID,
      startAt: MON_NORMAL.toISOString(),
      customer: { name: 'Chị Hoa', phone: '0901234567' },
      actorId: 'owner-1',
    });

    expect(result.status).toBe('confirmed');
    expect(result.customerCreated).toBe(true);
    expect(state.savedCustomers).toHaveLength(1);
    expect(state.savedCustomers[0]?.toJSON().phoneMasked).toBe('09***4567');
    expect(state.savedCustomers[0]?.toJSON().phoneHash).not.toBe('0901234567'); // hashed
    expect(state.audited).toEqual([`booking.walk_in_created:${result.bookingId}`]);
    expect(state.broadcaster.published).toHaveLength(1);
    expect(state.broadcaster.published[0]?.type).toBe('booking.created');
    expect(state.broadcaster.published[0]?.payload).toMatchObject({ walkIn: true });
  });

  it('should reject phone with wrong format', async () => {
    const { deps } = makeDeps();
    const uc = new WalkInBookingUseCase(deps);

    await expect(
      uc.execute({
        tenantId: TENANT_ID,
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startAt: MON_NORMAL.toISOString(),
        customer: { name: 'Chị Hoa', phone: '12345' },
      }),
    ).rejects.toThrow();
  });

  it('should reject slot in the past', async () => {
    const { deps } = makeDeps();
    const uc = new WalkInBookingUseCase(deps);

    await expect(
      uc.execute({
        tenantId: TENANT_ID,
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startAt: new Date('2020-01-01T10:00:00Z').toISOString(),
        customer: { name: 'X', phone: '0901234567' },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('should reject when service not found', async () => {
    const { deps } = makeDeps({ service: null });
    const uc = new WalkInBookingUseCase(deps);
    await expect(
      uc.execute({
        tenantId: TENANT_ID,
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startAt: MON_NORMAL.toISOString(),
        customer: { name: 'X', phone: '0901234567' },
      }),
    ).rejects.toThrow(/Service not found/);
  });

  it('should reject outside working hours (Sunday closed)', async () => {
    const { deps } = makeDeps();
    const uc = new WalkInBookingUseCase(deps);
    await expect(
      uc.execute({
        tenantId: TENANT_ID,
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startAt: new Date('2026-06-07T10:00:00Z').toISOString(), // Sunday — no working hours
        customer: { name: 'X', phone: '0901234567' },
      }),
    ).rejects.toThrow(/working hours/);
  });
});
