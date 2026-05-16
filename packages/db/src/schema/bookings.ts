import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { bookingStatusEnum } from './enums.js';
import { customers } from './customers.js';
import { services } from './services.js';
import { staff } from './staff.js';
import { tenants } from './tenants.js';

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'restrict' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict' }),
    staffId: uuid('staff_id')
      .notNull()
      .references(() => staff.id, { onDelete: 'restrict' }),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),
    status: bookingStatusEnum('status').notNull().default('pending'),
    isPeakSlot: boolean('is_peak_slot').notNull().default(false),
    depositRequiredVnd: integer('deposit_required_vnd').notNull().default(0),
    depositPaidVnd: integer('deposit_paid_vnd').notNull().default(0),
    depositPaidAt: timestamp('deposit_paid_at', { withTimezone: true }),
    finalPriceVnd: integer('final_price_vnd'),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelReason: text('cancel_reason'),
    packageUsageId: uuid('package_usage_id'),
    notes: text('notes'),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantStaffStartIdx: index('bookings_tenant_staff_start_idx').on(
      table.tenantId,
      table.staffId,
      table.startAt,
    ),
    tenantCustomerIdx: index('bookings_tenant_customer_idx').on(table.tenantId, table.customerId),
    tenantStatusIdx: index('bookings_tenant_status_idx').on(table.tenantId, table.status),
  }),
);

export type Booking = typeof bookings.$inferSelect;
export type BookingInsert = typeof bookings.$inferInsert;
