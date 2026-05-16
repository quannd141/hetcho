import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryBookingRepository,
  InMemoryCustomerRepository,
  InMemoryServiceRepository,
  InMemoryStaffRepository,
  InMemoryTenantRepository,
  MockAuditLogger,
  MockNotificationSender,
  MockPaymentGateway,
  seedDemoTenants,
} from '../index.js';
import { CreateBookingUseCase, CancelBookingUseCase } from '@hetcho/application';
import { Customer } from '@hetcho/domain';
import { CustomerId, ServiceId, TenantId } from '@hetcho/shared';

describe('Cross-tenant isolation (integration with seed)', () => {
  let repos: {
    tenants: InMemoryTenantRepository;
    services: InMemoryServiceRepository;
    staff: InMemoryStaffRepository;
    customers: InMemoryCustomerRepository;
    bookings: InMemoryBookingRepository;
  };
  let audit: MockAuditLogger;
  let payment: MockPaymentGateway;
  let notification: MockNotificationSender;
  let createBooking: CreateBookingUseCase;
  let cancelBooking: CancelBookingUseCase;
  let salon: Awaited<ReturnType<typeof seedDemoTenants>>['salonHang'];
  let spa: Awaited<ReturnType<typeof seedDemoTenants>>['spaMai'];
  let nail: Awaited<ReturnType<typeof seedDemoTenants>>['nailLinh'];
  let idCounter = 0;

  beforeEach(async () => {
    repos = {
      tenants: new InMemoryTenantRepository(),
      services: new InMemoryServiceRepository(),
      staff: new InMemoryStaffRepository(),
      customers: new InMemoryCustomerRepository(),
      bookings: new InMemoryBookingRepository(),
    };
    audit = new MockAuditLogger();
    payment = new MockPaymentGateway();
    notification = new MockNotificationSender();
    idCounter = 0;

    const seeded = await seedDemoTenants(repos);
    salon = seeded.salonHang;
    spa = seeded.spaMai;
    nail = seeded.nailLinh;

    const deps = {
      tenants: repos.tenants,
      services: repos.services,
      customers: repos.customers,
      bookings: repos.bookings,
      payment,
      notification,
      audit,
      unitOfWork: {
        run: async <T>(work: Parameters<typeof deps.unitOfWork.run<T>>[0]) =>
          work({ bookings: repos.bookings, customers: repos.customers, audit }),
      },
      now: () => new Date('2026-06-01T08:00:00+07:00'),
      generateId: () => `00000000-0000-0000-0000-${String(++idCounter).padStart(12, '0')}`,
    };
    createBooking = new CreateBookingUseCase(deps);
    cancelBooking = new CancelBookingUseCase(deps);
  });

  async function seedCustomer(tenantId: TenantId, idSuffix: string) {
    const customerId = CustomerId(`00000000-0000-0000-0000-${idSuffix}`);
    await repos.customers.save(
      Customer.create({
        id: customerId,
        tenantId,
        name: 'Test Customer',
        phoneHash: `hash:${idSuffix}`,
        phoneMasked: '09***test',
        zaloId: null,
        tier: 'normal',
        lifetimeSpendVnd: 0,
        totalBookings: 0,
      }),
    );
    return customerId;
  }

  it('seedDemoTenants creates 3 isolated tenants', async () => {
    expect(repos.tenants.size).toBe(3);
    expect(await repos.tenants.findBySlug('salon-hang')).not.toBeNull();
    expect(await repos.tenants.findBySlug('mai-spa')).not.toBeNull();
    expect(await repos.tenants.findBySlug('linh-nail')).not.toBeNull();
  });

  it('services findById rejects cross-tenant access (salon service via spa tenantId returns null)', async () => {
    const salonServiceId = salon.serviceIds[0]!;
    expect(await repos.services.findById(salonServiceId, salon.tenantId)).not.toBeNull();
    expect(await repos.services.findById(salonServiceId, spa.tenantId)).toBeNull();
    expect(await repos.services.findById(salonServiceId, nail.tenantId)).toBeNull();
  });

  it('staff findByService respects tenant scope', async () => {
    const salonStaffForFirstService = await repos.staff.findByService(
      salon.tenantId,
      salon.serviceIds[0]!,
    );
    expect(salonStaffForFirstService.length).toBeGreaterThan(0);

    const spaStaffForSalonService = await repos.staff.findByService(
      spa.tenantId,
      salon.serviceIds[0]!,
    );
    expect(spaStaffForSalonService).toHaveLength(0);
  });

  it('createBooking with mixed tenantId/serviceId fails (cross-tenant rejected)', async () => {
    const customerId = await seedCustomer(salon.tenantId, 'aaaa11111111');

    await expect(
      createBooking.execute({
        tenantId: spa.tenantId, // wrong tenant
        customerId,
        serviceId: salon.serviceIds[0]!, // salon service
        staffId: salon.staffIds[0]!,
        startAt: new Date('2026-06-01T10:00:00+07:00').toISOString(),
      }),
    ).rejects.toThrow(); // service not found in spa tenant
  });

  it('bookings created in salon do NOT appear in spa findOverlapping', async () => {
    const customerId = await seedCustomer(salon.tenantId, 'bbbb22222222');

    await createBooking.execute({
      tenantId: salon.tenantId,
      customerId,
      serviceId: salon.serviceIds[0]!,
      staffId: salon.staffIds[0]!,
      startAt: new Date('2026-06-02T10:00:00+07:00').toISOString(),
    });

    const salonOverlap = await repos.bookings.findOverlapping({
      tenantId: salon.tenantId,
      staffId: salon.staffIds[0]!,
      startAt: new Date('2026-06-02T10:00:00+07:00'),
      endAt: new Date('2026-06-02T11:00:00+07:00'),
    });
    expect(salonOverlap.length).toBeGreaterThan(0);

    const spaOverlap = await repos.bookings.findOverlapping({
      tenantId: spa.tenantId,
      staffId: salon.staffIds[0]!,
      startAt: new Date('2026-06-02T10:00:00+07:00'),
      endAt: new Date('2026-06-02T11:00:00+07:00'),
    });
    expect(spaOverlap).toHaveLength(0);
  });

  it('full booking flow on nail tenant — peak slot triggers deposit', async () => {
    const customerId = await seedCustomer(nail.tenantId, 'cccc33333333');

    const result = await createBooking.execute({
      tenantId: nail.tenantId,
      customerId,
      serviceId: nail.serviceIds[1]!, // Nail vẽ thiết kế 120 min
      staffId: nail.staffIds[0]!,
      startAt: new Date('2026-06-06T15:00:00+07:00').toISOString(), // Saturday 15:00 = peak
      returnUrl: 'https://hetcho.vn/callback',
    });

    expect(result.requiresPayment).toBe(true);
    expect(result.status).toBe('pending');
    expect(result.paymentUrl).toBeTruthy();
    expect(payment.captured).toHaveLength(1);
    expect(payment.captured[0]!.amountVnd).toBe(100_000); // peak deposit for service #1
  });

  it('full booking flow off-peak — no deposit, instant confirmation', async () => {
    const customerId = await seedCustomer(salon.tenantId, 'dddd44444444');

    const result = await createBooking.execute({
      tenantId: salon.tenantId,
      customerId,
      serviceId: salon.serviceIds[0]!, // Cắt + Gội — depositNormal = 0
      staffId: salon.staffIds[0]!,
      startAt: new Date('2026-06-01T10:00:00+07:00').toISOString(), // Monday off-peak
    });

    expect(result.requiresPayment).toBe(false);
    expect(result.status).toBe('confirmed');
    expect(notification.sent).toHaveLength(1);
    expect(notification.sent[0]!.type).toBe('confirmation');
  });

  it('audit log captures cross-tenant scope for created bookings', async () => {
    const salonCustomer = await seedCustomer(salon.tenantId, 'eeee55555555');
    const spaCustomer = await seedCustomer(spa.tenantId, 'ffff66666666');

    await createBooking.execute({
      tenantId: salon.tenantId,
      customerId: salonCustomer,
      serviceId: salon.serviceIds[0]!,
      staffId: salon.staffIds[0]!,
      startAt: new Date('2026-06-01T10:00:00+07:00').toISOString(),
    });
    await createBooking.execute({
      tenantId: spa.tenantId,
      customerId: spaCustomer,
      serviceId: spa.serviceIds[0]!, // 800k spa treatment — normal deposit 100k
      staffId: spa.staffIds[0]!,
      startAt: new Date('2026-06-02T10:00:00+07:00').toISOString(),
      returnUrl: 'https://hetcho.vn/callback',
    });

    const salonEvents = audit.events.filter((e) => e.tenantId === salon.tenantId);
    const spaEvents = audit.events.filter((e) => e.tenantId === spa.tenantId);
    expect(salonEvents.length).toBe(1);
    expect(spaEvents.length).toBe(1);
    expect(salonEvents[0]!.action).toBe('booking.created');
    expect(spaEvents[0]!.action).toBe('booking.created');
  });
});
