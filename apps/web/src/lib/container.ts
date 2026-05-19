import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Tenant, BookingRepository } from '@hetcho/domain';
import type { TenantId } from '@hetcho/shared';
import type {
  BookingDependencies,
  CustomerRepository,
  ServiceWriteRepository,
  StaffWriteRepository,
  TenantWriteRepository,
  UnitOfWork,
} from '@hetcho/application';
import {
  DrizzleBookingRepository,
  DrizzleCustomerRepository,
  DrizzleServiceRepository,
  DrizzleStaffRepository,
  DrizzleTenantRepository,
  InMemoryBookingRepository,
  InMemoryCustomerRepository,
  InMemoryServiceRepository,
  InMemoryStaffRepository,
  InMemoryTenantRepository,
  MockAuditLogger,
  MockNotificationSender,
  MockPaymentGateway,
  MockRealtimeBroadcaster,
  seedDemoTenants,
} from '@hetcho/infrastructure';
import { createClient } from '@hetcho/db';

interface TenantRepo extends TenantWriteRepository {
  findAll(): Promise<Tenant[]>;
}

interface Container {
  tenants: TenantRepo;
  services: ServiceWriteRepository;
  staff: StaffWriteRepository;
  customers: CustomerRepository & { findByPhoneHash(tenantId: TenantId, hash: string): Promise<unknown> };
  bookings: BookingRepository;
  payment: MockPaymentGateway;
  notification: MockNotificationSender;
  audit: MockAuditLogger;
  broadcaster: MockRealtimeBroadcaster;
  bookingDeps: BookingDependencies;
  unitOfWork: UnitOfWork;
  seeded: Promise<void>;
  driver: 'mock' | 'drizzle';
}

declare global {
  // eslint-disable-next-line no-var
  var __hetcho_container: Container | undefined;
}

function build(): Container {
  const useRealDb = process.env.USE_REAL_DB === 'true';
  const driver: 'mock' | 'drizzle' = useRealDb ? 'drizzle' : 'mock';

  let tenants: TenantRepo;
  let services: ServiceWriteRepository;
  let staff: StaffWriteRepository;
  let customers: Container['customers'];
  let bookings: BookingRepository;
  let seeded: Promise<void>;

  if (useRealDb) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('USE_REAL_DB=true but DATABASE_URL not set');
    const db = createClient(url);
    tenants = new DrizzleTenantRepository(db);
    services = new DrizzleServiceRepository(db);
    staff = new DrizzleStaffRepository(db);
    customers = new DrizzleCustomerRepository(db) as Container['customers'];
    bookings = new DrizzleBookingRepository(db);

    seeded = (async () => {
      const existing = await tenants.findBySlug('salon-hang');
      if (existing) {
        console.log('[container:drizzle] demo tenants already seeded — skip');
        return;
      }
      console.log('[container:drizzle] seeding demo tenants…');
      await seedDemoTenants({
        tenants: tenants as never,
        services: services as never,
        staff: staff as never,
        customers: customers as never,
      });
      console.log('[container:drizzle] seed done');
    })();
  } else {
    tenants = new InMemoryTenantRepository();
    services = new InMemoryServiceRepository();
    staff = new InMemoryStaffRepository();
    customers = new InMemoryCustomerRepository() as Container['customers'];
    bookings = new InMemoryBookingRepository();
    seeded = seedDemoTenants({
      tenants: tenants as never,
      services: services as never,
      staff: staff as never,
      customers: customers as never,
    }).then(() => undefined);
  }

  const payment = new MockPaymentGateway();
  const notification = new MockNotificationSender();
  const audit = new MockAuditLogger();
  const broadcaster = new MockRealtimeBroadcaster();

  const unitOfWork: UnitOfWork = {
    async run(work) {
      return work({ bookings, customers, audit });
    },
  };

  const bookingDeps: BookingDependencies = {
    tenants,
    services,
    customers,
    bookings,
    payment,
    notification,
    audit,
    unitOfWork,
    broadcaster,
    now: () => new Date(),
    generateId: () => randomUUID(),
  };

  console.log(`[container] driver=${driver}`);

  return {
    tenants,
    services,
    staff,
    customers,
    bookings,
    payment,
    notification,
    audit,
    broadcaster,
    bookingDeps,
    unitOfWork,
    seeded,
    driver,
  };
}

export function getContainer(): Container {
  if (!globalThis.__hetcho_container) {
    globalThis.__hetcho_container = build();
  }
  return globalThis.__hetcho_container;
}

export async function getContainerReady(): Promise<Container> {
  const c = getContainer();
  await c.seeded;
  return c;
}

export async function resolveTenantIdBySlug(slug: string): Promise<TenantId | null> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(slug);
  return tenant?.id ?? null;
}
