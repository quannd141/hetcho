import { pgTable, text, timestamp, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';
import { tenants } from './tenants';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
    role: userRoleEnum('role').notNull().default('owner'),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    tenantIdx: index('users_tenant_id_idx').on(table.tenantId),
  }),
);

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
