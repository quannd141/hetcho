import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Customer, Service, Slot, Tenant, Booking } from '@hetcho/domain';
import { CustomerId, ServiceId, StaffId, TenantId, BookingId } from '@hetcho/shared';
import { createClientWithHandle, type DatabaseClient, tenants, services, staff, customers, bookings, staffServices } from '@hetcho/db';
import { eq } from 'drizzle-orm';
import { DrizzleTenantRepository } from './drizzle-tenant-repository.js';
import { DrizzleServiceRepository } from './drizzle-service-repository.js';
import { DrizzleStaffRepository } from './drizzle-staff-repository.js';
import { DrizzleCustomerRepository } from './drizzle-customer-repository.js';
import { DrizzleBookingRepository } from './drizzle-booking-repository.js';

const DB_URL = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;
const ENABLED = process.env.INTEGRATION_TESTS === 'true' && !!DB_URL;

// Test UUIDs use ffff-prefix to avoid colliding with seed data (1111/2222/3333 prefixes).
const T1 = 'ffff0001-0000-0000-0000-000000000001';
const T2 = 'ffff0002-0000-0000-0000-000000000002';
const SVC1 = 'ffff0001-1111-0000-0000-000000000001';
const STF1 = 'ffff0001-2222-0000-0000-000000000001';
const CUS1 = 'ffff0001-3333-0000-0000-000000000001';
const BKG1 = 'ffff0001-4444-0000-0000-000000000001';

