import { describe, it, expect, beforeEach } from 'vitest';
import { Customer, Package } from '@hetcho/domain';
import {
  CustomerId,
  NotFoundError,
  PackageId,
  ServiceId,
  TenantId,
} from '@hetcho/shared';
import {
  InMemoryCustomerRepository,
  InMemoryPackageRepository,
  InMemoryPackageUsageRepository,
} from '@hetcho/infrastructure';
import { BuyPackageUseCase } from './buy-package.use-case.js';
import { ConsumePackageSessionUseCase } from './consume-package-session.use-case.js';
import { NotifyExpiringPackagesUseCase } from './notify-expiring-packages.use-case.js';
import type { PackageDependencies } from './ports.js';

const TENANT = '11111111-1111-1111-1111-111111111111';
const OTHER_TENANT = '22222222-2222-2222-2222-222222222222';
const SERVICE = '33333333-3333-3333-3333-333333333333';
const CUSTOMER = '44444444-4444-4444-4444-444444444444';
const PKG = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const BOOKING_A = '66666666-6666-6666-6666-666666666601';
const BOOKING_B = '66666666-6666-6666-6666-666666666602';

interface State {
  audits: Array<{ action: string; entityId: string; payload?: Record<string, unknown> }>;
  idCounter: number;
}

function build(opts: { now?: Date } = {}) {
  const customers = new InMemoryCustomerRepository();
  const packages = new InMemoryPackageRepository();
  const packageUsages = new InMemoryPackageUsageRepository();
  const state: State = { audits: [], idCounter: 0 };
  const deps: PackageDependencies = {
    tenants: { findById: async () => null },
    customers: customers as never,
    packages,
    packageUsages,
    audit: {
      log: async ({ action, entityId, payload }) => {
        state.audits.push({ action, entityId, payload: payload ?? {} });
      },
    },
    now: () => opts.now ?? new Date('2026-06-01T10:00:00+07:00'),
    generateId: () => `99999999-9999-9999-9999-99999999${(++state.idCounter).toString().padStart(4, '0')}`,
  };
  return { deps, packages, packageUsages, customers, state };
}

async function seedCustomer(repo: InMemoryCustomerRepository, tenantId: string = TENANT) {
  const c = Customer.create({
    id: CustomerId(CUSTOMER),
    tenantId: TenantId(tenantId),
    name: 'Khách demo',
    phoneHash: 'hash-' + tenantId,
    phoneMasked: '0***1234',
    zaloId: null,
    tier: 'normal',
    lifetimeSpendVnd: 0,
    totalBookings: 0,
  });
  await repo.save(c);
}

function makePackage(active = true): Package {
  return Package.create({
    id: PackageId(PKG),
    tenantId: TenantId(TENANT),
    serviceId: ServiceId(SERVICE),
    name: 'Gói 10 buổi facial',
    totalSessions: 10,
    priceVnd: 5_000_000,
    validityDays: 30,
    isActive: active,
  });
}

