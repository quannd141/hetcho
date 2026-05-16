import type { NotificationSender } from '@hetcho/application';
import { logger } from '@hetcho/shared';

interface CapturedNotification {
  type: 'confirmation' | 'cancellation';
  tenantId: string;
  customerId: string;
  bookingId: string;
  payload?: Record<string, unknown>;
  sentAt: Date;
}

/**
 * Mock notification — log thay vì gửi Zalo OA/ZNS thật.
 * Trong dev có thể inspect `sent` array.
 */
export class MockNotificationSender implements NotificationSender {
  public readonly sent: CapturedNotification[] = [];

  async sendBookingConfirmation(input: {
    tenantId: string;
    customerId: string;
    bookingId: string;
  }): Promise<void> {
    const entry: CapturedNotification = {
      type: 'confirmation',
      tenantId: input.tenantId,
      customerId: input.customerId,
      bookingId: input.bookingId,
      sentAt: new Date(),
    };
    this.sent.push(entry);
    logger.info('[MOCK] notification.sendBookingConfirmation', { ...entry });
  }

  async sendBookingCancellation(input: {
    tenantId: string;
    customerId: string;
    bookingId: string;
    refundAmountVnd: number;
  }): Promise<void> {
    const entry: CapturedNotification = {
      type: 'cancellation',
      tenantId: input.tenantId,
      customerId: input.customerId,
      bookingId: input.bookingId,
      payload: { refundAmountVnd: input.refundAmountVnd },
      sentAt: new Date(),
    };
    this.sent.push(entry);
    logger.info('[MOCK] notification.sendBookingCancellation', { ...entry });
  }

  reset(): void {
    this.sent.length = 0;
  }
}
