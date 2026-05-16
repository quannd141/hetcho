import { z } from 'zod';
import { BookingId, NotFoundError, TenantId } from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const CancelBookingInput = z.object({
  tenantId: z.string().uuid(),
  bookingId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  actorType: z.enum(['customer', 'owner', 'staff', 'system']),
  actorId: z.string().optional(),
});
export type CancelBookingInput = z.infer<typeof CancelBookingInput>;

export interface CancelBookingResult {
  bookingId: BookingId;
  refundAmountVnd: number;
}

/**
 * Use case: Cancel booking + tính refund theo tenant cancel policy.
 */
export class CancelBookingUseCase {
  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<CancelBookingResult> {
    const input = CancelBookingInput.parse(rawInput);

    const booking = await this.deps.bookings.findById(BookingId(input.bookingId));
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.tenantId !== input.tenantId) throw new NotFoundError('Booking not in tenant');

    const tenant = await this.deps.tenants.findById(TenantId(input.tenantId));
    if (!tenant) throw new NotFoundError('Tenant not found');

    const cancelAt = this.deps.now();
    const policy = tenant.cancelPolicy;
    const refundAmountVnd = booking.calculateRefund(cancelAt, policy.refundFullHoursBefore, policy.finePercent);

    booking.cancel(input.reason, cancelAt);

    await this.deps.unitOfWork.run(async (ctx) => {
      await ctx.bookings.save(booking);
      await ctx.audit.log({
        tenantId: booking.tenantId,
        actorType: input.actorType,
        actorId: input.actorId,
        action: 'booking.cancelled',
        entity: 'booking',
        entityId: booking.id,
        payload: {
          reason: input.reason,
          refundAmountVnd,
          depositPaidVnd: booking.depositPaidVnd,
        },
      });
    });

    await this.deps.notification.sendBookingCancellation({
      tenantId: booking.tenantId,
      customerId: booking.toJSON().customerId,
      bookingId: booking.id,
      refundAmountVnd,
    });

    return { bookingId: booking.id, refundAmountVnd };
  }
}
