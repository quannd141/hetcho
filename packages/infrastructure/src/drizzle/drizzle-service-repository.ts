import { and, eq } from 'drizzle-orm';
import { Service } from '@hetcho/domain';
import { ServiceId, TenantId } from '@hetcho/shared';
import type { ServiceWriteRepository } from '@hetcho/application';
import { services, type DatabaseClient } from '@hetcho/db';

export class DrizzleServiceRepository implements ServiceWriteRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findById(id: ServiceId, tenantId: TenantId): Promise<Service | null> {
    const rows = await this.db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async findByTenant(tenantId: TenantId): Promise<Service[]> {
    const rows = await this.db.select().from(services).where(eq(services.tenantId, tenantId));
    return rows.map((r) => this.toDomain(r));
  }

  async save(service: Service): Promise<void> {
    const p = service.toJSON();
    await this.db
      .insert(services)
      .values({
        id: p.id,
        tenantId: p.tenantId,
        name: p.name,
        category: p.category,
        durationMinutes: p.durationMinutes,
        priceVnd: p.priceVnd,
        depositNormalVnd: p.depositNormalVnd,
        depositPeakVnd: p.depositPeakVnd,
        isActive: p.isActive,
      })
      .onConflictDoUpdate({
        target: services.id,
        set: {
          name: p.name,
          category: p.category,
          durationMinutes: p.durationMinutes,
          priceVnd: p.priceVnd,
          depositNormalVnd: p.depositNormalVnd,
          depositPeakVnd: p.depositPeakVnd,
          isActive: p.isActive,
          updatedAt: new Date(),
        },
      });
  }

  private toDomain(row: typeof services.$inferSelect): Service {
    return Service.create({
      id: ServiceId(row.id),
      tenantId: TenantId(row.tenantId),
      name: row.name,
      durationMinutes: row.durationMinutes,
      priceVnd: row.priceVnd,
      depositNormalVnd: row.depositNormalVnd,
      depositPeakVnd: row.depositPeakVnd,
      category: row.category ?? undefined,
      isActive: row.isActive,
    });
  }
}
