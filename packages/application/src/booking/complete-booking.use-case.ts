import { z } from 'zod';
import { BookingId, NotFoundError } from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const CompleteBookingInput = z.object({
  tenantId: z.string().uuid(),
  bookingId: z.string().uuid(),
  finalPriceVnd: z.number().int().min(0),
  actorType: z.enum(['owner', 'staff']),
  actorId: z.string().optional(),
});
export type CompleteBookingInput = z.infer<typeof CompleteBookingInput>;

/**
 * Hoàn tất dịch vụ → in_service → completed. Final price tự trừ deposit đã trả.
 */
export class CompleteBookingUseCase {
  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<{ bookingId: BookingId; remainingDueVnd: number }> {
    const input = CompleteBookingInput.parse(rawInput);
    const booking = await this.deps.bookings.findById(BookingId(input.bookingId));
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.tenantId !== input.tenantId) throw new NotFoundError('Booking not in tenant');

    const at = this.deps.now();
    booking.complete(input.finalPriceVnd, at);

    await this.deps.unitOfWork.run(async (ctx) => {
      await ctx.bookings.save(booking);
      await ctx.audit.log({
        tenantId: booking.tenantId,
        actorType: input.actorType,
        actorId: input.actorId,
        action: 'booking.completed',
        entity: 'booking',
        entityId: booking.id,
        payload: { finalPriceVnd: input.finalPriceVnd, depositPaidVnd: booking.depositPaidVnd },
      });
    });

    const remainingDueVnd = booking.toJSON().finalPriceVnd ?? 0;
    return { bookingId: booking.id, remainingDueVnd };
  }
}
