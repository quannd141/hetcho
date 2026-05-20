import { describe, it, expect } from 'vitest';
import {
  BookingId,
  CustomerId,
  PackageId,
  PackageUsageId,
  TenantId,
} from '@hetcho/shared';
import { PackageUsage } from './package-usage.entity.js';

const USAGE = PackageUsageId('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
const TENANT = TenantId('11111111-1111-1111-1111-111111111111');
const PKG = PackageId('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
const CUSTOMER = CustomerId('44444444-4444-4444-4444-444444444444');
const BOOKING_A = BookingId('66666666-6666-6666-6666-666666666601');
const BOOKING_B = BookingId('66666666-6666-6666-6666-666666666602');

function make(opts?: { sessionsTotal?: number; purchasedAt?: Date; validityDays?: number }) {
  return PackageUsage.create({
    id: USAGE,
    tenantId: TENANT,
    packageId: PKG,
    customerId: CUSTOMER,
    sessionsTotal: opts?.sessionsTotal ?? 5,
    pricePaidVnd: 2_500_000,
    purchasedAt: opts?.purchasedAt ?? new Date('2026-06-01T10:00:00+07:00'),
    validityDays: opts?.validityDays ?? 30,
  });
}

describe('PackageUsage entity', () => {
  it('initialises with full sessions remaining and computed expiresAt', () => {
    const u = make({ sessionsTotal: 5, purchasedAt: new Date('2026-06-01T00:00:00Z'), validityDays: 30 });
    expect(u.sessionsRemaining).toBe(5);
    expect(u.sessionsTotal).toBe(5);
    expect(u.status).toBe('active');
    expect(u.expiresAt.toISOString()).toBe('2026-07-01T00:00:00.000Z');
  });

  it('rejects invalid sessionsTotal / pricePaidVnd / validityDays', () => {
    expect(() => make({ sessionsTotal: 0 })).toThrow();
    expect(() => make({ validityDays: 0 })).toThrow();
  });

  it('consumeSession decrements and records bookingId', () => {
    const u = make({ sessionsTotal: 3 });
    u.consumeSession(BOOKING_A, new Date('2026-06-10T10:00:00+07:00'));
    expect(u.sessionsRemaining).toBe(2);
    expect(u.toJSON().consumedBookingIds).toEqual([BOOKING_A]);
  });

  it('marks depleted when reaching zero remaining', () => {
    const u = make({ sessionsTotal: 1 });
    u.consumeSession(BOOKING_A, new Date('2026-06-10T10:00:00+07:00'));
    expect(u.status).toBe('depleted');
    expect(() => u.consumeSession(BOOKING_B, new Date('2026-06-11T10:00:00+07:00'))).toThrow(/depleted/);
  });

  it('rejects double-consume by same booking', () => {
    const u = make({ sessionsTotal: 5 });
    u.consumeSession(BOOKING_A, new Date('2026-06-10T10:00:00+07:00'));
    expect(() => u.consumeSession(BOOKING_A, new Date('2026-06-10T11:00:00+07:00'))).toThrow(
      /already consumed/,
    );
  });

  it('marks expired and refuses consume when past expiresAt', () => {
    const u = make({ purchasedAt: new Date('2026-06-01T00:00:00Z'), validityDays: 30 });
    expect(() => u.consumeSession(BOOKING_A, new Date('2026-07-15T00:00:00Z'))).toThrow(/expired/);
    expect(u.status).toBe('expired');
  });

  it('markExpiredIfDue is idempotent and only flips active→expired', () => {
    const u = make({ purchasedAt: new Date('2026-06-01T00:00:00Z'), validityDays: 30 });
    expect(u.markExpiredIfDue(new Date('2026-06-15T00:00:00Z'))).toBe(false);
    expect(u.status).toBe('active');
    expect(u.markExpiredIfDue(new Date('2026-07-15T00:00:00Z'))).toBe(true);
    expect(u.status).toBe('expired');
    expect(u.markExpiredIfDue(new Date('2026-08-15T00:00:00Z'))).toBe(false);
  });
});
