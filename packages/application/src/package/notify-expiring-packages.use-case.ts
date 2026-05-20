import { z } from 'zod';
import { TenantId } from '@hetcho/shared';
import type { PackageUsageId } from '@hetcho/shared';
import type { PackageDependencies } from './ports.js';

export const NotifyExpiringPackagesInput = z.object({
  tenantId: z.string().uuid(),
  windowDays: z.number().int().min(1).default(7),
});
export type NotifyExpiringPackagesInput = z.infer<typeof NotifyExpiringPackagesInput>;

export interface NotifyExpiringPackagesResult {
  notifiedCount: number;
  notifiedIds: PackageUsageId[];
}

/**
 * Daily cron: find active packages expiring within `windowDays` and emit
 * an audit log (which the notification adapter — Zalo ZNS in production —
 * subscribes to). Audit-event-driven dispatch keeps this use case free of
 * the NotificationSender dependency.
 */
export class NotifyExpiringPackagesUseCase {
  constructor(private readonly deps: PackageDependencies) {}

  async execute(rawInput: unknown): Promise<NotifyExpiringPackagesResult> {
    const input = NotifyExpiringPackagesInput.parse(rawInput);
    const tenantId = TenantId(input.tenantId);
    const now = this.deps.now();
    const windowMs = input.windowDays * 86_400_000;

    const expiring = await this.deps.packageUsages.findExpiringSoon(tenantId, now, windowMs);
    const notifiedIds: PackageUsageId[] = [];

    for (const usage of expiring) {
      const daysToExpire = Math.ceil(
        (usage.expiresAt.getTime() - now.getTime()) / 86_400_000,
      );
      await this.deps.audit.log({
        tenantId,
        actorType: 'system',
        action: 'package.expiring_soon',
        entity: 'package_usage',
        entityId: usage.id,
        payload: {
          customerId: usage.customerId,
          packageId: usage.packageId,
          sessionsRemaining: usage.sessionsRemaining,
          expiresAt: usage.expiresAt.toISOString(),
          daysToExpire,
        },
      });
      notifiedIds.push(usage.id);
    }

    return { notifiedCount: notifiedIds.length, notifiedIds };
  }
}