describe.skipIf(!ENABLED)('Drizzle repositories (integration with local Postgres)', () => {
  let db: DatabaseClient;
  let endClient: () => Promise<void>;
  let tenantRepo: DrizzleTenantRepository;
  let serviceRepo: DrizzleServiceRepository;
  let staffRepo: DrizzleStaffRepository;
  let customerRepo: DrizzleCustomerRepository;
  let bookingRepo: DrizzleBookingRepository;

  beforeAll(async () => {
    if (!DB_URL) throw new Error('DATABASE_URL required');
    const handle = createClientWithHandle(DB_URL);
    db = handle.db;
    endClient = handle.end;
    tenantRepo = new DrizzleTenantRepository(db);
    serviceRepo = new DrizzleServiceRepository(db);
    staffRepo = new DrizzleStaffRepository(db);
    customerRepo = new DrizzleCustomerRepository(db);
    bookingRepo = new DrizzleBookingRepository(db);

    await cleanup(db);
  });

  afterAll(async () => {
    if (db) await cleanup(db);
    if (endClient) await endClient();
  });

  it('Tenant: save → findById → findBySlug round-trip preserves JSONB settings', async () => {
    const tenant = Tenant.create({
      id: TenantId(T1),
      slug: 'fff-test-salon',
      name: 'Test Salon FF',
      type: 'salon_toc',
      workingHours: { mon: { open: '08:00', close: '20:00' }, sun: null },
      peakWindows: [{ day: 'sat', from: '14:00', to: '22:00' }],
      slotMinutes: 30,
      timezone: 'Asia/Ho_Chi_Minh',
      cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
    });
    await tenantRepo.save(tenant);

    const byId = await tenantRepo.findById(TenantId(T1));
    expect(byId).not.toBeNull();
    expect(byId!.toJSON().slug).toBe('fff-test-salon');
    expect(byId!.toJSON().workingHours.mon?.open).toBe('08:00');
    expect(byId!.toJSON().peakWindows[0]?.from).toBe('14:00');
    expect(byId!.timezone).toBe('Asia/Ho_Chi_Minh');

    const bySlug = await tenantRepo.findBySlug('fff-test-salon');
    expect(bySlug?.toJSON().id).toBe(T1);
  });

  it('Tenant: save is idempotent (onConflictDoUpdate)', async () => {
    const t1 = Tenant.create({
      id: TenantId(T1),
      slug: 'fff-test-salon',
      name: 'Initial Name',
      type: 'salon_toc',
      workingHours: { mon: { open: '08:00', close: '20:00' } },
      peakWindows: [],
      slotMinutes: 30,
      timezone: 'Asia/Ho_Chi_Minh',
      cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
    });
    await tenantRepo.save(t1);

    const t2 = Tenant.create({
      id: TenantId(T1),
      slug: 'fff-test-salon',
      name: 'Updated Name',
      type: 'salon_toc',
      workingHours: { mon: { open: '09:00', close: '21:00' } },
      peakWindows: [],
      slotMinutes: 60,
      timezone: 'Asia/Ho_Chi_Minh',
      cancelPolicy: { refundFullHoursBefore: 12, finePercent: 30 },
    });
    await tenantRepo.save(t2);

    const found = await tenantRepo.findById(TenantId(T1));
    expect(found!.toJSON().name).toBe('Updated Name');
    expect(found!.toJSON().slotMinutes).toBe(60);
    expect(found!.toJSON().workingHours.mon?.open).toBe('09:00');
  });

  it('Service: cross-tenant findById returns null when tenantId mismatches', async () => {
    const t2 = Tenant.create({
      id: TenantId(T2),
      slug: 'fff-test-spa',
      name: 'Test Spa FF',
      type: 'spa_skincare',
      workingHours: { mon: { open: '08:00', close: '20:00' } },
      peakWindows: [],
      slotMinutes: 60,
      timezone: 'Asia/Ho_Chi_Minh',
      cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
    });
    await tenantRepo.save(t2);

    const svc = Service.create({
      id: ServiceId(SVC1),
      tenantId: TenantId(T1),
      name: 'Cắt + Gội Test',
      durationMinutes: 60,
      priceVnd: 250_000,
      depositNormalVnd: 0,
      depositPeakVnd: 50_000,
      isActive: true,
    });
    await serviceRepo.save(svc);

    const correct = await serviceRepo.findById(ServiceId(SVC1), TenantId(T1));
    expect(correct).not.toBeNull();

    const cross = await serviceRepo.findById(ServiceId(SVC1), TenantId(T2));
    expect(cross).toBeNull();
  });

  it('Staff: save persists workingHours JSONB + serviceIds junction', async () => {
    await staffRepo.save({
      id: StaffId(STF1),
      tenantId: TenantId(T1),
      name: 'Test Staff FF',
      photoUrl: undefined,
      workingHours: { mon: { open: '09:00', close: '19:00' } },
      serviceIds: [ServiceId(SVC1)],
      isActive: true,
    });

    const byId = await staffRepo.findById(StaffId(STF1), TenantId(T1));
    expect(byId).not.toBeNull();
    expect(byId!.name).toBe('Test Staff FF');
    expect(byId!.workingHours.mon?.open).toBe('09:00');
    expect(byId!.serviceIds).toContain(SVC1);

    const byService = await staffRepo.findByService(TenantId(T1), SVC1);
    expect(byService.map((s) => s.id)).toContain(STF1);
  });

  it('Customer: findByPhoneHash is tenant-scoped (same hash different tenant returns null)', async () => {
    const c = Customer.create({
      id: CustomerId(CUS1),
      tenantId: TenantId(T1),
      name: 'Test Customer FF',
      phoneHash: 'fff-shared-hash',
      phoneMasked: '09***ffff',
      zaloId: null,
      tier: 'normal',
      lifetimeSpendVnd: 0,
      totalBookings: 0,
    });
    await customerRepo.save(c);

    const sameTenant = await customerRepo.findByPhoneHash(TenantId(T1), 'fff-shared-hash');
    expect(sameTenant).not.toBeNull();
    expect(sameTenant!.toJSON().name).toBe('Test Customer FF');

    const otherTenant = await customerRepo.findByPhoneHash(TenantId(T2), 'fff-shared-hash');
    expect(otherTenant).toBeNull();
  });

  it('Booking: save → findById round-trip preserves slot times + status', async () => {
    const startAt = new Date('2026-07-01T10:00:00+07:00');
    const b = Booking.reconstruct({
      id: BookingId(BKG1),
      tenantId: TenantId(T1),
      customerId: CustomerId(CUS1),
      serviceId: ServiceId(SVC1),
      staffId: StaffId(STF1),
      slot: Slot.create(startAt, 60),
      status: 'confirmed',
      isPeakSlot: false,
      depositRequiredVnd: 0,
      depositPaidVnd: 0,
      depositPaidAt: null,
      finalPriceVnd: null,
      checkedInAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelReason: null,
      createdAt: new Date('2026-06-15T00:00:00+07:00'),
    });
    await bookingRepo.save(b);

    const found = await bookingRepo.findById(BookingId(BKG1));
    expect(found).not.toBeNull();
    expect(found!.status).toBe('confirmed');
    expect(found!.toJSON().slot.startAt.toISOString()).toBe(startAt.toISOString());
  });

  it('Booking findOverlapping excludes cancelled/no_show', async () => {
    const startAt = new Date('2026-07-02T10:00:00+07:00');
    const id2 = 'ffff0001-4444-0000-0000-000000000002';
    const id3 = 'ffff0001-4444-0000-0000-000000000003';

    const confirmed = Booking.reconstruct({
      id: BookingId(id2),
      tenantId: TenantId(T1),
      customerId: CustomerId(CUS1),
      serviceId: ServiceId(SVC1),
      staffId: StaffId(STF1),
      slot: Slot.create(startAt, 60),
      status: 'confirmed',
      isPeakSlot: false,
      depositRequiredVnd: 0,
      depositPaidVnd: 0,
      depositPaidAt: null,
      finalPriceVnd: null,
      checkedInAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelReason: null,
      createdAt: new Date(),
    });
    const cancelled = Booking.reconstruct({
      id: BookingId(id3),
      tenantId: TenantId(T1),
      customerId: CustomerId(CUS1),
      serviceId: ServiceId(SVC1),
      staffId: StaffId(STF1),
      slot: Slot.create(startAt, 60),
      status: 'cancelled',
      isPeakSlot: false,
      depositRequiredVnd: 0,
      depositPaidVnd: 0,
      depositPaidAt: null,
      finalPriceVnd: null,
      checkedInAt: null,
      completedAt: null,
      cancelledAt: new Date(),
      cancelReason: 'test',
      createdAt: new Date(),
    });
    await bookingRepo.save(confirmed);
    await bookingRepo.save(cancelled);

    const overlaps = await bookingRepo.findOverlapping({
      tenantId: TenantId(T1),
      staffId: StaffId(STF1),
      startAt: new Date(startAt.getTime() + 30 * 60_000),
      endAt: new Date(startAt.getTime() + 90 * 60_000),
    });
    expect(overlaps.map((b) => b.toJSON().id)).toContain(id2);
    expect(overlaps.map((b) => b.toJSON().id)).not.toContain(id3);
  });
});

async function cleanup(db: DatabaseClient): Promise<void> {
  await db.delete(bookings).where(eq(bookings.tenantId, T1));
  await db.delete(bookings).where(eq(bookings.tenantId, T2));
  await db.delete(staffServices).where(eq(staffServices.staffId, STF1));
  await db.delete(staff).where(eq(staff.tenantId, T1));
  await db.delete(staff).where(eq(staff.tenantId, T2));
  await db.delete(services).where(eq(services.tenantId, T1));
  await db.delete(services).where(eq(services.tenantId, T2));
  await db.delete(customers).where(eq(customers.tenantId, T1));
  await db.delete(customers).where(eq(customers.tenantId, T2));
  await db.delete(tenants).where(eq(tenants.id, T1));
  await db.delete(tenants).where(eq(tenants.id, T2));
}
