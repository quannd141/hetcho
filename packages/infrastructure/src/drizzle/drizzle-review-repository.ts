import { eq } from 'drizzle-orm';
import { Review, type ReviewRepository } from '@hetcho/domain';
import { BookingId, CustomerId, ReviewId, TenantId } from '@hetcho/shared';
import { reviews, type DatabaseClient } from '@hetcho/db';

export class DrizzleReviewRepository implements ReviewRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findByBookingId(bookingId: BookingId): Promise<Review | null> {
    const rows = await this.db.select().from(reviews).where(eq(reviews.bookingId, bookingId)).limit(1);
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async findByTenant(tenantId: TenantId): Promise<Review[]> {
    const rows = await this.db.select().from(reviews).where(eq(reviews.tenantId, tenantId));
    return rows.map((r) => this.toDomain(r));
  }

  async save(review: Review): Promise<void> {
    const p = review.toJSON();
    await this.db
      .insert(reviews)
      .values({
        id: p.id,
        tenantId: p.tenantId,
        bookingId: p.bookingId,
        customerId: p.customerId,
        rating: p.rating,
        comment: p.comment,
        createdAt: p.createdAt,
      })
      .onConflictDoUpdate({
        target: reviews.bookingId,
        set: { rating: p.rating, comment: p.comment },
      });
  }

  private toDomain(row: typeof reviews.$inferSelect): Review {
    return Review.create({
      id: ReviewId(row.id),
      tenantId: TenantId(row.tenantId),
      bookingId: BookingId(row.bookingId),
      customerId: CustomerId(row.customerId),
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt,
    });
  }
}
