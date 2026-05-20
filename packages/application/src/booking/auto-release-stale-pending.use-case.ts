import { z } from 'zod';
import type { BookingId } from '@hetcho/shared';
import { TenantId } from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const AutoReleaseStalePendingInput = z.object({
  tenantId: z.string().uuid(),
  pendingTimeoutMs: z.number().int().min(60_000).default(5 * 60_000),
});
export type AutoReleaseStalePendingInput = z.infer<typeof AutoReleaseStalePendingInput>;

export interface AutoReleaseStalePendingResult {
  releasedCount: number;
  releasedIds: BookingId[];
}

export class AutoReleaseStalePendingUseCase {
  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<AutoReleaseStalePendingResult> {
    const input = AutoReleaseStalePendingInput.parse(rawInput);
    const now = this.deps.now();
    const cutoff = new Date(now.getTime() - input.pendingTimeoutMs);

    const stale = await this.deps.bookings.findStalePending(TenantId(input.tenantId), cutoff);
    const releasedIds: BookingId[] = [];

    for (const booking of stale) {
      booking.cancel('auto-release: deposit timeout', now);

      await this.deps.unitOfWork.run(async (ctx) => {
        await ctx.bookings.save(booking);
        await ctx.audit.log({
          tenantId: booking.tenantId,
          actorType: 'system',
          action: 'booking.auto_released',
          entity: 'booking',
          entityId: booking.id,
          payload: {
            reason: 'deposit_timeout',
            timeoutMs: input.pendingTimeoutMs,
          },
        });
      });

      await this.deps.broadcaster?.publish({
        type: 'booking.cancelled',
        tenantId: booking.tenantId,
        bookingId: booking.id,
        occurredAt: now,
        payload: { reason: 'auto-release: deposit timeout' },
      });

      releasedIds.push(booking.id);
    }

    return { releasedCount: releasedIds.length, releasedIds };
  }
}
