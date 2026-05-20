import { z } from 'zod';
import type { BookingId } from '@hetcho/shared';
import { TenantId } from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const AutoMarkNoShowInput = z.object({
  tenantId: z.string().uuid(),
  graceMinutes: z.number().int().min(0).default(30),
});
export type AutoMarkNoShowInput = z.infer<typeof AutoMarkNoShowInput>;

export interface AutoMarkNoShowResult {
  markedCount: number;
  markedIds: BookingId[];
  depositForfeitedTotalVnd: number;
}

/**
 * Scan confirmed bookings whose slot started > graceMinutes ago and never checked in.
 * Transition to no_show. Deposit is forfeited (depositPaidVnd preserved → shop keeps it).
 */
export class AutoMarkNoShowUseCase {
  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<AutoMarkNoShowResult> {
    const input = AutoMarkNoShowInput.parse(rawInput);
    const now = this.deps.now();
    const startedBefore = new Date(now.getTime() - input.graceMinutes * 60_000);

    const candidates = await this.deps.bookings.findUnattendedConfirmed(
      TenantId(input.tenantId),
      startedBefore,
    );
    const markedIds: BookingId[] = [];
    let depositForfeitedTotalVnd = 0;

    for (const booking of candidates) {
      const forfeitedVnd = booking.depositPaidVnd;
      booking.markNoShow(now);

      await this.deps.unitOfWork.run(async (ctx) => {
        await ctx.bookings.save(booking);
        await ctx.audit.log({
          tenantId: booking.tenantId,
          actorType: 'system',
          action: 'booking.no_show',
          entity: 'booking',
          entityId: booking.id,
          payload: {
            graceMinutes: input.graceMinutes,
            depositForfeitedVnd: forfeitedVnd,
          },
        });
      });

      await this.deps.broadcaster?.publish({
        type: 'booking.no_show',
        tenantId: booking.tenantId,
        bookingId: booking.id,
        occurredAt: now,
        payload: { depositForfeitedVnd: forfeitedVnd },
      });

      markedIds.push(booking.id);
      depositForfeitedTotalVnd += forfeitedVnd;
    }

    return { markedCount: markedIds.length, markedIds, depositForfeitedTotalVnd };
  }
}
