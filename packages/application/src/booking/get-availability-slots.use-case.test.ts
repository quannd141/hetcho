import { describe, it, expect, beforeEach } from 'vitest';
import { GetAvailabilitySlotsUseCase } from './get-availability-slots.use-case.js';
import { Booking, Service, Slot, Tenant } from '@hetcho/domain';
import type { BookingRepository } from '@hetcho/domain';
import type { ServiceRepository, TenantRepository } from './ports.js';
import { BookingId, CustomerId, NotFoundError, ServiceId, StaffId, TenantId } from '@hetcho/shared';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const SERVICE_ID = '22222222-2222-2222-2222-222222222222';
const STAFF_ID = '44444444-4444-4444-4444-444444444444';
const CUSTOMER_ID = '33333333-3333-3333-3333-333333333333';

function makeTenant(overrides?: Partial<Parameters<typeof Tenant.create>[0]>): Tenant {
  return Tenant.create({
    id: TenantId(TENANT_ID),
    slug: 'demo-salon',
    name: 'Demo',
    type: 'salon_toc',
    workingHours: {
      mon: { open: '08:00', close: '18:00' },
      tue: { open: '08:00', close: '18:00' },
      wed: { open: '08:00', close: '18:00' },
      thu: { open: '08:00', close: '18:00' },
      fri: { open: '08:00', close: '18:00' },
      sat: { open: '08:00', close: '22:00' },
      sun: null,
    },
    peakWindows: [{ day: 'sat', from: '14:00', to: '22:00' }],
    slotMinutes: 30,
    timezone: 'Asia/Ho_Chi_Minh',
    cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
    ...overrides,
  });
}

function makeService(durationMinutes = 60): Service {
  return Service.create({
    id: ServiceId(SERVICE_ID),
    tenantId: TenantId(TENANT_ID),
    name: 'Cắt + Gội',
    durationMinutes,
    priceVnd: 300_000,
    depositNormalVnd: 0,
    depositPeakVnd: 50_000,
    isActive: true,
  });
}

function makeBooking(startAtIso: string, durationMinutes: number, status: 'confirmed' | 'cancelled' | 'no_show' = 'confirmed'): Booking {
  return Booking.reconstruct({
    id: BookingId('99999999-9999-9999-9999-000000000001'),
    tenantId: TenantId(TENANT_ID),
    customerId: CustomerId(CUSTOMER_ID),
    serviceId: ServiceId(SERVICE_ID),
    staffId: StaffId(STAFF_ID),
    slot: Slot.create(new Date(startAtIso), durationMinutes),
    status,
    isPeakSlot: false,
    depositRequiredVnd: 0,
    depositPaidVnd: 0,
    depositPaidAt: null,
    finalPriceVnd: null,
    checkedInAt: null,
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
    createdAt: new Date('2026-05-30T00:00:00+07:00'),
  });
}

function makeDeps(opts?: { tenant?: Tenant | null; service?: Service | null; existingBookings?: Booking[] }) {
  const tenant = opts?.tenant === undefined ? makeTenant() : opts.tenant;
  const service = opts?.service === undefined ? makeService() : opts.service;
  const existing = opts?.existingBookings ?? [];

  const tenants: TenantRepository = {
    findById: async () => tenant,
    findBySlug: async () => tenant,
    save: async () => undefined,
  };
  const services: ServiceRepository = {
    findById: async (id, t) => (service && (service.toJSON().id === id) && (service.toJSON().tenantId === t) ? service : null),
    findActiveByTenant: async () => (service ? [service] : []),
    save: async () => undefined,
  };
  const bookings: Pick<BookingRepository, 'findByTenantAndDate' | 'findOverlapping' | 'findById' | 'save'> = {
    findByTenantAndDate: async () => existing,
    findOverlapping: async () => [],
    findById: async () => null,
    save: async () => undefined,
  };
  return { tenants, services, bookings: bookings as BookingRepository };
}

