import { describe, it, expect } from 'vitest';
import { Slot } from './slot.vo.js';

describe('Slot.create', () => {
  it('should compute endAt = startAt + duration', () => {
    const start = new Date('2026-06-01T10:00:00Z');
    const slot = Slot.create(start, 90);
    expect(slot.endAt).toEqual(new Date('2026-06-01T11:30:00Z'));
    expect(slot.durationMinutes).toBe(90);
  });

  it('should reject negative or zero duration', () => {
    expect(() => Slot.create(new Date(), 0)).toThrow(/durationMinutes/);
    expect(() => Slot.create(new Date(), -10)).toThrow(/durationMinutes/);
  });

  it('should reject duration > 480 minutes (8h)', () => {
    expect(() => Slot.create(new Date(), 500)).toThrow(/durationMinutes/);
  });

  it('should reject non-integer duration', () => {
    expect(() => Slot.create(new Date(), 1.5)).toThrow(/durationMinutes/);
  });

  it('should reject invalid startAt', () => {
    expect(() => Slot.create(new Date('invalid'), 60)).toThrow(/Invalid startAt/);
  });
});

describe('Slot.fromRange', () => {
  it('should reject endAt <= startAt', () => {
    const t = new Date('2026-06-01T10:00:00Z');
    expect(() => Slot.fromRange(t, t)).toThrow(/before endAt/);
    expect(() => Slot.fromRange(t, new Date(t.getTime() - 1000))).toThrow(/before endAt/);
  });
});

describe('Slot.overlaps', () => {
  it('should detect full overlap', () => {
    const a = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    const b = Slot.create(new Date('2026-06-01T10:30:00Z'), 60);
    expect(a.overlaps(b)).toBe(true);
    expect(b.overlaps(a)).toBe(true);
  });

  it('should detect partial overlap on edges', () => {
    const a = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    const b = Slot.create(new Date('2026-06-01T10:59:00Z'), 60);
    expect(a.overlaps(b)).toBe(true);
  });

  it('should NOT consider back-to-back as overlap (exact touch)', () => {
    const a = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    const b = Slot.create(new Date('2026-06-01T11:00:00Z'), 60);
    expect(a.overlaps(b)).toBe(false);
    expect(b.overlaps(a)).toBe(false);
  });

  it('should return false for non-overlapping', () => {
    const a = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    const b = Slot.create(new Date('2026-06-01T14:00:00Z'), 60);
    expect(a.overlaps(b)).toBe(false);
  });
});

describe('Slot.isInPast', () => {
  it('should detect past slot', () => {
    const slot = Slot.create(new Date('2020-01-01T10:00:00Z'), 60);
    expect(slot.isInPast()).toBe(true);
  });
  it('should detect future slot', () => {
    const slot = Slot.create(new Date('2099-01-01T10:00:00Z'), 60);
    expect(slot.isInPast()).toBe(false);
  });
});

describe('Slot immutability', () => {
  it('should freeze instance', () => {
    const slot = Slot.create(new Date('2026-06-01T10:00:00Z'), 60);
    expect(Object.isFrozen(slot)).toBe(true);
  });
});