describe('BuyPackageUseCase', () => {
  let ctx: ReturnType<typeof build>;
  beforeEach(async () => {
    ctx = build();
    await ctx.packages.save(makePackage());
    await seedCustomer(ctx.customers);
  });

  it('creates a PackageUsage with full sessions remaining and expiresAt = now + validityDays', async () => {
    const result = await new BuyPackageUseCase(ctx.deps).execute({
      tenantId: TENANT,
      customerId: CUSTOMER,
      packageId: PKG,
    });

    expect(result.sessionsTotal).toBe(10);
    const usage = await ctx.packageUsages.findById(result.packageUsageId, TenantId(TENANT));
    expect(usage?.sessionsRemaining).toBe(10);
    expect(usage?.status).toBe('active');
    // now=2026-06-01T10:00:00+07:00, validity 30 days
    expect(result.expiresAt.toISOString()).toBe('2026-07-01T03:00:00.000Z');
    expect(ctx.state.audits[0]?.action).toBe('package.purchased');
  });

  it('uses package price by default; explicit pricePaidVnd overrides (discount/upcharge)', async () => {
    const r = await new BuyPackageUseCase(ctx.deps).execute({
      tenantId: TENANT,
      customerId: CUSTOMER,
      packageId: PKG,
      pricePaidVnd: 4_500_000,
    });
    expect(ctx.state.audits[0]?.payload?.pricePaidVnd).toBe(4_500_000);
    const usage = await ctx.packageUsages.findById(r.packageUsageId, TenantId(TENANT));
    expect(usage?.toJSON().pricePaidVnd).toBe(4_500_000);
  });

  it('rejects when package not found', async () => {
    await expect(
      new BuyPackageUseCase(ctx.deps).execute({
        tenantId: TENANT,
        customerId: CUSTOMER,
        packageId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('rejects when package inactive', async () => {
    const inactive = makePackage(false);
    await ctx.packages.save(inactive);
    await expect(
      new BuyPackageUseCase(ctx.deps).execute({
        tenantId: TENANT,
        customerId: CUSTOMER,
        packageId: PKG,
      }),
    ).rejects.toThrow(/inactive/);
  });

  it('rejects when package belongs to another tenant', async () => {
    await expect(
      new BuyPackageUseCase(ctx.deps).execute({
        tenantId: OTHER_TENANT,
        customerId: CUSTOMER,
        packageId: PKG,
      }),
    ).rejects.toThrow(NotFoundError);
  });
});

describe('ConsumePackageSessionUseCase', () => {
  let ctx: ReturnType<typeof build>;
  beforeEach(async () => {
    ctx = build();
    await ctx.packages.save(makePackage());
    await seedCustomer(ctx.customers);
  });

  async function buy() {
    return new BuyPackageUseCase(ctx.deps).execute({
      tenantId: TENANT,
      customerId: CUSTOMER,
      packageId: PKG,
    });
  }

  it('decrements sessionsRemaining and audits session consumption', async () => {
    const { packageUsageId } = await buy();
    const r = await new ConsumePackageSessionUseCase(ctx.deps).execute({
      tenantId: TENANT,
      packageUsageId,
      bookingId: BOOKING_A,
    });
    expect(r.sessionsRemaining).toBe(9);
    expect(r.status).toBe('active');
    const consumeAudit = ctx.state.audits.find((a) => a.action === 'package.session_consumed');
    expect(consumeAudit?.payload?.sessionsRemaining).toBe(9);
  });

  it('flips status to depleted on last consume', async () => {
    await ctx.packages.save(
      Package.create({
        id: PackageId(PKG),
        tenantId: TenantId(TENANT),
        serviceId: ServiceId(SERVICE),
        name: 'Gói thử 1 buổi',
        totalSessions: 1,
        priceVnd: 500_000,
        validityDays: 30,
      }),
    );
    const { packageUsageId } = await buy();
    const r = await new ConsumePackageSessionUseCase(ctx.deps).execute({
      tenantId: TENANT,
      packageUsageId,
      bookingId: BOOKING_A,
    });
    expect(r.status).toBe('depleted');
  });

  it('rejects double-consume by same booking', async () => {
    const { packageUsageId } = await buy();
    await new ConsumePackageSessionUseCase(ctx.deps).execute({
      tenantId: TENANT,
      packageUsageId,
      bookingId: BOOKING_A,
    });
    await expect(
      new ConsumePackageSessionUseCase(ctx.deps).execute({
        tenantId: TENANT,
        packageUsageId,
        bookingId: BOOKING_A,
      }),
    ).rejects.toThrow(/already consumed/);
  });

  it('rejects consume on cross-tenant access', async () => {
    const { packageUsageId } = await buy();
    await expect(
      new ConsumePackageSessionUseCase(ctx.deps).execute({
        tenantId: OTHER_TENANT,
        packageUsageId,
        bookingId: BOOKING_B,
      }),
    ).rejects.toThrow(NotFoundError);
  });
});

describe('NotifyExpiringPackagesUseCase', () => {
  it('audits packages expiring within window, skips already-expired and out-of-window', async () => {
    const ctx = build({ now: new Date('2026-06-29T00:00:00Z') });
    await ctx.packages.save(makePackage());
    await seedCustomer(ctx.customers);

    // Buy on 2026-06-01 → expires 2026-07-01 (2 days from now → within 7-day window)
    const buyDeps = { ...ctx.deps, now: () => new Date('2026-06-01T10:00:00+07:00') };
    const within = await new BuyPackageUseCase(buyDeps).execute({
      tenantId: TENANT,
      customerId: CUSTOMER,
      packageId: PKG,
    });

    // Buy on 2026-06-20 → expires 2026-07-20 (21 days → out of window)
    const buyDepsOut = { ...ctx.deps, now: () => new Date('2026-06-20T10:00:00+07:00') };
    const out = await new BuyPackageUseCase(buyDepsOut).execute({
      tenantId: TENANT,
      customerId: CUSTOMER,
      packageId: PKG,
    });

    // Buy way back (already expired) - need to manipulate clock to far past
    const buyDepsPast = { ...ctx.deps, now: () => new Date('2026-04-01T10:00:00+07:00') };
    const past = await new BuyPackageUseCase(buyDepsPast).execute({
      tenantId: TENANT,
      customerId: CUSTOMER,
      packageId: PKG,
    });

    const r = await new NotifyExpiringPackagesUseCase(ctx.deps).execute({
      tenantId: TENANT,
      windowDays: 7,
    });

    expect(r.notifiedCount).toBe(1);
    expect(r.notifiedIds).toContain(within.packageUsageId);
    expect(r.notifiedIds).not.toContain(out.packageUsageId);
    expect(r.notifiedIds).not.toContain(past.packageUsageId);
  });

  it('does not cross tenants', async () => {
    const ctx = build({ now: new Date('2026-06-29T00:00:00Z') });
    await ctx.packages.save(makePackage());
    await seedCustomer(ctx.customers, OTHER_TENANT);
    // Note: package is TENANT-scoped; this exercise just verifies cron in OTHER_TENANT
    // doesn't see TENANT's expiring usages.
    const buyDeps = { ...ctx.deps, now: () => new Date('2026-06-01T10:00:00+07:00') };
    // need to seed a TENANT customer for the buy
    await seedCustomer(ctx.customers, TENANT);
    await new BuyPackageUseCase(buyDeps).execute({
      tenantId: TENANT,
      customerId: CUSTOMER,
      packageId: PKG,
    });

    const r = await new NotifyExpiringPackagesUseCase(ctx.deps).execute({
      tenantId: OTHER_TENANT,
      windowDays: 7,
    });
    expect(r.notifiedCount).toBe(0);
  });
});
