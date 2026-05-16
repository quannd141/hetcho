import type { Tenant, Service } from '@hetcho/domain';
import type { ServiceId, StaffId, TenantId } from '@hetcho/shared';

export interface TenantWriteRepository {
  findById(id: TenantId): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<void>;
}

export interface ServiceWriteRepository {
  findById(id: ServiceId, tenantId: TenantId): Promise<Service | null>;
  findByTenant(tenantId: TenantId): Promise<Service[]>;
  save(service: Service): Promise<void>;
}

export interface StaffRecord {
  id: StaffId;
  tenantId: TenantId;
  name: string;
  photoUrl?: string;
  workingHours: Record<string, { open: string; close: string } | null>;
  serviceIds: string[];
  isActive: boolean;
}

export interface StaffWriteRepository {
  findById(id: StaffId, tenantId: TenantId): Promise<StaffRecord | null>;
  findByTenant(tenantId: TenantId): Promise<StaffRecord[]>;
  findByService(tenantId: TenantId, serviceId: string): Promise<StaffRecord[]>;
  save(staff: StaffRecord): Promise<void>;
}
