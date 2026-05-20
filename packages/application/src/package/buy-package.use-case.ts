import { z } from 'zod';
import { PackageUsage } from '@hetcho/domain';
import {
  CustomerId,
  NotFoundError,
  PackageId,
  PackageUsageId,
  TenantId,
  ValidationError,
} from '@hetcho/shared';
import type { PackageDependencies } from './ports.js';

export const BuyPackageInput = z.object({
  tenantId: z.string().uuid(),
  customerId: z.string().uuid(),
  packageId: z.string().uuid(),
  pricePaidVnd: z.number().int().min(0).optional(),
});
export type BuyPackageInput = z.infer<typeof BuyPackageInput>;

export interface BuyPackageResult {
  packageUsageId: PackageUsageId;
  sessionsTotal: number;
  expiresAt: Date;
}

/**
 * Customer (or owner on customer's behalf) purchases a package.
 * Creates a new PackageUsage with full sessions remaining + expiresAt.
 */
export class BuyPackageUseCase {
  constructor(private readonly deps: PackageDependencies) {}

  async execute(rawInput: unknown): Promise<BuyPackageResult> {
    const input = BuyPackageInput.parse(rawInput);
    const tenantId = TenantId(input.tenantId);

    const pkg = await this.deps.packages.findById(PackageId(input.packageId), tenantId);
    if (!pkg) throw new NotFoundError('Package not found');
    if (!pkg.isActive) throw new ValidationError('Package is inactive');

    const customer = await this.deps.customers.findById(CustomerId(input.customerId), tenantId);
    if (!customer) throw new NotFoundError('Customer not found');

    const now = this.deps.now();
    const pricePaidVnd = input.pricePaidVnd ?? pkg.priceVnd;

    const usage = PackageUsage.create({
      id: PackageUsageId(this.deps.generateId()),
      tenantId,
      packageId: pkg.id,
      customerId: customer.id,
      sessionsTotal: pkg.totalSessions,
      pricePaidVnd,
      purchasedAt: now,
      validityDays: pkg.validityDays,
    });

    await this.deps.packageUsages.save(usage);
    await this.deps.audit.log({
      tenantId,
      actorType: 'owner',
      action: 'package.purchased',
      entity: 'package_usage',
      entityId: usage.id,
      payload: {
        packageId: pkg.id,
        customerId: customer.id,
        pricePaidVnd,
        sessionsTotal: pkg.totalSessions,
        expiresAt: usage.expiresAt.toISOString(),
      },
    });

    return {
      packageUsageId: usage.id,
      sessionsTotal: usage.sessionsTotal,
      expiresAt: usage.expiresAt,
    };
  }
}
