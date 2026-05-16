import { z } from 'zod';
import { BookingId, NotFoundError } from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const StartServiceInput = z.object({
  tenantId: z.string().uuid(),
  bookingId: z.string().uuid(),
  actorType: z.enum(['owner', 'staff']),
  actorId: z.string().optional(),
});
export type StartServiceInput = z.infer<typeof StartServiceInput>;

/**
 * Khi thợ/KTV bắt đầu phục vụ khách → checked_in → in_service.
 */
export class StartServiceUseCase {
  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<{ bookingId: BookingId }> {
    const input = StartServiceInput.parse(rawInput);
    const booking = await this.deps.bookings.findById(BookingId(input.bookingId));
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.tenantId !== input.tenantId) throw new NotFoundError('Booking not in tenant');

    booking.startService();

    await this.deps.unitOfWork.run(async (ctx) => {
      await ctx.bookings.save(booking);
      await ctx.audit.log({
        tenantId: booking.tenantId,
        actorType: input.actorType,
        actorId: input.actorId,
        action: 'booking.started',
        entity: 'booking',
        entityId: booking.id,
      });
    });

    await this.deps.broadcaster?.publish({
      type: 'booking.started',
      tenantId: booking.tenantId,
      bookingId: booking.id,
      occurredAt: this.deps.now(),
    });

    return { bookingId: booking.id };
  }
}
