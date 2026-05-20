import { describe, it, expect } from 'vitest';
import { CustomerId, TenantId } from '@hetcho/shared';
import { Customer } from './customer.entity.js';

function makeCustomer(): Customer {
  return Customer.create({
    id: CustomerId('00000000-0000-0000-0000-000000000001'),
    tenantId: TenantId('11111111-1111-1111-1111-111111111111'),
    name: 'Khách thử',
    phoneHash: 'hash',
    phoneMasked: '0***1234',
    zaloId: null,
    tier: 'normal',
    lifetimeSpendVnd: 0,
    totalBookings: 0,
  });
}

describe('Customer.recordVisit', () => {
  it('defaults lastVisitAt to null on create when omitted', () => {
    expect(makeCustomer().lastVisitAt).toBeNull();
  });

  it('sets lastVisitAt when null', () => {
    const c = makeCustomer();
    const at = new Date('2026-05-20T10:00:00+07:00');
    c.recordVisit(at);
    expect(c.lastVisitAt?.toISOString()).toBe(at.toISOString());
  });

  it('advances lastVisitAt when new timestamp is later', () => {
    const c = makeCustomer();
    c.recordVisit(new Date('2026-04-01T10:00:00+07:00'));
    c.recordVisit(new Date('2026-05-20T10:00:00+07:00'));
    expect(c.lastVisitAt?.toISOString()).toBe(
      new Date('2026-05-20T10:00:00+07:00').toISOString(),
    );
  });

  it('ignores earlier timestamps (idempotent for out-of-order events)', () => {
    const c = makeCustomer();
    c.recordVisit(new Date('2026-05-20T10:00:00+07:00'));
    c.recordVisit(new Date('2026-04-01T10:00:00+07:00'));
    expect(c.lastVisitAt?.toISOString()).toBe(
      new Date('2026-05-20T10:00:00+07:00').toISOString(),
    );
  });
});

describe('Customer.computeTier', () => {
  it('returns normal for new customer', () => {
    expect(Customer.computeTier(0, 0)).toBe('normal');
    expect(Customer.computeTier(5, 5_000_000)).toBe('normal');
  });

  it('returns cip at 10 bookings even without big spend', () => {
    expect(Customer.computeTier(10, 0)).toBe('cip');
    expect(Customer.computeTier(49, 29_999_999)).toBe('cip');
  });

  it('returns vip at 50 bookings AND 30tr spend', () => {
    expect(Customer.computeTier(50, 30_000_000)).toBe('vip');
    expect(Customer.computeTier(100, 50_000_000)).toBe('vip');
  });

  it('stays cip if only bookings >= 50 but spend < 30tr', () => {
    expect(Customer.computeTier(60, 25_000_000)).toBe('cip');
  });
});
