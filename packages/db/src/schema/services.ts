import { boolean, integer, pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

export const services = pgTable(
  'services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category'),
    durationMinutes: integer('duration_minutes').notNull(),
    priceVnd: integer('price_vnd').notNull(),
    depositNormalVnd: integer('deposit_normal_vnd').notNull().default(0),
    depositPeakVnd: integer('deposit_peak_vnd').notNull().default(0),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('services_tenant_id_idx').on(table.tenantId),
  }),
);

export type Service = typeof services.$inferSelect;
export type ServiceInsert = typeof services.$inferInsert;
