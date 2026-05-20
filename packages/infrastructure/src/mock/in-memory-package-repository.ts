import type { Package, PackageRepository } from '@hetcho/domain';
import type { PackageId, ServiceId, TenantId } from '@hetcho/shared';

export class InMemoryPackageRepository implements PackageRepository {
  private store = new Map<string, Package>();

  async findById(id: PackageId, tenantId: TenantId): Promise<Package | null> {
    const p = this.store.get(id);
    if (!p || p.tenantId !== tenantId) return null;
    return p;
  }

  async findByTenant(tenantId: TenantId, opts?: { activeOnly?: boolean }): Promise<Package[]> {
    return [...this.store.values()].filter((p) => {
      if (p.tenantId !== tenantId) return false;
      if (opts?.activeOnly && !p.isActive) return false;
      return true;
    });
  }

  async findByService(tenantId: TenantId, serviceId: ServiceId): Promise<Package[]> {
    return [...this.store.values()].filter(
      (p) => p.tenantId === tenantId && p.serviceId === serviceId,
    );
  }

  async save(pkg: Package): Promise<void> {
    this.store.set(pkg.id, pkg);
  }

  reset(): void {
    this.store.clear();
  }
}
