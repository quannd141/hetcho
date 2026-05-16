import { z } from 'zod';
import { BookingId, NotFoundError } from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const CheckInBookingInput = z.object({
  tenantId: z.string().uuid(),
  bookingId: z.string().uuid(),
  actorType: z.enum(['owner', 'staff']),
  actorId: z.string().optional(),
});
export type CheckInBookingInput = z.infer<typeof CheckInBookingInput>;

/**
 * Owner/staff bấm "Khách đến" trên dashboard → booking.confirmed → checked_in.
 */
export class CheckInBookingUseCase {
  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<{ bookingId: BookingId }> {
    const input = CheckInBookingInput.parse(rawInput);
    const booking = await this.deps.bookings.findById(BookingId(input.bookingId));
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.tenantId !== input.tenantId) throw new NotFoundError('Booking not in tenant');

    const at = this.deps.now();
    booking.checkIn(at);

    await this.deps.unitOfWork.run(async (ctx) => {
      await ctx.bookings.save(booking);
      await ctx.audit.log({
        tenantId: booking.tenantId,
        actorType: input.actorType,
        actorId: input.actorId,
        action: 'booking.checked_in',
        entity: 'booking',
        entityId: booking.id,
        payload: { at: at.toISOString() },
      });
    });

    await this.deps.broadcaster?.publish({
      type: 'booking.checked_in',
      tenantId: booking.tenantId,
      bookingId: booking.id,
      occurredAt: at,
    });

    return { bookingId: booking.id };
  }
}
