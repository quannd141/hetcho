import type { BookingId, TenantId } from '@hetcho/shared';
import type { Review, ReviewRepository } from '@hetcho/domain';

export class InMemoryReviewRepository implements ReviewRepository {
  private readonly byBookingId = new Map<string, Review>();

  async findByBookingId(bookingId: BookingId): Promise<Review | null> {
    return this.byBookingId.get(bookingId) ?? null;
  }

  async findByTenant(tenantId: TenantId): Promise<Review[]> {
    return [...this.byBookingId.values()].filter((r) => r.tenantId === tenantId);
  }

  async save(review: Review): Promise<void> {
    this.byBookingId.set(review.bookingId, review);
  }

  get size(): number {
    return this.byBookingId.size;
  }
}
