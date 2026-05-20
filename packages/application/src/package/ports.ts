import type { CustomerId, TenantId } from '@hetcho/shared';
import type {
  Customer,
  Package,
  PackageRepository,
  PackageUsageRepository,
} from '@hetcho/domain';
import type { AuditLogger, CustomerRepository, TenantRepository } from '../booking/ports.js';

export type { Package, Customer, PackageRepository, PackageUsageRepository };

export interface PackageDependencies {
  tenants: TenantRepository;
  customers: CustomerRepository;
  packages: PackageRepository;
  packageUsages: PackageUsageRepository;
  audit: AuditLogger;
  now: () => Date;
  generateId: () => string;
}

export type { TenantId, CustomerId };
