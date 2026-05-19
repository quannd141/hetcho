import { eq } from 'drizzle-orm';
import { Tenant, type TenantProps } from '@hetcho/domain';
import { TenantId } from '@hetcho/shared';
import type { TenantWriteRepository } from '@hetcho/application';
import { tenants, type DatabaseClient } from '@hetcho/db';

interface TenantSettings {
  workingHours: TenantProps['workingHours'];
  peakWindows: TenantProps['peakWindows'];
  slotMinutes: number;
  timezone: string;
  cancelPolicy: TenantProps['cancelPolicy'];
}

export class DrizzleTenantRepository implements TenantWriteRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findById(id: TenantId): Promise<Tenant | null> {
    const rows = await this.db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const rows = await this.db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const rows = await this.db.select().from(tenants);
    return rows.map((r) => this.toDomain(r));
  }

  async save(tenant: Tenant): Promise<void> {
    const p = tenant.toJSON();
    const settings: TenantSettings = {
      workingHours: p.workingHours,
      peakWindows: p.peakWindows,
      slotMinutes: p.slotMinutes,
      timezone: p.timezone,
      cancelPolicy: p.cancelPolicy,
    };
    await this.db
      .insert(tenants)
      .values({ id: p.id, slug: p.slug, name: p.name, type: p.type, settings })
      .onConflictDoUpdate({
        target: tenants.id,
        set: { slug: p.slug, name: p.name, type: p.type, settings, updatedAt: new Date() },
      });
  }

  private toDomain(row: typeof tenants.$inferSelect): Tenant {
    const settings = row.settings as TenantSettings;
    return Tenant.create({
      id: TenantId(row.id),
      slug: row.slug,
      name: row.name,
      type: row.type,
      workingHours: settings.workingHours,
      peakWindows: settings.peakWindows,
      slotMinutes: settings.slotMinutes,
      timezone: settings.timezone,
      cancelPolicy: settings.cancelPolicy,
    });
  }
}
