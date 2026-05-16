import { pgEnum } from 'drizzle-orm/pg-core';

export const tenantTypeEnum = pgEnum('tenant_type', [
  'salon_toc',
  'spa_skincare',
  'nail',
  'goi_dau',
  'barber',
  'massage',
  'other',
]);

export const userRoleEnum = pgEnum('user_role', ['owner', 'staff', 'admin', 'super_admin']);

export const customerTierEnum = pgEnum('customer_tier', ['normal', 'cip', 'vip']);

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending', // chờ thanh toán cọc
  'confirmed', // đã confirm
  'checked_in', // khách đến
  'in_service', // đang phục vụ
  'completed', // xong
  'cancelled', // hủy
  'no_show', // không đến
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'success',
  'failed',
  'refunded',
  'partial_refund',
]);

export const paymentGatewayEnum = pgEnum('payment_gateway', [
  'vnpay',
  'momo',
  'zalopay',
  'cash',
  'transfer',
]);

export const notificationChannelEnum = pgEnum('notification_channel', ['zns', 'oa', 'email', 'sms']);

export const notificationStatusEnum = pgEnum('notification_status', [
  'queued',
  'sent',
  'delivered',
  'failed',
]);
