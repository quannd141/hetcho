import { ValidationError } from '@hetcho/shared';

/**
 * Slot Value Object — immutable time range cho 1 booking.
 * Tự enforce: start < end, end - start = duration_minutes.
 */
export class Slot {
  private constructor(
    public readonly startAt: Date,
    public readonly endAt: Date,
  ) {
    Object.freeze(this);
  }

  static create(startAt: Date, durationMinutes: number): Slot {
    if (!Number.isFinite(startAt.getTime())) {
      throw new ValidationError('Invalid startAt date');
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0 || durationMinutes > 480) {
      throw new ValidationError('durationMinutes must be 1..480', { durationMinutes });
    }
    const endAt = new Date(startAt.getTime() + durationMinutes * 60_000);
    return new Slot(startAt, endAt);
  }

  static fromRange(startAt: Date, endAt: Date): Slot {
    if (startAt.getTime() >= endAt.getTime()) {
      throw new ValidationError('startAt must be before endAt');
    }
    return new Slot(startAt, endAt);
  }

  get durationMinutes(): number {
    return Math.round((this.endAt.getTime() - this.startAt.getTime()) / 60_000);
  }

  overlaps(other: Slot): boolean {
    return this.startAt.getTime() < other.endAt.getTime() && other.startAt.getTime() < this.endAt.getTime();
  }

  isInPast(now: Date = new Date()): boolean {
    return this.endAt.getTime() <= now.getTime();
  }

  isWithin(start: Date, end: Date): boolean {
    return this.startAt.getTime() >= start.getTime() && this.endAt.getTime() <= end.getTime();
  }
}
