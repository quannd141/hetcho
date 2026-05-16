import type { Booking, BookingRepository } from '@hetcho/domain';
import type { BookingId, StaffId, TenantId } from '@hetcho/shared';

/**
 * In-memory implementation cho test + local dev (NIGHT_SHIFT_MODE).
 * Production: replace với DrizzleBookingRepository.
 */
export class InMemoryBookingRepository implements BookingRepository {
  private store = new Map<string, Booking>();

  async findById(id: BookingId): Promise<Booking | null> {
    return this.store.get(id) ?? null;
  }

  async findOverlapping(params: {
    tenantId: TenantId;
    staffId: StaffId;
    startAt: Date;
    endAt: Date;
  }): Promise<Booking[]> {
    return [...this.store.values()].filter((b) => {
      if (b.tenantId !== params.tenantId) return false;
      if (b.staffId !== params.staffId) return false;
      const bStart = b.slot.startAt.getTime();
      const bEnd = b.slot.endAt.getTime();
      return bStart < params.endAt.getTime() && params.startAt.getTime() < bEnd;
    });
  }

  async findByTenantAndDate(tenantId: TenantId, date: Date): Promise<Booking[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return [...this.store.values()].filter((b) => {
      if (b.tenantId !== tenantId) return false;
      return b.slot.startAt >= dayStart && b.slot.startAt < dayEnd;
    });
  }

  async save(booking: Booking): Promise<void> {
    this.store.set(booking.id, booking);
  }

  reset(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
