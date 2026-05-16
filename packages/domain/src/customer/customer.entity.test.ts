import { describe, it, expect } from 'vitest';
import { Customer } from './customer.entity.js';

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
