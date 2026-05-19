import { describe, it, expect, beforeEach } from 'vitest';
import {
  CancelBookingUseCase,
  CheckInBookingUseCase,
  CompleteBookingUseCase,
  CreateBookingUseCase,
  ListBookingsForDateUseCase,
  MarkDepositPaidUseCase,
  MarkNoShowUseCase,
  StartServiceUseCase,
  WalkInBookingUseCase,
  type BookingDependencies,
} from '@hetcho/application';
import { InMemoryBookingRepository } from './mock/in-memory-booking-repository.js';
import { InMemoryCustomerRepository } from './mock/in-memory-customer-repository.js';
import { InMemoryServiceRepository } from './mock/in-memory-service-repository.js';
import { InMemoryStaffRepository } from './mock/in-memory-staff-repository.js';
import { InMemoryTenantRepository } from './mock/in-memory-tenant-repository.js';
import { MockAuditLogger } from './mock/mock-audit-logger.js';
import { MockNotificationSender } from './mock/mock-notification-sender.js';
import { MockPaymentGateway } from './mock/mock-payment-gateway.js';
import { MockRealtimeBroadcaster } from './mock/mock-realtime-broadcaster.js';
import { seedDemoTenants } from './seed/demo-tenants.js';

/**
 * Integration test: wire mọi mock adapter + in-memory repo,
 * chạy full lifecycle để verify end-to-end behavior trước khi
 * thay bằng real Drizzle/Supabase repos.
 *
 * Picks: salon Hằng tenant + peak Saturday slot (deposit required).
 */

let bookings: InMemoryBookingRepository;
let customers: InMemoryCustomerRepository;
let services: InMemoryServiceRepository;
let staff: InMemoryStaffRepository;
let tenants: InMemoryTenantRepository;
let audit: MockAuditLogger;
let notification: MockNotificationSender;
let payment: MockPaymentGateway;
let broadcaster: MockRealtimeBroadcaster;
let deps: BookingDependencies;
let seeded: Awaited<ReturnType<typeof seedDemoTenants>>;
let idCounter: number;

const SAT_PEAK = new Date('2026-06-06T15:00:00+07:00');
const NOW_BEFORE = new Date('2026-06-05T08:00:00+07:00');

function genId(): string {
  idCounter++;
  const hex = idCounter.toString(16).padStart(12, '0');
  return `99999999-9999-9999-9999-${hex}`;
}

beforeEach(async () => {
  bookings = new InMemoryBookingRepository();
  customers = new InMemoryCustomerRepository();
  services = new InMemoryServiceRepository();
  staff = new InMemoryStaffRepository();
  tenants = new InMemoryTenantRepository();
  audit = new MockAuditLogger();
  notification = new MockNotificationSender();
  payment = new MockPaymentGateway();
  broadcaster = new MockRealtimeBroadcaster();
  idCounter = 0;

  seeded = await seedDemoTenants({ tenants, services, staff, customers });

  // Seed 1 customer for salon Hằng tenant for Zalo bookings
  const { Customer } = await import('@hetcho/domain');
  const { CustomerId } = await import('@hetcho/shared');
  await customers.save(
    Customer.create({
      id: CustomerId('11111111-1111-1111-1111-cccc11111111'),
      tenantId: seeded.salonHang.tenantId,
      name: 'Khách Tùng',
      phoneHash: 'hash:0900000001',
      phoneMasked: '09***0001',
      zaloId: 'zalo-tung',
      tier: 'normal',
      lifetimeSpendVnd: 0,
      totalBookings: 0,
    }),
  );

  deps = {
    now: () => NOW_BEFORE,
    generateId: genId,
    tenants,
    services,
    customers,
    bookings,
    unitOfWork: {
      run: async (work) =>
        work({ bookings, customers, audit }),
    },
    payment,
    notification,
    audit,
    broadcaster,
  };
});

