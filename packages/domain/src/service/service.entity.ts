import type { ServiceId, TenantId } from '@hetcho/shared';
import { ValidationError } from '@hetcho/shared';

export interface ServiceProps {
  id: ServiceId;
  tenantId: TenantId;
  name: string;
  durationMinutes: number;
  priceVnd: number;
  depositNormalVnd: number;
  depositPeakVnd: number;
  category?: string;
  isActive: boolean;
}

export class Service {
  private constructor(private props: ServiceProps) {}

  static create(props: ServiceProps): Service {
    if (props.durationMinutes <= 0 || props.durationMinutes > 480) {
      throw new ValidationError('durationMinutes must be 1..480');
    }
    if (props.priceVnd < 0) throw new ValidationError('priceVnd must be >= 0');
    if (props.depositNormalVnd < 0) throw new ValidationError('depositNormalVnd must be >= 0');
    if (props.depositPeakVnd < 0) throw new ValidationError('depositPeakVnd must be >= 0');
    return new Service(props);
  }

  get id(): ServiceId {
    return this.props.id;
  }
  get tenantId(): TenantId {
    return this.props.tenantId;
  }
  get durationMinutes(): number {
    return this.props.durationMinutes;
  }
  get priceVnd(): number {
    return this.props.priceVnd;
  }

  computeDeposit(isPeak: boolean): number {
    return isPeak ? this.props.depositPeakVnd : this.props.depositNormalVnd;
  }

  toJSON(): ServiceProps {
    return { ...this.props };
  }
}
