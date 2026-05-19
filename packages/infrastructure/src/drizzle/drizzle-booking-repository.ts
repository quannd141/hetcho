import { and, eq, gte, lt, ne } from 'drizzle-orm';
import { Booking, Slot, type BookingProps, type BookingStatus } from '@hetcho/domain';
import {
  BookingId,
  CustomerId,
  ServiceId,
  StaffId,
  TenantId,
} from '@hetcho/shared';
import type { BookingRepository } from '@hetcho/domain';
import { bookings, type DatabaseClient } from '@hetcho/db';

export class DrizzleBookingRepository implements BookingRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findById(id: BookingId): Promise<Booking | null> {
    const rows = await this.db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async findOverlapping(params: {
    tenantId: TenantId;
    staffId: StaffId;
    startAt: Date;
    endAt: Date;
  }): Promise<Booking[]> {
    // Overlap: existing.startAt < params.endAt AND existing.endAt > params.startAt
    // exclude cancelled/no_show
    const rows = await this.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, params.tenantId),
          eq(bookings.staffId, params.staffId),
          lt(bookings.startAt, params.endAt),
          gte(bookings.endAt, params.startAt),
          ne(bookings.status, 'cancelled'),
          ne(bookings.status, 'no_show'),
        ),
      );
    return rows.map((r) => this.toDomain(r));
  }

  async findByTenantAndDate(tenantId: TenantId, date: Date): Promise<Booking[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const rows = await this.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, tenantId),
          gte(bookings.startAt, dayStart),
          lt(bookings.startAt, dayEnd),
        ),
      );
    return rows.map((r) => this.toDomain(r));
  }

  async save(booking: Booking): Promise<void> {
    const p = booking.toJSON();
    const values = {
      id: p.id,
      tenantId: p.tenantId,
      customerId: p.customerId,
      serviceId: p.serviceId,
      staffId: p.staffId,
      startAt: p.slot.startAt,
      endAt: p.slot.endAt,
      status: p.status,
      isPeakSlot: p.isPeakSlot,
      depositRequiredVnd: p.depositRequiredVnd,
      depositPaidVnd: p.depositPaidVnd,
      depositPaidAt: p.depositPaidAt,
      finalPriceVnd: p.finalPriceVnd,
      checkedInAt: p.checkedInAt,
      completedAt: p.completedAt,
      cancelledAt: p.cancelledAt,
      cancelReason: p.cancelReason,
    };
    await this.db
      .insert(bookings)
      .values(values)
      .onConflictDoUpdate({
        target: bookings.id,
        set: {
          status: values.status,
          depositPaidVnd: values.depositPaidVnd,
          depositPaidAt: values.depositPaidAt,
          finalPriceVnd: values.finalPriceVnd,
          checkedInAt: values.checkedInAt,
          completedAt: values.completedAt,
          cancelledAt: values.cancelledAt,
          cancelReason: values.cancelReason,
          updatedAt: new Date(),
        },
      });
  }

  private toDomain(row: typeof bookings.$inferSelect): Booking {
    const slot = Slot.create(row.startAt, Math.round((row.endAt.getTime() - row.startAt.getTime()) / 60_000));
    const props: BookingProps = {
      id: BookingId(row.id),
      tenantId: TenantId(row.tenantId),
      customerId: CustomerId(row.customerId),
      serviceId: ServiceId(row.serviceId),
      staffId: StaffId(row.staffId),
      slot,
      status: row.status as BookingStatus,
      isPeakSlot: row.isPeakSlot,
      depositRequiredVnd: row.depositRequiredVnd,
      depositPaidVnd: row.depositPaidVnd,
      depositPaidAt: row.depositPaidAt,
      finalPriceVnd: row.finalPriceVnd,
      checkedInAt: row.checkedInAt,
      completedAt: row.completedAt,
      cancelledAt: row.cancelledAt,
      cancelReason: row.cancelReason,
      createdAt: row.createdAt,
    };
    return Booking.reconstruct(props);
  }
}
