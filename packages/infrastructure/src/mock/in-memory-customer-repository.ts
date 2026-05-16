import type { Customer } from '@hetcho/domain';
import type { CustomerId, TenantId } from '@hetcho/shared';
import type { CustomerRepository } from '@hetcho/application';

export class InMemoryCustomerRepository implements CustomerRepository {
  private store = new Map<string, Customer>();

  async findById(id: CustomerId, tenantId: TenantId): Promise<Customer | null> {
    const found = this.store.get(id);
    if (!found) return null;
    if (found.toJSON().tenantId !== tenantId) return null;
    return found;
  }

  async findByPhoneHash(tenantId: TenantId, phoneHash: string): Promise<Customer | null> {
    return (
      [...this.store.values()].find((c) => {
        const p = c.toJSON();
        return p.tenantId === tenantId && p.phoneHash === phoneHash;
      }) ?? null
    );
  }

  async findByTenant(tenantId: TenantId): Promise<Customer[]> {
    return [...this.store.values()].filter((c) => c.toJSON().tenantId === tenantId);
  }

  async save(customer: Customer): Promise<void> {
    this.store.set(customer.id, customer);
  }

  reset(): void {
    this.store.clear();
  }
}
