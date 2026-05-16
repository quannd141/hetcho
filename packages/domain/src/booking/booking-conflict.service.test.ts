import { describe, it, expect } from 'vitest';
import { BookingConflictService } from './booking-conflict.service.js';
import { Booking } from './booking.entity.js';
import { Slot } from './slot.vo.js';
import { BookingConflictError } from '@hetcho/shared';
import { BookingId, CustomerId, ServiceId, StaffId, TenantId } from '@hetcho/shared';

const TENANT = TenantId('t1');
const STAFF_A = StaffId('staff-a');
const STAFF_B = StaffId('staff-b');

function makeBooking(opts: { id: string; startAt: string; durationMin: number; staffId: StaffId; status?: 'pending' | 'confirmed' | 'cancelled' }) {
  const b = Booking.create({
    id: BookingId(opts.id),
    tenantId: TENANT,
    customerId: CustomerId('c1'),
    serviceId: ServiceId('s1'),
    staffId: opts.staffId,
    slot: Slot.create(new Date(opts.startAt), opts.durationMin),
    isPeakSlot: false,
    depositRequiredVnd: opts.status === 'pending' ? 50_000 : 0,
  });
  if (opts.status === 'cancelled') {
    b.cancel('test');
  }
  return b;
}

describe('BookingConflictService.detect', () => {
  const service = new BookingConflictService();

  it('should pass when no existing bookings', () => {
    const newSlot = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    expect(() => service.detect(newSlot, STAFF_A, [])).not.toThrow();
  });

  it('should throw BookingConflictError when overlap with confirmed booking same staff', () => {
    const existing = makeBooking({
      id: 'b1',
      startAt: '2026-06-01T10:00:00Z',
      durationMin: 60,
      staffId: STAFF_A,
    });
    const newSlot = Slot.create(new Date('2026-06-01T10:30:00Z'), 60);
    expect(() => service.detect(newSlot, STAFF_A, [existing])).toThrow(BookingConflictError);
  });

  it('should NOT conflict when same time but different staff', () => {
    const existing = makeBooking({
      id: 'b1',
      startAt: '2026-06-01T10:00:00Z',
      durationMin: 60,
      staffId: STAFF_A,
    });
    const newSlot = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    expect(() => service.detect(newSlot, STAFF_B, [existing])).not.toThrow();
  });

  it('should ignore pending (unpaid) bookings by default', () => {
    const pending = makeBooking({
      id: 'b1',
      startAt: '2026-06-01T10:00:00Z',
      durationMin: 60,
      staffId: STAFF_A,
      status: 'pending',
    });
    const newSlot = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    expect(() => service.detect(newSlot, STAFF_A, [pending])).not.toThrow();
  });

  it('should INCLUDE pending when includePending=true', () => {
    const pending = makeBooking({
      id: 'b1',
      startAt: '2026-06-01T10:00:00Z',
      durationMin: 60,
      staffId: STAFF_A,
      status: 'pending',
    });
    const newSlot = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    expect(() => service.detect(newSlot, STAFF_A, [pending], { includePending: true })).toThrow(
      BookingConflictError,
    );
  });

  it('should ignore cancelled bookings', () => {
    const cancelled = makeBooking({
      id: 'b1',
      startAt: '2026-06-01T10:00:00Z',
      durationMin: 60,
      staffId: STAFF_A,
      status: 'cancelled',
    });
    const newSlot = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    expect(() => service.detect(newSlot, STAFF_A, [cancelled])).not.toThrow();
  });

  it('should NOT conflict back-to-back (exact touch)', () => {
    const existing = makeBooking({
      id: 'b1',
      startAt: '2026-06-01T10:00:00Z',
      durationMin: 60,
      staffId: STAFF_A,
    });
    const newSlot = Slot.create(new Date('2026-06-01T11:00:00Z'), 60);
    expect(() => service.detect(newSlot, STAFF_A, [existing])).not.toThrow();
  });
});
