import 'server-only';
import { randomUUID } from 'node:crypto';
import type { TenantId } from '@hetcho/shared';
import type { BookingDependencies, UnitOfWork } from '@hetcho/application';
import {
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

interface Container {
  tenants: InMemoryTenantRepository;
  services: InMemoryServiceRepository;
  staff: InMemoryStaffRepository;
  customers: InMemoryCustomerRepository;
  bookings: InMemoryBookingRepository;
  payment: MockPaymentGateway;
  notification: MockNotificationSender;
  audit: MockAuditLogger;
  broadcaster: MockRealtimeBroadcaster;
  bookingDeps: BookingDependencies;
  unitOfWork: UnitOfWork;
  seeded: Promise<void>;
}

declare global {
  // eslint-disable-next-line no-var
  var __hetcho_container: Container | undefined;
}

function build(): Container {
  const tenants = new InMemoryTenantRepository();
  const services = new InMemoryServiceRepository();
  const staff = new InMemoryStaffRepository();
  const customers = new InMemoryCustomerRepository();
  const bookings = new InMemoryBookingRepository();
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

  const seeded = seedDemoTenants({ tenants, services, staff, customers }).then(() => undefined);

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
