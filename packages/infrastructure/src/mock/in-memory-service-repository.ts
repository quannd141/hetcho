import type { Service } from '@hetcho/domain';
import type { ServiceId, TenantId } from '@hetcho/shared';
import type { ServiceRepository } from '@hetcho/application';

export class InMemoryServiceRepository implements ServiceRepository {
  private store = new Map<string, Service>();

  async findById(id: ServiceId, tenantId: TenantId): Promise<Service | null> {
    const found = this.store.get(id);
    if (!found) return null;
    if (found.tenantId !== tenantId) return null;
    return found;
  }

  async findByTenant(tenantId: TenantId): Promise<Service[]> {
    return [...this.store.values()].filter((s) => s.tenantId === tenantId);
  }

  async save(service: Service): Promise<void> {
    this.store.set(service.id, service);
  }

  reset(): void {
    this.store.clear();
  }
}
