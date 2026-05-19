import { jsonb, pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { notificationChannelEnum, notificationStatusEnum } from './enums';
import { customers } from './customers';
import { tenants } from './tenants';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    channel: notificationChannelEnum('channel').notNull(),
    templateId: text('template_id'),
    payload: jsonb('payload').notNull().default({}),
    status: notificationStatusEnum('status').notNull().default('queued'),
    failureReason: text('failure_reason'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantStatusIdx: index('notifications_tenant_status_idx').on(table.tenantId, table.status),
    tenantCustomerIdx: index('notifications_tenant_customer_idx').on(
      table.tenantId,
      table.customerId,
    ),
  }),
);

export type Notification = typeof notifications.$inferSelect;
export type NotificationInsert = typeof notifications.$inferInsert;
