import { MockAuditLogger } from './mock/mock-audit-logger.js';
import { MockNotificationSender } from './mock/mock-notification-sender.js';
import { MockPaymentGateway } from './mock/mock-payment-gateway.js';
import { InMemoryBookingRepository } from './mock/in-memory-booking-repository.js';

/**
 * Factory: dựa vào NIGHT_SHIFT_MODE chọn implementation.
 * - true: mock adapters + in-memory repo (KHÔNG gọi API thật, KHÔNG chạm Postgres)
 * - false: real adapters (Drizzle, VNPay, Zalo ZNS) — sẽ implement Sprint 1+
 */
export function isNightShiftMode(): boolean {
  return process.env.NIGHT_SHIFT_MODE === 'true';
}

export interface InfrastructureBundle {
  payment: MockPaymentGateway;
  notification: MockNotificationSender;
  audit: MockAuditLogger;
  bookings: InMemoryBookingRepository;
}

/**
 * Build all adapters; trong night-shift mode trả về mock.
 * Real implementation sẽ thay branch khác Sprint 1+.
 */
export function buildInfrastructure(): InfrastructureBundle {
  if (!isNightShiftMode()) {
    // Real adapters chưa implement → fall through to mock as safe default.
    // Sprint 1+ thay bằng: { payment: new VnpayGateway(...), ... }
    console.warn('[infra] Real adapters not yet implemented — using mock as fallback');
  }
  return {
    payment: new MockPaymentGateway(),
    notification: new MockNotificationSender(),
    audit: new MockAuditLogger(),
    bookings: new InMemoryBookingRepository(),
  };
}
