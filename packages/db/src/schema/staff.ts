import { boolean, jsonb, pgTable, primaryKey, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { services } from './services.js';
import { tenants } from './tenants.js';

export const staff = pgTable(
  'staff',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    photoUrl: text('photo_url'),
    /**
     * working_hours JSON per day:
     * { mon: { open: '08:00', close: '20:00' }, sun: null }
     */
    workingHours: jsonb('working_hours').notNull().default({}),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('staff_tenant_id_idx').on(table.tenantId),
  }),
);

export const staffServices = pgTable(
  'staff_services',
  {
    staffId: uuid('staff_id')
      .notNull()
      .references(() => staff.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.staffId, table.serviceId] }),
  }),
);

export type Staff = typeof staff.$inferSelect;
export type StaffInsert = typeof staff.$inferInsert;
