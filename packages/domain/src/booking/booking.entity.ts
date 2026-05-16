import type { BookingId, CustomerId, ServiceId, StaffId, TenantId } from '@hetcho/shared';
import { AppError, ErrorCode, ValidationError } from '@hetcho/shared';
import { Slot } from './slot.vo.js';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show';

const VALID_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['in_service', 'cancelled'],
  in_service: ['completed'],
  completed: [],
  cancelled: [],
  no_show: [],
};

export interface BookingProps {
  id: BookingId;
  tenantId: TenantId;
  customerId: CustomerId;
  serviceId: ServiceId;
  staffId: StaffId;
  slot: Slot;
  status: BookingStatus;
  isPeakSlot: boolean;
  depositRequiredVnd: number;
  depositPaidVnd: number;
  depositPaidAt: Date | null;
  finalPriceVnd: number | null;
  checkedInAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
}

export class Booking {
  private constructor(private props: BookingProps) {}

  static create(props: Omit<BookingProps, 'status' | 'createdAt' | 'depositPaidVnd' | 'depositPaidAt' | 'finalPriceVnd' | 'checkedInAt' | 'completedAt' | 'cancelledAt' | 'cancelReason'>): Booking {
    if (props.depositRequiredVnd < 0) {
      throw new ValidationError('depositRequiredVnd must be >= 0');
    }
    return new Booking({
      ...props,
      status: props.depositRequiredVnd > 0 ? 'pending' : 'confirmed',
      depositPaidVnd: 0,
      depositPaidAt: null,
      finalPriceVnd: null,
      checkedInAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelReason: null,
      createdAt: new Date(),
    });
  }

  static reconstruct(props: BookingProps): Booking {
    return new Booking(props);
  }

  get id(): BookingId {
    return this.props.id;
  }
  get tenantId(): TenantId {
    return this.props.tenantId;
  }
  get staffId(): StaffId {
    return this.props.staffId;
  }
  get slot(): Slot {
    return this.props.slot;
  }
  get status(): BookingStatus {
    return this.props.status;
  }
  get depositRequiredVnd(): number {
    return this.props.depositRequiredVnd;
  }
  get depositPaidVnd(): number {
    return this.props.depositPaidVnd;
  }
  get isFullyPaid(): boolean {
    return this.props.depositPaidVnd >= this.props.depositRequiredVnd;
  }
  toJSON(): BookingProps {
    return { ...this.props };
  }

  private transition(to: BookingStatus): void {
    const allowed = VALID_TRANSITIONS[this.props.status];
    if (!allowed.includes(to)) {
      throw new AppError({
        code: ErrorCode.CONFLICT,
        message: `Cannot transition booking from ${this.props.status} to ${to}`,
        httpStatus: 409,
        details: { from: this.props.status, to, bookingId: this.props.id },
      });
    }
    this.props.status = to;
  }

  payDeposit(amountVnd: number, at: Date = new Date()): void {
    if (amountVnd < this.props.depositRequiredVnd) {
      throw new ValidationError(
        `Deposit ${amountVnd} less than required ${this.props.depositRequiredVnd}`,
      );
    }
    this.props.depositPaidVnd = amountVnd;
    this.props.depositPaidAt = at;
    if (this.props.status === 'pending') {
      this.transition('confirmed');
    }
  }

  checkIn(at: Date = new Date()): void {
    this.transition('checked_in');
    this.props.checkedInAt = at;
  }

  startService(): void {
    this.transition('in_service');
  }

  complete(finalPriceVnd: number, at: Date = new Date()): void {
    if (finalPriceVnd < 0) {
      throw new ValidationError('finalPriceVnd must be >= 0');
    }
    this.transition('completed');
    this.props.completedAt = at;
    this.props.finalPriceVnd = Math.max(0, finalPriceVnd - this.props.depositPaidVnd);
  }

  cancel(reason: string, at: Date = new Date()): void {
    this.transition('cancelled');
    this.props.cancelledAt = at;
    this.props.cancelReason = reason;
  }

  markNoShow(at: Date = new Date()): void {
    this.transition('no_show');
    this.props.cancelledAt = at;
    this.props.cancelReason = 'no_show: customer did not arrive';
  }

  /**
   * Tính refund cho cancel:
   * - >= refundFullHoursBefore (default 24h trước slot): refund 100% (trừ phí gateway)
   * - < refundFullHoursBefore: refund (100 - finePercent)%
   */
  calculateRefund(cancelledAt: Date, refundFullHoursBefore: number, finePercent: number): number {
    const hoursBefore = (this.props.slot.startAt.getTime() - cancelledAt.getTime()) / 3_600_000;
    if (hoursBefore >= refundFullHoursBefore) {
      return this.props.depositPaidVnd;
    }
    const refundPercent = Math.max(0, 100 - finePercent);
    return Math.floor((this.props.depositPaidVnd * refundPercent) / 100);
  }
}
