import { describe, it, expect } from 'vitest';
import { Booking } from './booking.entity.js';
import { Slot } from './slot.vo.js';
import {
  BookingId,
  CustomerId,
  ServiceId,
  StaffId,
  TenantId,
} from '@hetcho/shared';

function makeBookingProps(overrides: Partial<Parameters<typeof Booking.create>[0]> = {}) {
  return {
    id: BookingId('b1'),
    tenantId: TenantId('t1'),
    customerId: CustomerId('c1'),
    serviceId: ServiceId('s1'),
    staffId: StaffId('staff1'),
    slot: Slot.create(new Date('2026-06-01T10:00:00Z'), 60),
    isPeakSlot: false,
    depositRequiredVnd: 0,
    ...overrides,
  };
}

describe('Booking.create', () => {
  it('should default to confirmed when no deposit required', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 0 }));
    expect(b.status).toBe('confirmed');
  });

  it('should default to pending when deposit required', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 100_000 }));
    expect(b.status).toBe('pending');
  });

  it('should reject negative deposit', () => {
    expect(() => Booking.create(makeBookingProps({ depositRequiredVnd: -1 }))).toThrow();
  });
});

describe('Booking.payDeposit', () => {
  it('should transition pending → confirmed and record payment', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 50_000 }));
    const at = new Date('2026-05-31T10:00:00Z');
    b.payDeposit(50_000, at);
    expect(b.status).toBe('confirmed');
    expect(b.depositPaidVnd).toBe(50_000);
    expect(b.isFullyPaid).toBe(true);
  });

  it('should reject payment less than required', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 50_000 }));
    expect(() => b.payDeposit(30_000)).toThrow(/less than required/);
  });
});

describe('Booking state machine', () => {
  it('should follow happy path: pending → confirmed → checked_in → in_service → completed', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 50_000 }));
    b.payDeposit(50_000);
    b.checkIn();
    expect(b.status).toBe('checked_in');
    b.startService();
    expect(b.status).toBe('in_service');
    b.complete(200_000);
    expect(b.status).toBe('completed');
  });

  it('should reject invalid transition pending → in_service', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 50_000 }));
    expect(() => b.startService()).toThrow(/Cannot transition/);
  });

  it('should reject completing without checkin', () => {
    const b = Booking.create(makeBookingProps());
    expect(() => b.complete(100_000)).toThrow(/Cannot transition/);
  });
});

describe('Booking.complete', () => {
  it('should subtract deposit from final price', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 50_000 }));
    b.payDeposit(50_000);
    b.checkIn();
    b.startService();
    b.complete(300_000);
    expect(b.toJSON().finalPriceVnd).toBe(250_000);
  });

  it('should clamp final price to 0 when deposit > service price', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 500_000 }));
    b.payDeposit(500_000);
    b.checkIn();
    b.startService();
    b.complete(300_000);
    expect(b.toJSON().finalPriceVnd).toBe(0);
  });
});

describe('Booking.cancel', () => {
  it('should record reason and timestamp', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 50_000 }));
    b.payDeposit(50_000);
    const at = new Date('2026-05-31T15:00:00Z');
    b.cancel('customer request', at);
    expect(b.status).toBe('cancelled');
    expect(b.toJSON().cancelReason).toBe('customer request');
    expect(b.toJSON().cancelledAt).toEqual(at);
  });
});

describe('Booking.calculateRefund', () => {
  it('should refund 100% when cancelled >= 24h before', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 100_000 }));
    b.payDeposit(100_000);
    const cancelAt = new Date('2026-05-31T09:00:00Z'); // 25h before slot
    expect(b.calculateRefund(cancelAt, 24, 50)).toBe(100_000);
  });

  it('should refund 50% when cancelled < 24h before with finePercent=50', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 100_000 }));
    b.payDeposit(100_000);
    const cancelAt = new Date('2026-06-01T00:00:00Z'); // 10h before slot
    expect(b.calculateRefund(cancelAt, 24, 50)).toBe(50_000);
  });

  it('should refund 0 when finePercent=100', () => {
    const b = Booking.create(makeBookingProps({ depositRequiredVnd: 100_000 }));
    b.payDeposit(100_000);
    const cancelAt = new Date('2026-06-01T09:00:00Z');
    expect(b.calculateRefund(cancelAt, 24, 100)).toBe(0);
  });
});
