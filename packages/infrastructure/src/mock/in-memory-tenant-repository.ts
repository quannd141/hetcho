import type { Tenant } from '@hetcho/domain';
import type { TenantId } from '@hetcho/shared';
import type { TenantRepository } from '@hetcho/application';

export class InMemoryTenantRepository implements TenantRepository {
  private byId = new Map<string, Tenant>();
  private bySlug = new Map<string, Tenant>();

  async findById(id: TenantId): Promise<Tenant | null> {
    return this.byId.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.bySlug.get(slug) ?? null;
  }

  async save(tenant: Tenant): Promise<void> {
    this.byId.set(tenant.id, tenant);
    this.bySlug.set(tenant.toJSON().slug, tenant);
  }

  reset(): void {
    this.byId.clear();
    this.bySlug.clear();
  }

  get size(): number {
    return this.byId.size;
  }
}
