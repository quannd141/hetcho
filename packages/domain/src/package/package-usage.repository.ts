import type { CustomerId, PackageUsageId, TenantId } from '@hetcho/shared';
import type { PackageUsage } from './package-usage.entity.js';

export interface PackageUsageRepository {
  findById(id: PackageUsageId, tenantId: TenantId): Promise<PackageUsage | null>;
  findActiveForCustomer(tenantId: TenantId, customerId: CustomerId): Promise<PackageUsage[]>;
  /**
   * Active package_usages expiring between [now, now + windowMs].
   * Status filter applied: only 'active' (not yet expired/depleted).
   */
  findExpiringSoon(tenantId: TenantId, now: Date, windowMs: number): Promise<PackageUsage[]>;
  save(usage: PackageUsage): Promise<void>;
}
