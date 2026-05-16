import { z } from 'zod';
import { BookingId, NotFoundError, ValidationError } from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const MarkDepositPaidInput = z.object({
  tenantId: z.string().uuid(),
  bookingId: z.string().uuid(),
  amountVnd: z.number().int().min(0),
  gatewayTxnId: z.string().min(1),
});
export type MarkDepositPaidInput = z.infer<typeof MarkDepositPaidInput>;

/**
 * Payment webhook callback (VNPay/MoMo/ZaloPay) → mark deposit paid → pending → confirmed.
 * Idempotent: nếu đã confirmed thì skip (gateway có thể retry webhook).
 */
export class MarkDepositPaidUseCase {
  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<{ bookingId: BookingId; alreadyConfirmed: boolean }> {
    const input = MarkDepositPaidInput.parse(rawInput);
    const booking = await this.deps.bookings.findById(BookingId(input.bookingId));
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.tenantId !== input.tenantId) throw new NotFoundError('Booking not in tenant');

    if (booking.status !== 'pending') {
      return { bookingId: booking.id, alreadyConfirmed: true };
    }

    if (input.amountVnd < booking.depositRequiredVnd) {
      throw new ValidationError(
        `Amount ${input.amountVnd} less than required ${booking.depositRequiredVnd}`,
      );
    }

    const at = this.deps.now();
    booking.payDeposit(input.amountVnd, at);

    await this.deps.unitOfWork.run(async (ctx) => {
      await ctx.bookings.save(booking);
      await ctx.audit.log({
        tenantId: booking.tenantId,
        actorType: 'system',
        action: 'booking.deposit_paid',
        entity: 'booking',
        entityId: booking.id,
        payload: { amountVnd: input.amountVnd, gatewayTxnId: input.gatewayTxnId },
      });
    });

    await this.deps.notification.sendBookingConfirmation({
      tenantId: booking.tenantId,
      customerId: booking.toJSON().customerId,
      bookingId: booking.id,
    });

    return { bookingId: booking.id, alreadyConfirmed: false };
  }
}
