import { integer, jsonb, pgTable, text, timestamp, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { paymentGatewayEnum, transactionStatusEnum } from './enums.js';
import { bookings } from './bookings.js';
import { tenants } from './tenants.js';

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    bookingId: uuid('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    gateway: paymentGatewayEnum('gateway').notNull(),
    gatewayTxnId: text('gateway_txn_id'),
    amountVnd: integer('amount_vnd').notNull(),
    status: transactionStatusEnum('status').notNull().default('pending'),
    rawPayload: jsonb('raw_payload').notNull().default({}),
    failureReason: text('failure_reason'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    refundedAt: timestamp('refunded_at', { withTimezone: true }),
    refundedAmountVnd: integer('refunded_amount_vnd'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    gatewayTxnIdx: uniqueIndex('transactions_gateway_txn_idx').on(
      table.gateway,
      table.gatewayTxnId,
    ),
    tenantBookingIdx: index('transactions_tenant_booking_idx').on(table.tenantId, table.bookingId),
  }),
);

export type Transaction = typeof transactions.$inferSelect;
export type TransactionInsert = typeof transactions.$inferInsert;
