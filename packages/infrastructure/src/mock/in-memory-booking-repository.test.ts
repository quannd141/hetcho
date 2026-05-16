import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryBookingRepository } from './in-memory-booking-repository.js';
import { Booking, Slot } from '@hetcho/domain';
import {
  BookingId,
  CustomerId,
  ServiceId,
  StaffId,
  TenantId,
} from '@hetcho/shared';

const T1 = TenantId('t1');
const T2 = TenantId('t2');
const STAFF_A = StaffId('staff-a');
const STAFF_B = StaffId('staff-b');

function makeBooking(opts: { id: string; tenantId: TenantId; staffId: StaffId; startAt: string; durationMin: number }) {
  return Booking.create({
    id: BookingId(opts.id),
    tenantId: opts.tenantId,
    customerId: CustomerId('c'),
    serviceId: ServiceId('s'),
    staffId: opts.staffId,
    slot: Slot.create(new Date(opts.startAt), opts.durationMin),
    isPeakSlot: false,
    depositRequiredVnd: 0,
  });
}

describe('InMemoryBookingRepository', () => {
  let repo: InMemoryBookingRepository;

  beforeEach(() => {
    repo = new InMemoryBookingRepository();
  });

  it('should save and retrieve by id', async () => {
    const b = makeBooking({ id: 'b1', tenantId: T1, staffId: STAFF_A, startAt: '2026-06-01T10:00:00Z', durationMin: 60 });
    await repo.save(b);
    const found = await repo.findById(BookingId('b1'));
    expect(found?.id).toBe('b1');
  });

  it('findOverlapping should respect tenant isolation', async () => {
    await repo.save(makeBooking({ id: 'b1', tenantId: T1, staffId: STAFF_A, startAt: '2026-06-01T10:00:00Z', durationMin: 60 }));
    await repo.save(makeBooking({ id: 'b2', tenantId: T2, staffId: STAFF_A, startAt: '2026-06-01T10:00:00Z', durationMin: 60 }));

    const t1Overlaps = await repo.findOverlapping({
      tenantId: T1,
      staffId: STAFF_A,
      startAt: new Date('2026-06-01T10:30:00Z'),
      endAt: new Date('2026-06-01T11:30:00Z'),
    });

    expect(t1Overlaps).toHaveLength(1);
    expect(t1Overlaps[0]!.id).toBe('b1');
  });

  it('findOverlapping should respect staff isolation', async () => {
    await repo.save(makeBooking({ id: 'b1', tenantId: T1, staffId: STAFF_A, startAt: '2026-06-01T10:00:00Z', durationMin: 60 }));
    await repo.save(makeBooking({ id: 'b2', tenantId: T1, staffId: STAFF_B, startAt: '2026-06-01T10:00:00Z', durationMin: 60 }));

    const staffAOverlap = await repo.findOverlapping({
      tenantId: T1,
      staffId: STAFF_A,
      startAt: new Date('2026-06-01T10:30:00Z'),
      endAt: new Date('2026-06-01T11:30:00Z'),
    });
    expect(staffAOverlap).toHaveLength(1);
    expect(staffAOverlap[0]!.id).toBe('b1');
  });

  it('findByTenantAndDate filters by date and tenant', async () => {
    await repo.save(makeBooking({ id: 'b1', tenantId: T1, staffId: STAFF_A, startAt: '2026-06-01T10:00:00Z', durationMin: 60 }));
    await repo.save(makeBooking({ id: 'b2', tenantId: T1, staffId: STAFF_A, startAt: '2026-06-02T10:00:00Z', durationMin: 60 }));
    await repo.save(makeBooking({ id: 'b3', tenantId: T2, staffId: STAFF_A, startAt: '2026-06-01T10:00:00Z', durationMin: 60 }));

    const day1 = await repo.findByTenantAndDate(T1, new Date('2026-06-01T15:00:00Z'));
    expect(day1).toHaveLength(1);
    expect(day1[0]!.id).toBe('b1');
  });
});
