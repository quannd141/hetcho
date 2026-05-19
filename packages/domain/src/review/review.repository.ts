import type { BookingId, TenantId } from '@hetcho/shared';
import type { Review } from './review.entity.js';

export interface ReviewRepository {
  findByBookingId(bookingId: BookingId): Promise<Review | null>;
  findByTenant(tenantId: TenantId): Promise<Review[]>;
  save(review: Review): Promise<void>;
}
