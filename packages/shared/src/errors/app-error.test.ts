import { describe, it, expect } from 'vitest';
import { AppError, BookingConflictError, ValidationError } from './app-error.js';
import { ErrorCode } from './error-codes.js';

describe('AppError', () => {
  it('should serialize to JSON with code, message and details', () => {
    const err = new AppError({
      code: ErrorCode.NOT_FOUND,
      message: 'Tenant not found',
      details: { tenantId: 'abc' },
    });
    expect(err.toJSON()).toEqual({
      code: 'NOT_FOUND',
      message: 'Tenant not found',
      details: { tenantId: 'abc' },
    });
  });

  it('should default httpStatus to 500', () => {
    const err = new AppError({ code: ErrorCode.INTERNAL, message: 'Boom' });
    expect(err.httpStatus).toBe(500);
  });
});

describe('ValidationError', () => {
  it('should set httpStatus 400 and VALIDATION code', () => {
    const err = new ValidationError('Bad email', { field: 'email' });
    expect(err.httpStatus).toBe(400);
    expect(err.code).toBe(ErrorCode.VALIDATION);
  });
});

describe('BookingConflictError', () => {
  it('should serialize startAt and endAt as ISO strings', () => {
    const start = new Date('2026-06-01T10:00:00Z');
    const end = new Date('2026-06-01T11:00:00Z');
    const err = new BookingConflictError({
      tenantId: 't1',
      staffId: 's1',
      startAt: start,
      endAt: end,
    });

    expect(err.code).toBe(ErrorCode.BOOKING_CONFLICT);
    expect(err.httpStatus).toBe(409);
    expect(err.details).toMatchObject({
      tenantId: 't1',
      staffId: 's1',
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-01T11:00:00.000Z',
    });
  });
});
