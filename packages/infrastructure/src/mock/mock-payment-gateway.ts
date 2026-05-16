import type { PaymentGateway } from '@hetcho/application';
import { logger } from '@hetcho/shared';

/**
 * Mock payment gateway — KHÔNG gọi VNPay/MoMo thật.
 * Dùng cho:
 * - Local dev (NIGHT_SHIFT_MODE=true)
 * - Unit / integration tests
 * - Trước khi merchant account ready
 *
 * Behavior: trả URL fake `http://localhost:3000/__mock__/pay/<txnId>`
 * khi user mở URL đó → fake page hiển thị "Confirm payment" button → callback.
 */
export class MockPaymentGateway implements PaymentGateway {
  public readonly captured: Array<{
    bookingId: string;
    amountVnd: number;
    gatewayTxnId: string;
  }> = [];

  private txnCounter = 0;

  async createDeposit(input: Parameters<PaymentGateway['createDeposit']>[0]): ReturnType<
    PaymentGateway['createDeposit']
  > {
    this.txnCounter++;
    const gatewayTxnId = `mock-txn-${Date.now()}-${this.txnCounter}`;
    const paymentUrl = `http://localhost:3000/__mock__/pay/${gatewayTxnId}?booking=${input.bookingId}&amount=${input.amountVnd}`;

    this.captured.push({
      bookingId: input.bookingId,
      amountVnd: input.amountVnd,
      gatewayTxnId,
    });

    logger.info('[MOCK] payment.createDeposit', {
      tenantId: input.tenantId,
      bookingId: input.bookingId,
      amountVnd: input.amountVnd,
      gatewayTxnId,
    });

    return { paymentUrl, gatewayTxnId };
  }

  reset(): void {
    this.captured.length = 0;
    this.txnCounter = 0;
  }
}
