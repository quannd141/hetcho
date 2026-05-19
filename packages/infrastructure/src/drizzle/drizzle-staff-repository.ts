import { and, eq, inArray } from 'drizzle-orm';
import { ServiceId, StaffId, TenantId } from '@hetcho/shared';
import type { StaffRecord, StaffWriteRepository } from '@hetcho/application';
import { staff, staffServices, type DatabaseClient } from '@hetcho/db';

export class DrizzleStaffRepository implements StaffWriteRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findById(id: StaffId, tenantId: TenantId): Promise<StaffRecord | null> {
    const rows = await this.db
      .select()
      .from(staff)
      .where(and(eq(staff.id, id), eq(staff.tenantId, tenantId)))
      .limit(1);
    if (!rows[0]) return null;
    const links = await this.db
      .select()
      .from(staffServices)
      .where(eq(staffServices.staffId, id));
    return this.toRecord(rows[0], links.map((l) => l.serviceId));
  }

  async findByTenant(tenantId: TenantId): Promise<StaffRecord[]> {
    const rows = await this.db.select().from(staff).where(eq(staff.tenantId, tenantId));
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const links = await this.db.select().from(staffServices).where(inArray(staffServices.staffId, ids));
    const linkMap = new Map<string, string[]>();
    for (const l of links) {
      const list = linkMap.get(l.staffId) ?? [];
      list.push(l.serviceId);
      linkMap.set(l.staffId, list);
    }
    return rows.map((r) => this.toRecord(r, linkMap.get(r.id) ?? []));
  }

  async findByService(tenantId: TenantId, serviceId: string): Promise<StaffRecord[]> {
    const links = await this.db
      .select()
      .from(staffServices)
      .where(eq(staffServices.serviceId, serviceId));
    if (links.length === 0) return [];
    const staffIds = links.map((l) => l.staffId);
    const rows = await this.db
      .select()
      .from(staff)
      .where(and(eq(staff.tenantId, tenantId), inArray(staff.id, staffIds)));
    return rows.map((r) => this.toRecord(r, links.filter((l) => l.staffId === r.id).map((l) => l.serviceId)));
  }

  async save(record: StaffRecord): Promise<void> {
    await this.db
      .insert(staff)
      .values({
        id: record.id,
        tenantId: record.tenantId,
        name: record.name,
        photoUrl: record.photoUrl,
        workingHours: record.workingHours,
        isActive: record.isActive,
      })
      .onConflictDoUpdate({
        target: staff.id,
        set: {
          name: record.name,
          photoUrl: record.photoUrl,
          workingHours: record.workingHours,
          isActive: record.isActive,
          updatedAt: new Date(),
        },
      });

    await this.db.delete(staffServices).where(eq(staffServices.staffId, record.id));
    if (record.serviceIds.length > 0) {
      await this.db
        .insert(staffServices)
        .values(record.serviceIds.map((sid) => ({ staffId: record.id, serviceId: sid })));
    }
  }

  private toRecord(row: typeof staff.$inferSelect, serviceIds: string[]): StaffRecord {
    return {
      id: StaffId(row.id),
      tenantId: TenantId(row.tenantId),
      name: row.name,
      photoUrl: row.photoUrl ?? undefined,
      workingHours: row.workingHours as StaffRecord['workingHours'],
      serviceIds: serviceIds.map((sid) => ServiceId(sid)),
      isActive: row.isActive,
    };
  }
}
