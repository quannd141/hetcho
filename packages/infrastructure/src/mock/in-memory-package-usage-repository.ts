import type { PackageUsage, PackageUsageRepository } from '@hetcho/domain';
import type { CustomerId, PackageUsageId, TenantId } from '@hetcho/shared';

export class InMemoryPackageUsageRepository implements PackageUsageRepository {
  private store = new Map<string, PackageUsage>();

  async findById(id: PackageUsageId, tenantId: TenantId): Promise<PackageUsage | null> {
    const u = this.store.get(id);
    if (!u || u.tenantId !== tenantId) return null;
    return u;
  }

  async findActiveForCustomer(
    tenantId: TenantId,
    customerId: CustomerId,
  ): Promise<PackageUsage[]> {
    return [...this.store.values()].filter(
      (u) =>
        u.tenantId === tenantId && u.customerId === customerId && u.status === 'active',
    );
  }

  async findExpiringSoon(
    tenantId: TenantId,
    now: Date,
    windowMs: number,
  ): Promise<PackageUsage[]> {
    const cutoff = new Date(now.getTime() + windowMs);
    return [...this.store.values()].filter((u) => {
      if (u.tenantId !== tenantId) return false;
      if (u.status !== 'active') return false;
      const exp = u.expiresAt.getTime();
      return exp > now.getTime() && exp <= cutoff.getTime();
    });
  }

  async save(usage: PackageUsage): Promise<void> {
    this.store.set(usage.id, usage);
  }

  reset(): void {
    this.store.clear();
  }
}
