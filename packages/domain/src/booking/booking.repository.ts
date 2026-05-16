import type { BookingId, StaffId, TenantId } from '@hetcho/shared';
import type { Booking } from './booking.entity.js';

/**
 * Repository interface — implementation ở packages/infrastructure.
 * Domain layer KHÔNG biết về Drizzle / Postgres.
 */
export interface BookingRepository {
  findById(id: BookingId): Promise<Booking | null>;

  findOverlapping(params: {
    tenantId: TenantId;
    staffId: StaffId;
    startAt: Date;
    endAt: Date;
  }): Promise<Booking[]>;

  findByTenantAndDate(tenantId: TenantId, date: Date): Promise<Booking[]>;

  save(booking: Booking): Promise<void>;
}
