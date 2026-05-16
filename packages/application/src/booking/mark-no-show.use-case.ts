import { z } from 'zod';
import { BookingId, NotFoundError } from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const MarkNoShowInput = z.object({
  tenantId: z.string().uuid(),
  bookingId: z.string().uuid(),
  actorType: z.enum(['owner', 'staff', 'system']),
  actorId: z.string().optional(),
});
export type MarkNoShowInput = z.infer<typeof MarkNoShowInput>;

/**
 * Khách không đến quá 30 phút sau giờ hẹn → mark no_show. Cọc thuộc về tiệm.
 * Có thể trigger bằng cron (actorType=system) hoặc owner click thủ công.
 */
export class MarkNoShowUseCase {
  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<{ bookingId: BookingId; depositForfeitedVnd: number }> {
    const input = MarkNoShowInput.parse(rawInput);
    const booking = await this.deps.bookings.findById(BookingId(input.bookingId));
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.tenantId !== input.tenantId) throw new NotFoundError('Booking not in tenant');

    const at = this.deps.now();
    booking.markNoShow(at);
    const depositForfeitedVnd = booking.depositPaidVnd;

    await this.deps.unitOfWork.run(async (ctx) => {
      await ctx.bookings.save(booking);
      await ctx.audit.log({
        tenantId: booking.tenantId,
        actorType: input.actorType,
        actorId: input.actorId,
        action: 'booking.no_show',
        entity: 'booking',
        entityId: booking.id,
        payload: { depositForfeitedVnd },
      });
    });

    await this.deps.broadcaster?.publish({
      type: 'booking.no_show',
      tenantId: booking.tenantId,
      bookingId: booking.id,
      occurredAt: at,
      payload: { depositForfeitedVnd },
    });

    return { bookingId: booking.id, depositForfeitedVnd };
  }
}
