import { jsonb, pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

/**
 * Append-only audit log cho mọi action critical:
 * - booking_created, booking_cancelled, booking_completed
 * - payment_initiated, payment_succeeded, payment_failed, refund
 * - tenant_settings_changed, staff_added/removed
 *
 * KHÔNG UPDATE/DELETE — chỉ INSERT. Migration enforce qua RLS.
 */
export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id'),
    actorType: text('actor_type').notNull(),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: uuid('entity_id'),
    payload: jsonb('payload').notNull().default({}),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantActionIdx: index('audit_events_tenant_action_idx').on(table.tenantId, table.action),
    tenantEntityIdx: index('audit_events_tenant_entity_idx').on(
      table.tenantId,
      table.entity,
      table.entityId,
    ),
    tenantCreatedIdx: index('audit_events_tenant_created_idx').on(table.tenantId, table.createdAt),
  }),
);

export type AuditEvent = typeof auditEvents.$inferSelect;
export type AuditEventInsert = typeof auditEvents.$inferInsert;