describe('GetAvailabilitySlotsUseCase', () => {
  let usecase: GetAvailabilitySlotsUseCase;

  beforeEach(() => {
    usecase = new GetAvailabilitySlotsUseCase(makeDeps());
  });

  it('returns slots from 08:00 to 17:00 (last 60min slot starts 17:00) on a Monday', async () => {
    const r = await usecase.execute({
      tenantId: TENANT_ID,
      serviceId: SERVICE_ID,
      date: new Date('2026-06-01T00:00:00+07:00').toISOString(),
    });
    expect(r.date).toBe('2026-06-01');
    expect(r.slots.length).toBe(19);
    expect(r.slots[0]?.startAt).toBe(new Date('2026-06-01T08:00:00+07:00').toISOString());
    expect(r.slots[r.slots.length - 1]?.startAt).toBe(new Date('2026-06-01T17:00:00+07:00').toISOString());
  });

  it('returns empty slots on Sunday (closed)', async () => {
    const r = await usecase.execute({
      tenantId: TENANT_ID,
      serviceId: SERVICE_ID,
      date: new Date('2026-06-07T00:00:00+07:00').toISOString(),
    });
    expect(r.slots).toHaveLength(0);
  });

  it('marks slots as peak when within sat 14:00-22:00 window', async () => {
    const r = await usecase.execute({
      tenantId: TENANT_ID,
      serviceId: SERVICE_ID,
      date: new Date('2026-06-06T00:00:00+07:00').toISOString(),
    });
    const slot13 = r.slots.find((s) => s.startAt === new Date('2026-06-06T13:30:00+07:00').toISOString());
    const slot14 = r.slots.find((s) => s.startAt === new Date('2026-06-06T14:00:00+07:00').toISOString());
    const slot17 = r.slots.find((s) => s.startAt === new Date('2026-06-06T17:00:00+07:00').toISOString());
    expect(slot13?.isPeak).toBe(false);
    expect(slot14?.isPeak).toBe(true);
    expect(slot17?.isPeak).toBe(true);
  });

  it('marks slots overlapping confirmed bookings as unavailable', async () => {
    const booking = makeBooking('2026-06-01T10:00:00+07:00', 60, 'confirmed');
    const deps = makeDeps({ existingBookings: [booking] });
    const u = new GetAvailabilitySlotsUseCase(deps);
    const r = await u.execute({
      tenantId: TENANT_ID,
      serviceId: SERVICE_ID,
      date: new Date('2026-06-01T00:00:00+07:00').toISOString(),
    });
    const slot10 = r.slots.find((s) => s.startAt === new Date('2026-06-01T10:00:00+07:00').toISOString());
    const slot1030 = r.slots.find((s) => s.startAt === new Date('2026-06-01T10:30:00+07:00').toISOString());
    const slot11 = r.slots.find((s) => s.startAt === new Date('2026-06-01T11:00:00+07:00').toISOString());
    expect(slot10?.available).toBe(false);
    expect(slot1030?.available).toBe(false);
    expect(slot11?.available).toBe(true);
  });

  it('ignores cancelled and no_show bookings when checking conflicts', async () => {
    const cancelled = makeBooking('2026-06-01T10:00:00+07:00', 60, 'cancelled');
    const noShow = makeBooking('2026-06-01T11:00:00+07:00', 60, 'no_show');
    const deps = makeDeps({ existingBookings: [cancelled, noShow] });
    const u = new GetAvailabilitySlotsUseCase(deps);
    const r = await u.execute({
      tenantId: TENANT_ID,
      serviceId: SERVICE_ID,
      date: new Date('2026-06-01T00:00:00+07:00').toISOString(),
    });
    const slot10 = r.slots.find((s) => s.startAt === new Date('2026-06-01T10:00:00+07:00').toISOString());
    const slot11 = r.slots.find((s) => s.startAt === new Date('2026-06-01T11:00:00+07:00').toISOString());
    expect(slot10?.available).toBe(true);
    expect(slot11?.available).toBe(true);
  });

  it('throws NotFoundError when tenant not found', async () => {
    const deps = makeDeps({ tenant: null });
    const u = new GetAvailabilitySlotsUseCase(deps);
    await expect(
      u.execute({
        tenantId: TENANT_ID,
        serviceId: SERVICE_ID,
        date: new Date('2026-06-01T00:00:00+07:00').toISOString(),
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws NotFoundError when service not found', async () => {
    const deps = makeDeps({ service: null });
    const u = new GetAvailabilitySlotsUseCase(deps);
    await expect(
      u.execute({
        tenantId: TENANT_ID,
        serviceId: SERVICE_ID,
        date: new Date('2026-06-01T00:00:00+07:00').toISOString(),
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('respects different slotMinutes (15 min stride for nail tenant)', async () => {
    const tenant = makeTenant({ slotMinutes: 15 });
    const deps = makeDeps({ tenant });
    const u = new GetAvailabilitySlotsUseCase(deps);
    const r = await u.execute({
      tenantId: TENANT_ID,
      serviceId: SERVICE_ID,
      date: new Date('2026-06-01T00:00:00+07:00').toISOString(),
    });
    expect(r.slots[1]?.startAt).toBe(new Date('2026-06-01T08:15:00+07:00').toISOString());
  });

  it('last slot must fit fully within closing time (does not emit slot that overruns)', async () => {
    const tenant = makeTenant({ slotMinutes: 60 });
    const longService = Service.create({
      id: ServiceId(SERVICE_ID),
      tenantId: TenantId(TENANT_ID),
      name: 'Massage 90 min',
      durationMinutes: 90,
      priceVnd: 500_000,
      depositNormalVnd: 0,
      depositPeakVnd: 0,
      isActive: true,
    });
    const deps = makeDeps({ tenant, service: longService });
    const u = new GetAvailabilitySlotsUseCase(deps);
    const r = await u.execute({
      tenantId: TENANT_ID,
      serviceId: SERVICE_ID,
      date: new Date('2026-06-01T00:00:00+07:00').toISOString(),
    });
    const last = r.slots[r.slots.length - 1];
    expect(new Date(last!.endAt).getTime()).toBeLessThanOrEqual(
      new Date('2026-06-01T18:00:00+07:00').getTime(),
    );
  });
});
