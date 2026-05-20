import { AppError, ErrorCode, ValidationError } from '@hetcho/shared';
import type { BookingId, CustomerId, PackageId, PackageUsageId, TenantId } from '@hetcho/shared';

export type PackageUsageStatus = 'active' | 'expired' | 'depleted';

export interface PackageUsageProps {
  id: PackageUsageId;
  tenantId: TenantId;
  packageId: PackageId;
  customerId: CustomerId;
  sessionsTotal: number;
  sessionsRemaining: number;
  pricePaidVnd: number;
  purchasedAt: Date;
  expiresAt: Date;
  status: PackageUsageStatus;
  consumedBookingIds: BookingId[];
}

/**
 * Customer's purchased package instance.
 * Invariant: sessionsRemaining ∈ [0, sessionsTotal]. status follows from these
 * and the clock — but is kept denormalised on the entity for cheap querying.
 */
export class PackageUsage {
  private constructor(private props: PackageUsageProps) {}

  static create(input: {
    id: PackageUsageId;
    tenantId: TenantId;
    packageId: PackageId;
    customerId: CustomerId;
    sessionsTotal: number;
    pricePaidVnd: number;
    purchasedAt: Date;
    validityDays: number;
  }): PackageUsage {
    if (!Number.isInteger(input.sessionsTotal) || input.sessionsTotal < 1) {
      throw new ValidationError('sessionsTotal must be integer >= 1');
    }
    if (input.pricePaidVnd < 0) throw new ValidationError('pricePaidVnd must be >= 0');
    if (!Number.isInteger(input.validityDays) || input.validityDays < 1) {
      throw new ValidationError('validityDays must be integer >= 1');
    }
    const expiresAt = new Date(input.purchasedAt.getTime() + input.validityDays * 86_400_000);
    return new PackageUsage({
      id: input.id,
      tenantId: input.tenantId,
      packageId: input.packageId,
      customerId: input.customerId,
      sessionsTotal: input.sessionsTotal,
      sessionsRemaining: input.sessionsTotal,
      pricePaidVnd: input.pricePaidVnd,
      purchasedAt: input.purchasedAt,
      expiresAt,
      status: 'active',
      consumedBookingIds: [],
    });
  }

  static reconstruct(props: PackageUsageProps): PackageUsage {
    return new PackageUsage(props);
  }

  get id(): PackageUsageId { return this.props.id; }
  get tenantId(): TenantId { return this.props.tenantId; }
  get packageId(): PackageId { return this.props.packageId; }
  get customerId(): CustomerId { return this.props.customerId; }
  get sessionsRemaining(): number { return this.props.sessionsRemaining; }
  get sessionsTotal(): number { return this.props.sessionsTotal; }
  get expiresAt(): Date { return this.props.expiresAt; }
  get status(): PackageUsageStatus { return this.props.status; }

  isExpired(at: Date): boolean {
    return at >= this.props.expiresAt;
  }

  /**
   * Decrement remaining sessions and record the booking ID that consumed it.
   * Throws CONFLICT if expired, depleted, or already consumed by this booking.
   */
  consumeSession(bookingId: BookingId, at: Date): void {
    if (this.props.status !== 'active') {
      throw new AppError({
        code: ErrorCode.CONFLICT,
        message: `Package is ${this.props.status}`,
        httpStatus: 409,
        details: { packageUsageId: this.props.id },
      });
    }
    if (this.isExpired(at)) {
      this.props.status = 'expired';
      throw new AppError({
        code: ErrorCode.CONFLICT,
        message: 'Package expired',
        httpStatus: 409,
        details: { packageUsageId: this.props.id, expiresAt: this.props.expiresAt },
      });
    }
    if (this.props.consumedBookingIds.includes(bookingId)) {
      throw new AppError({
        code: ErrorCode.CONFLICT,
        message: 'Booking already consumed a session from this package',
        httpStatus: 409,
        details: { packageUsageId: this.props.id, bookingId },
      });
    }
    this.props.sessionsRemaining -= 1;
    this.props.consumedBookingIds.push(bookingId);
    if (this.props.sessionsRemaining <= 0) {
      this.props.status = 'depleted';
    }
  }

  markExpiredIfDue(at: Date): boolean {
    if (this.props.status === 'active' && this.isExpired(at)) {
      this.props.status = 'expired';
      return true;
    }
    return false;
  }

  toJSON(): PackageUsageProps {
    return { ...this.props, consumedBookingIds: [...this.props.consumedBookingIds] };
  }
}
