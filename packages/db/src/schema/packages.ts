import { integer, pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { bookings } from './bookings';
import { customers } from './customers';
import { services } from './services';
import { tenants } from './tenants';

export const packages = pgTable(
  'packages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict' }),
    totalSessions: integer('total_sessions').notNull(),
    priceVnd: integer('price_vnd').notNull(),
    validityDays: integer('validity_days').notNull().default(365),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('packages_tenant_idx').on(table.tenantId),
  }),
);

export const customerPackages = pgTable(
  'customer_packages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    packageId: uuid('package_id')
      .notNull()
      .references(() => packages.id, { onDelete: 'restrict' }),
    sessionsRemaining: integer('sessions_remaining').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantCustomerIdx: index('customer_packages_tenant_customer_idx').on(
      table.tenantId,
      table.customerId,
    ),
  }),
);

export const packageUsages = pgTable(
  'package_usages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    customerPackageId: uuid('customer_package_id')
      .notNull()
      .references(() => customerPackages.id, { onDelete: 'cascade' }),
    bookingId: uuid('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    usedAt: timestamp('used_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantBookingIdx: index('package_usages_tenant_booking_idx').on(table.tenantId, table.bookingId),
  }),
);

export type Package = typeof packages.$inferSelect;
export type PackageInsert = typeof packages.$inferInsert;
export type CustomerPackage = typeof customerPackages.$inferSelect;
export type PackageUsage = typeof packageUsages.$inferSelect;
