import { z } from 'zod';
import { BookingId, NotFoundError, PackageUsageId, TenantId } from '@hetcho/shared';
import type { PackageDependencies } from './ports.js';

export const ConsumePackageSessionInput = z.object({
  tenantId: z.string().uuid(),
  packageUsageId: z.string().uuid(),
  bookingId: z.string().uuid(),
});
export type ConsumePackageSessionInput = z.infer<typeof ConsumePackageSessionInput>;

export interface ConsumePackageSessionResult {
  sessionsRemaining: number;
  status: 'active' | 'expired' | 'depleted';
}

/**
 * Mark one session as used (booked + completed counts as one consumed session).
 * Throws CONFLICT if package expired, depleted, or already consumed by this booking.
 */
export class ConsumePackageSessionUseCase {
  constructor(private readonly deps: PackageDependencies) {}

  async execute(rawInput: unknown): Promise<ConsumePackageSessionResult> {
    const input = ConsumePackageSessionInput.parse(rawInput);
    const tenantId = TenantId(input.tenantId);

    const usage = await this.deps.packageUsages.findById(
      PackageUsageId(input.packageUsageId),
      tenantId,
    );
    if (!usage) throw new NotFoundError('Package usage not found');

    const now = this.deps.now();
    usage.consumeSession(BookingId(input.bookingId), now);

    await this.deps.packageUsages.save(usage);
    await this.deps.audit.log({
      tenantId,
      actorType: 'system',
      action: 'package.session_consumed',
      entity: 'package_usage',
      entityId: usage.id,
      payload: {
        bookingId: input.bookingId,
        sessionsRemaining: usage.sessionsRemaining,
        status: usage.status,
      },
    });

    return { sessionsRemaining: usage.sessionsRemaining, status: usage.status };
  }
}
