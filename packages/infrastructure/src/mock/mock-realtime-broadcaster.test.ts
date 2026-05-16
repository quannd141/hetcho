import { describe, it, expect, beforeEach } from 'vitest';
import { BookingId, TenantId } from '@hetcho/shared';
import { MockRealtimeBroadcaster } from './mock-realtime-broadcaster.js';
import type { BookingEvent } from '@hetcho/application';

const TENANT_A = TenantId('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
const TENANT_B = TenantId('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
const BOOKING_X = BookingId('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

function makeEvent(tenantId: typeof TENANT_A, type: BookingEvent['type'] = 'booking.created'): BookingEvent {
  return {
    type,
    tenantId,
    bookingId: BOOKING_X,
    occurredAt: new Date('2026-06-01T10:00:00Z'),
  };
}

describe('MockRealtimeBroadcaster', () => {
  let broadcaster: MockRealtimeBroadcaster;

  beforeEach(() => {
    broadcaster = new MockRealtimeBroadcaster();
  });

  it('should record published events in order', async () => {
    await broadcaster.publish(makeEvent(TENANT_A, 'booking.created'));
    await broadcaster.publish(makeEvent(TENANT_A, 'booking.confirmed'));
    expect(broadcaster.published.map((e) => e.type)).toEqual(['booking.created', 'booking.confirmed']);
  });

  it('should deliver events to subscribers of matching tenant', async () => {
    const received: BookingEvent[] = [];
    broadcaster.subscribe(TENANT_A, (e) => received.push(e));

    await broadcaster.publish(makeEvent(TENANT_A));
    expect(received).toHaveLength(1);
  });

  it('should not leak events across tenants', async () => {
    const receivedA: BookingEvent[] = [];
    const receivedB: BookingEvent[] = [];
    broadcaster.subscribe(TENANT_A, (e) => receivedA.push(e));
    broadcaster.subscribe(TENANT_B, (e) => receivedB.push(e));

    await broadcaster.publish(makeEvent(TENANT_A));
    expect(receivedA).toHaveLength(1);
    expect(receivedB).toHaveLength(0);
  });

  it('should support unsubscribe', async () => {
    const received: BookingEvent[] = [];
    const unsubscribe = broadcaster.subscribe(TENANT_A, (e) => received.push(e));

    await broadcaster.publish(makeEvent(TENANT_A));
    unsubscribe();
    await broadcaster.publish(makeEvent(TENANT_A));

    expect(received).toHaveLength(1);
  });

  it('reset() should clear subscribers and published log', async () => {
    broadcaster.subscribe(TENANT_A, () => {});
    await broadcaster.publish(makeEvent(TENANT_A));
    broadcaster.reset();
    expect(broadcaster.published).toEqual([]);
  });
});
