import { integer, pgTable, text, timestamp, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { customerTierEnum } from './enums';
import { tenants } from './tenants';

export const customers = pgTable(
  'customers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    phoneHash: text('phone_hash').notNull(),
    phoneMasked: text('phone_masked').notNull(),
    zaloId: text('zalo_id'),
    tier: customerTierEnum('tier').notNull().default('normal'),
    lifetimeSpendVnd: integer('lifetime_spend_vnd').notNull().default(0),
    totalBookings: integer('total_bookings').notNull().default(0),
    lastBookingAt: timestamp('last_booking_at', { withTimezone: true }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantPhoneIdx: uniqueIndex('customers_tenant_phone_idx').on(table.tenantId, table.phoneHash),
    tenantZaloIdx: index('customers_tenant_zalo_idx').on(table.tenantId, table.zaloId),
  }),
);

export type Customer = typeof customers.$inferSelect;
export type CustomerInsert = typeof customers.$inferInsert;
