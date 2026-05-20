import type { PackageId, ServiceId, TenantId } from '@hetcho/shared';
import type { Package } from './package.entity.js';

export interface PackageRepository {
  findById(id: PackageId, tenantId: TenantId): Promise<Package | null>;
  findByTenant(tenantId: TenantId, opts?: { activeOnly?: boolean }): Promise<Package[]>;
  findByService(tenantId: TenantId, serviceId: ServiceId): Promise<Package[]>;
  save(pkg: Package): Promise<void>;
}
