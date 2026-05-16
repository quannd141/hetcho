import type { BookingEvent, RealtimeBroadcaster } from '@hetcho/application';

type Subscriber = (event: BookingEvent) => void;

/**
 * In-memory pub/sub for tests + NIGHT_SHIFT_MODE.
 * Subscribers can listen per-tenant channel.
 */
export class MockRealtimeBroadcaster implements RealtimeBroadcaster {
  private subscribersByTenant = new Map<string, Set<Subscriber>>();
  readonly published: BookingEvent[] = [];

  async publish(event: BookingEvent): Promise<void> {
    this.published.push(event);
    const subs = this.subscribersByTenant.get(event.tenantId);
    if (subs) {
      for (const sub of subs) sub(event);
    }
  }

  subscribe(tenantId: string, listener: Subscriber): () => void {
    if (!this.subscribersByTenant.has(tenantId)) {
      this.subscribersByTenant.set(tenantId, new Set());
    }
    const subs = this.subscribersByTenant.get(tenantId)!;
    subs.add(listener);
    return () => {
      subs.delete(listener);
    };
  }

  reset(): void {
    this.subscribersByTenant.clear();
    this.published.length = 0;
  }
}
