import { jsonb, pgTable, text, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenantTypeEnum } from './enums';

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    type: tenantTypeEnum('type').notNull(),
    phoneContact: text('phone_contact'),
    addressLine: text('address_line'),
    city: text('city'),
    /**
     * settings JSON:
     * - working_hours: { mon: { open: '08:00', close: '22:00' }, ... }
     * - peak_windows: [{ day: 'sat', from: '14:00', to: '22:00' }]
     * - cancel_policy: { refund_full_hours_before: 24, fine_percent: 50 }
     * - slot_minutes: 30
     * - timezone: 'Asia/Ho_Chi_Minh'
     */
    settings: jsonb('settings').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('tenants_slug_idx').on(table.slug),
  }),
);

export type Tenant = typeof tenants.$inferSelect;
export type TenantInsert = typeof tenants.$inferInsert;
