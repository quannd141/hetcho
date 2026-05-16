import type { Slot } from './slot.vo.js';
import type { Booking } from './booking.entity.js';
import { BookingConflictError } from '@hetcho/shared';

/**
 * Domain service: kiểm tra slot xung đột với existing booking của cùng staff.
 *
 * Rule:
 * - Slot overlap với booking status confirmed/checked_in/in_service → CONFLICT.
 * - Slot overlap với pending booking (chưa trả cọc) → KHÔNG conflict (pending sẽ tự release sau 5 phút).
 *   → trừ khi caller explicit includePending=true (dùng cho dashboard view).
 */
export class BookingConflictService {
  static readonly BLOCKING_STATUSES = ['confirmed', 'checked_in', 'in_service'] as const;

  detect(newSlot: Slot, staffId: string, existingBookings: Booking[], options?: { includePending?: boolean }): void {
    const blockers = existingBookings.filter((b) => {
      if (b.staffId !== staffId) return false;
      if (!newSlot.overlaps(b.slot)) return false;
      if (options?.includePending) return true;
      return (BookingConflictService.BLOCKING_STATUSES as readonly string[]).includes(b.status);
    });

    if (blockers.length > 0) {
      const first = blockers[0]!;
      throw new BookingConflictError({
        tenantId: first.tenantId,
        staffId: first.staffId,
        startAt: first.slot.startAt,
        endAt: first.slot.endAt,
      });
    }
  }
}
