import { AppError, ErrorCode, ValidationError } from '@hetcho/shared';
import type { PackageId, ServiceId, TenantId } from '@hetcho/shared';

export interface PackageProps {
  id: PackageId;
  tenantId: TenantId;
  serviceId: ServiceId;
  name: string;
  totalSessions: number;
  priceVnd: number;
  validityDays: number;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Catalog item — "Gói 10 buổi facial 5tr, hạn 6 tháng".
 * A customer purchase materializes as a PackageUsage (separate aggregate).
 */
export class Package {
  private constructor(private props: PackageProps) {}

  static create(props: Omit<PackageProps, 'isActive' | 'createdAt'> & { isActive?: boolean; createdAt?: Date }): Package {
    if (!props.name.trim()) throw new ValidationError('Package name required');
    if (!Number.isInteger(props.totalSessions) || props.totalSessions < 1) {
      throw new ValidationError('totalSessions must be integer >= 1');
    }
    if (props.priceVnd < 0) throw new ValidationError('priceVnd must be >= 0');
    if (!Number.isInteger(props.validityDays) || props.validityDays < 1) {
      throw new ValidationError('validityDays must be integer >= 1');
    }
    return new Package({
      ...props,
      name: props.name.trim(),
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  static reconstruct(props: PackageProps): Package {
    return new Package(props);
  }

  get id(): PackageId { return this.props.id; }
  get tenantId(): TenantId { return this.props.tenantId; }
  get serviceId(): ServiceId { return this.props.serviceId; }
  get totalSessions(): number { return this.props.totalSessions; }
  get priceVnd(): number { return this.props.priceVnd; }
  get validityDays(): number { return this.props.validityDays; }
  get isActive(): boolean { return this.props.isActive; }

  deactivate(): void {
    if (!this.props.isActive) {
      throw new AppError({
        code: ErrorCode.CONFLICT,
        message: 'Package already inactive',
        httpStatus: 409,
      });
    }
    this.props.isActive = false;
  }

  toJSON(): PackageProps { return { ...this.props }; }
}
