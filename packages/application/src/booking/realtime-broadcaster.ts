import type { BookingId, TenantId } from '@hetcho/shared';

export type BookingEventType =
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.checked_in'
  | 'booking.started'
  | 'booking.completed'
  | 'booking.cancelled'
  | 'booking.no_show';

export interface BookingEvent {
  type: BookingEventType;
  tenantId: TenantId;
  bookingId: BookingId;
  occurredAt: Date;
  payload?: Record<string, unknown>;
}

/**
 * Port: broadcast booking state change cho dashboard realtime auto-refresh.
 *
 * Channel convention: `tenant:<tenantId>:bookings`.
 *
 * Production: SupabaseRealtimeBroadcaster (Postgres CDC → WebSocket).
 * NIGHT_SHIFT_MODE: MockRealtimeBroadcaster (in-memory pub/sub, log to console).
 */
export interface RealtimeBroadcaster {
  publish(event: BookingEvent): Promise<void>;
}
