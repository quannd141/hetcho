import { and, eq } from 'drizzle-orm';
import { Customer, type CustomerProps } from '@hetcho/domain';
import { CustomerId, TenantId } from '@hetcho/shared';
import type { CustomerRepository } from '@hetcho/application';
import { customers, type DatabaseClient } from '@hetcho/db';

export class DrizzleCustomerRepository implements CustomerRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findById(id: CustomerId, tenantId: TenantId): Promise<Customer | null> {
    const rows = await this.db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async findByPhoneHash(tenantId: TenantId, phoneHash: string): Promise<Customer | null> {
    const rows = await this.db
      .select()
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), eq(customers.phoneHash, phoneHash)))
      .limit(1);
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async save(customer: Customer): Promise<void> {
    const p = customer.toJSON();
    await this.db
      .insert(customers)
      .values({
        id: p.id,
        tenantId: p.tenantId,
        name: p.name,
        phoneHash: p.phoneHash,
        phoneMasked: p.phoneMasked,
        zaloId: p.zaloId,
        tier: p.tier,
        lifetimeSpendVnd: p.lifetimeSpendVnd,
        totalBookings: p.totalBookings,
      })
      .onConflictDoUpdate({
        target: customers.id,
        set: {
          name: p.name,
          phoneHash: p.phoneHash,
          phoneMasked: p.phoneMasked,
          zaloId: p.zaloId,
          tier: p.tier,
          lifetimeSpendVnd: p.lifetimeSpendVnd,
          totalBookings: p.totalBookings,
          updatedAt: new Date(),
        },
      });
  }

  private toDomain(row: typeof customers.$inferSelect): Customer {
    const props: CustomerProps = {
      id: CustomerId(row.id),
      tenantId: TenantId(row.tenantId),
      name: row.name,
      phoneHash: row.phoneHash,
      phoneMasked: row.phoneMasked,
      zaloId: row.zaloId,
      tier: row.tier,
      lifetimeSpendVnd: row.lifetimeSpendVnd,
      totalBookings: row.totalBookings,
    };
    return Customer.create(props);
  }
}
