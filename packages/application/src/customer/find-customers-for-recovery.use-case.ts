import { z } from 'zod';
import { CustomerId, TenantId } from '@hetcho/shared';
import type { AuditLogger, CustomerRepository, TenantRepository } from '../booking/ports.js';

export const FindCustomersForRecoveryInput = z.object({
  tenantId: z.string().uuid(),
  /** Day-buckets to scan, default [30, 60, 90]. */
  buckets: z.array(z.number().int().min(1)).default([30, 60, 90]),
  /** ±toleranceDays around each bucket, default 1 (≈ daily cron run). */
  toleranceDays: z.number().int().min(0).default(1),
});
export type FindCustomersForRecoveryInput = z.infer<typeof FindCustomersForRecoveryInput>;

export interface RecoveryMatch {
  customerId: CustomerId;
  bucketDays: number;
  daysSinceLastVisit: number;
}

export interface FindCustomersForRecoveryResult {
  matchedCount: number;
  matches: RecoveryMatch[];
}

export interface RecoveryDependencies {
  tenants: TenantRepository;
  customers: CustomerRepository;
  audit: AuditLogger;
  now: () => Date;
}

const DAY_MS = 86_400_000;

/**
 * Daily cron: find customers whose lastVisitAt falls in a recovery bucket
 * (default 30 / 60 / 90 days ago, ±1 day tolerance) and emit one audit event
 * per match (`customer.recovery_eligible`). A future Zalo ZNS subscriber will
 * dispatch the actual outreach.
 *
 * Customers with `lastVisitAt === null` are skipped — they've never visited,
 * recovery campaign is for lapsed visitors, not new prospects.
 */
export class FindCustomersForRecoveryUseCase {
  constructor(private readonly deps: RecoveryDependencies) {}

  async execute(rawInput: unknown): Promise<FindCustomersForRecoveryResult> {
    const input = FindCustomersForRecoveryInput.parse(rawInput);
    const tenantId = TenantId(input.tenantId);
    if (!this.deps.customers.findByTenant) {
      throw new Error('CustomerRepository.findByTenant is required for recovery scan');
    }
    const customers = await this.deps.customers.findByTenant(tenantId);
    const now = this.deps.now();
    const matches: RecoveryMatch[] = [];

    for (const customer of customers) {
      const lastVisitAt = customer.lastVisitAt;
      if (lastVisitAt === null) continue;
      const daysSince = Math.floor((now.getTime() - lastVisitAt.getTime()) / DAY_MS);
      const bucket = input.buckets.find((b) => Math.abs(daysSince - b) <= input.toleranceDays);
      if (bucket === undefined) continue;

      matches.push({
        customerId: customer.id,
        bucketDays: bucket,
        daysSinceLastVisit: daysSince,
      });
      await this.deps.audit.log({
        tenantId,
        actorType: 'system',
        action: 'customer.recovery_eligible',
        entity: 'customer',
        entityId: customer.id,
        payload: {
          bucketDays: bucket,
          daysSinceLastVisit: daysSince,
          lastVisitAt: lastVisitAt.toISOString(),
        },
      });
    }

    return { matchedCount: matches.length, matches };
  }
}
