import { describe, it, expect } from 'vitest';
import { Customer } from '@hetcho/domain';
import { CustomerId, TenantId } from '@hetcho/shared';
import { InMemoryCustomerRepository } from '@hetcho/infrastructure';
import { FindCustomersForRecoveryUseCase, type RecoveryDependencies } from './find-customers-for-recovery.use-case.js';

const TENANT = '11111111-1111-1111-1111-111111111111';
const OTHER_TENANT = '22222222-2222-2222-2222-222222222222';
const DAY_MS = 86_400_000;

function makeCustomer(opts: { id: string; tenantId?: string; lastVisitAt: Date | null }): Customer {
  return Customer.create({
    id: CustomerId(opts.id),
    tenantId: TenantId(opts.tenantId ?? TENANT),
    name: 'Khách ' + opts.id.slice(-4),
    phoneHash: 'hash-' + opts.id,
    phoneMasked: '0***' + opts.id.slice(-4),
    zaloId: null,
    tier: 'normal',
    lifetimeSpendVnd: 0,
    totalBookings: 0,
    lastVisitAt: opts.lastVisitAt,
  });
}

function build(now: Date) {
  const customers = new InMemoryCustomerRepository();
  const audits: Array<{ action: string; entityId: string; payload?: Record<string, unknown> }> = [];
  const deps: RecoveryDependencies = {
    tenants: { findById: async () => null },
    customers,
    audit: {
      log: async ({ action, entityId, payload }) => {
        audits.push({ action, entityId, payload: payload ?? {} });
      },
    },
    now: () => now,
  };
  return { deps, customers, audits };
}

describe('FindCustomersForRecoveryUseCase', () => {
  const now = new Date('2026-05-20T10:00:00+07:00');

  it('matches customers at the 30/60/90 day bucket (±1 day tolerance)', async () => {
    const ctx = build(now);
    // 30-day match (exact)
    const c30 = makeCustomer({
      id: '00000000-0000-0000-0000-000000000030',
      lastVisitAt: new Date(now.getTime() - 30 * DAY_MS),
    });
    // 60-day match (within tolerance ±1)
    const c60 = makeCustomer({
      id: '00000000-0000-0000-0000-000000000060',
      lastVisitAt: new Date(now.getTime() - 61 * DAY_MS + 1000),
    });
    // 90-day match
    const c90 = makeCustomer({
      id: '00000000-0000-0000-0000-000000000090',
      lastVisitAt: new Date(now.getTime() - 90 * DAY_MS),
    });
    // Out of any window (15 days)
    const cOut = makeCustomer({
      id: '00000000-0000-0000-0000-000000000015',
      lastVisitAt: new Date(now.getTime() - 15 * DAY_MS),
    });
    await ctx.customers.save(c30);
    await ctx.customers.save(c60);
    await ctx.customers.save(c90);
    await ctx.customers.save(cOut);

    const r = await new FindCustomersForRecoveryUseCase(ctx.deps).execute({ tenantId: TENANT });

    expect(r.matchedCount).toBe(3);
    expect(r.matches.map((m) => m.bucketDays).sort((a, b) => a - b)).toEqual([30, 60, 90]);
    expect(ctx.audits).toHaveLength(3);
    expect(ctx.audits[0]?.action).toBe('customer.recovery_eligible');
  });

  it('skips customers with null lastVisitAt', async () => {
    const ctx = build(now);
    const cNew = makeCustomer({
      id: '00000000-0000-0000-0000-000000000001',
      lastVisitAt: null,
    });
    await ctx.customers.save(cNew);
    const r = await new FindCustomersForRecoveryUseCase(ctx.deps).execute({ tenantId: TENANT });
    expect(r.matchedCount).toBe(0);
    expect(ctx.audits).toHaveLength(0);
  });

  it('respects custom buckets', async () => {
    const ctx = build(now);
    const c7 = makeCustomer({
      id: '00000000-0000-0000-0000-000000000007',
      lastVisitAt: new Date(now.getTime() - 7 * DAY_MS),
    });
    await ctx.customers.save(c7);
    const r = await new FindCustomersForRecoveryUseCase(ctx.deps).execute({
      tenantId: TENANT,
      buckets: [7],
    });
    expect(r.matchedCount).toBe(1);
    expect(r.matches[0]?.bucketDays).toBe(7);
  });

  it('does not cross tenants', async () => {
    const ctx = build(now);
    const cOther = makeCustomer({
      id: '00000000-0000-0000-0000-000000000030',
      tenantId: OTHER_TENANT,
      lastVisitAt: new Date(now.getTime() - 30 * DAY_MS),
    });
    await ctx.customers.save(cOther);
    const r = await new FindCustomersForRecoveryUseCase(ctx.deps).execute({ tenantId: TENANT });
    expect(r.matchedCount).toBe(0);
  });

  it('flags customers slightly past bucket within tolerance', async () => {
    const ctx = build(now);
    const c31 = makeCustomer({
      id: '00000000-0000-0000-0000-000000000031',
      lastVisitAt: new Date(now.getTime() - 31 * DAY_MS),
    });
    await ctx.customers.save(c31);
    const r = await new FindCustomersForRecoveryUseCase(ctx.deps).execute({ tenantId: TENANT });
    expect(r.matchedCount).toBe(1);
    expect(r.matches[0]?.bucketDays).toBe(30);
    expect(r.matches[0]?.daysSinceLastVisit).toBe(31);
  });
});