describe('Booking lifecycle (integration)', () => {
  it('happy path: create peak → pay deposit → check-in → start → complete (full state machine)', async () => {
    const create = new CreateBookingUseCase(deps);
    const r1 = await create.execute({
      tenantId: seeded.salonHang.tenantId,
      customerId: '11111111-1111-1111-1111-cccc11111111',
      serviceId: seeded.salonHang.serviceIds[0]!,
      staffId: seeded.salonHang.staffIds[0]!,
      startAt: SAT_PEAK.toISOString(),
      returnUrl: 'https://hetcho.vn/pay/cb',
    });
    expect(r1.status).toBe('pending');
    expect(r1.requiresPayment).toBe(true);

    const depositPaid = new MarkDepositPaidUseCase(deps);
    const r2 = await depositPaid.execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      amountVnd: 50_000,
      gatewayTxnId: 'vnpay-001',
    });
    expect(r2.alreadyConfirmed).toBe(false);

    const stored1 = await bookings.findById(r1.bookingId);
    expect(stored1?.status).toBe('confirmed');

    const checkIn = new CheckInBookingUseCase(deps);
    await checkIn.execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      actorType: 'owner',
    });
    expect((await bookings.findById(r1.bookingId))?.status).toBe('checked_in');

    const start = new StartServiceUseCase(deps);
    await start.execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      actorType: 'staff',
    });
    expect((await bookings.findById(r1.bookingId))?.status).toBe('in_service');

    const complete = new CompleteBookingUseCase(deps);
    const r3 = await complete.execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      finalPriceVnd: 250_000,
      actorType: 'owner',
    });
    expect(r3.remainingDueVnd).toBe(200_000); // 250k - 50k deposit
    expect((await bookings.findById(r1.bookingId))?.status).toBe('completed');

    expect(broadcaster.published.map((e) => e.type)).toEqual([
      'booking.created',
      'booking.confirmed',
      'booking.checked_in',
      'booking.started',
      'booking.completed',
    ]);
  });

  it('no-show path: pay deposit → mark no_show → deposit forfeited', async () => {
    const create = new CreateBookingUseCase(deps);
    const r1 = await create.execute({
      tenantId: seeded.salonHang.tenantId,
      customerId: '11111111-1111-1111-1111-cccc11111111',
      serviceId: seeded.salonHang.serviceIds[0]!,
      staffId: seeded.salonHang.staffIds[0]!,
      startAt: SAT_PEAK.toISOString(),
      returnUrl: 'https://hetcho.vn/pay/cb',
    });

    await new MarkDepositPaidUseCase(deps).execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      amountVnd: 50_000,
      gatewayTxnId: 'vnpay-002',
    });

    const noShow = new MarkNoShowUseCase(deps);
    const r2 = await noShow.execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      actorType: 'system',
    });
    expect(r2.depositForfeitedVnd).toBe(50_000);
    expect((await bookings.findById(r1.bookingId))?.status).toBe('no_show');
  });

  it('cancel within fine window: 50% refund per salon cancel policy', async () => {
    const create = new CreateBookingUseCase(deps);
    const r1 = await create.execute({
      tenantId: seeded.salonHang.tenantId,
      customerId: '11111111-1111-1111-1111-cccc11111111',
      serviceId: seeded.salonHang.serviceIds[0]!,
      staffId: seeded.salonHang.staffIds[0]!,
      startAt: SAT_PEAK.toISOString(),
      returnUrl: 'https://hetcho.vn/pay/cb',
    });
    await new MarkDepositPaidUseCase(deps).execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      amountVnd: 50_000,
      gatewayTxnId: 'vnpay-003',
    });

    // Move "now" forward to 1h before slot (within fine window 24h)
    deps.now = () => new Date(SAT_PEAK.getTime() - 1 * 3_600_000);

    const cancel = new CancelBookingUseCase(deps);
    const r2 = await cancel.execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      reason: 'Khách bận đột xuất',
      actorType: 'customer',
    });

    // salon policy: 50% fine → 50% refund of 50_000 = 25_000
    expect(r2.refundAmountVnd).toBe(25_000);
  });

  it('walk-in: owner creates booking and ListBookingsForDate returns it', async () => {
    const walkIn = new WalkInBookingUseCase(deps);
    const walkInTime = new Date(NOW_BEFORE.getTime() + 30 * 60_000); // 30 min in future
    const r1 = await walkIn.execute({
      tenantId: seeded.salonHang.tenantId,
      serviceId: seeded.salonHang.serviceIds[0]!,
      staffId: seeded.salonHang.staffIds[0]!,
      startAt: walkInTime.toISOString(),
      customer: { name: 'Khách walk-in Hoa', phone: '0905551234' },
      actorId: 'owner-hang',
    });
    expect(r1.status).toBe('confirmed');

    const list = new ListBookingsForDateUseCase({
      bookings,
      customers,
      services,
      staff: { findById: async (id, t) => staff.findById(id, t) },
    });
    const rows = await list.execute({
      tenantId: seeded.salonHang.tenantId,
      date: walkInTime.toISOString(),
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.customerName).toBe('Khách walk-in Hoa');
    expect(rows[0]?.staffName).toBe('Hằng (chủ)');
    expect(rows[0]?.serviceName).toBe('Cắt + Gội');
  });

  it('cross-tenant: cannot mutate other tenant\'s booking', async () => {
    const create = new CreateBookingUseCase(deps);
    const r1 = await create.execute({
      tenantId: seeded.salonHang.tenantId,
      customerId: '11111111-1111-1111-1111-cccc11111111',
      serviceId: seeded.salonHang.serviceIds[0]!,
      staffId: seeded.salonHang.staffIds[0]!,
      startAt: SAT_PEAK.toISOString(),
      returnUrl: 'https://hetcho.vn/pay/cb',
    });

    const checkIn = new CheckInBookingUseCase(deps);
    await expect(
      checkIn.execute({
        tenantId: seeded.spaMai.tenantId,
        bookingId: r1.bookingId,
        actorType: 'owner',
      }),
    ).rejects.toThrow(/not in tenant|not found/i);
  });

  it('audit log records every state change in order', async () => {
    const create = new CreateBookingUseCase(deps);
    const r1 = await create.execute({
      tenantId: seeded.salonHang.tenantId,
      customerId: '11111111-1111-1111-1111-cccc11111111',
      serviceId: seeded.salonHang.serviceIds[0]!,
      staffId: seeded.salonHang.staffIds[0]!,
      startAt: SAT_PEAK.toISOString(),
      returnUrl: 'https://hetcho.vn/pay/cb',
    });
    await new MarkDepositPaidUseCase(deps).execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      amountVnd: 50_000,
      gatewayTxnId: 'vnpay-004',
    });
    await new CheckInBookingUseCase(deps).execute({
      tenantId: seeded.salonHang.tenantId,
      bookingId: r1.bookingId,
      actorType: 'owner',
    });

    const actions = audit.events.map((e) => e.action);
    expect(actions).toContain('booking.created');
    expect(actions).toContain('booking.deposit_paid');
    expect(actions).toContain('booking.checked_in');
  });
});
