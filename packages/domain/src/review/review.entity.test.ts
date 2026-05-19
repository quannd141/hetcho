import { describe, it, expect } from 'vitest';
import { Review } from './review.entity.js';
import { AppError, BookingId, CustomerId, ReviewId, TenantId } from '@hetcho/shared';

function makeProps(over?: Partial<Parameters<typeof Review.create>[0]>) {
  return {
    id: ReviewId('rev-1'),
    tenantId: TenantId('t-1'),
    bookingId: BookingId('b-1'),
    customerId: CustomerId('c-1'),
    rating: 5,
    comment: 'Tuyệt vời!',
    createdAt: new Date('2026-05-20T10:00:00+07:00'),
    ...over,
  };
}

describe('Review.create', () => {
  it('accepts a valid 1-5 rating', () => {
    expect(() => Review.create(makeProps({ rating: 1 }))).not.toThrow();
    expect(() => Review.create(makeProps({ rating: 5 }))).not.toThrow();
  });

  it('rejects rating below 1', () => {
    expect(() => Review.create(makeProps({ rating: 0 }))).toThrow(AppError);
  });

  it('rejects rating above 5', () => {
    expect(() => Review.create(makeProps({ rating: 6 }))).toThrow(AppError);
  });

  it('rejects non-integer rating', () => {
    expect(() => Review.create(makeProps({ rating: 4.5 }))).toThrow(AppError);
  });

  it('rejects comment longer than 500 chars', () => {
    expect(() => Review.create(makeProps({ comment: 'x'.repeat(501) }))).toThrow(AppError);
  });

  it('trims comment whitespace', () => {
    const r = Review.create(makeProps({ comment: '   good   ' }));
    expect(r.toJSON().comment).toBe('good');
  });

  it('exposes rating and ids via getters', () => {
    const r = Review.create(makeProps());
    expect(r.rating).toBe(5);
    expect(r.bookingId).toBe('b-1');
    expect(r.tenantId).toBe('t-1');
  });
});
