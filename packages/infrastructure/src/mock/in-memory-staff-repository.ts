import type { StaffId, TenantId } from '@hetcho/shared';

/** Staff entity — keep simple (chưa promote vào domain layer cho Sprint 1) */
export interface StaffRecord {
  id: StaffId;
  tenantId: TenantId;
  name: string;
  photoUrl?: string;
  workingHours: Record<string, { open: string; close: string } | null>;
  serviceIds: string[];
  isActive: boolean;
}

export interface StaffRepository {
  findById(id: StaffId, tenantId: TenantId): Promise<StaffRecord | null>;
  findByTenant(tenantId: TenantId): Promise<StaffRecord[]>;
  findByService(tenantId: TenantId, serviceId: string): Promise<StaffRecord[]>;
  save(staff: StaffRecord): Promise<void>;
}

export class InMemoryStaffRepository implements StaffRepository {
  private store = new Map<string, StaffRecord>();

  async findById(id: StaffId, tenantId: TenantId): Promise<StaffRecord | null> {
    const found = this.store.get(id);
    if (!found || found.tenantId !== tenantId) return null;
    return found;
  }

  async findByTenant(tenantId: TenantId): Promise<StaffRecord[]> {
    return [...this.store.values()].filter((s) => s.tenantId === tenantId);
  }

  async findByService(tenantId: TenantId, serviceId: string): Promise<StaffRecord[]> {
    return [...this.store.values()].filter(
      (s) => s.tenantId === tenantId && s.serviceIds.includes(serviceId),
    );
  }

  async save(staff: StaffRecord): Promise<void> {
    this.store.set(staff.id, staff);
  }

  reset(): void {
    this.store.clear();
  }
}
