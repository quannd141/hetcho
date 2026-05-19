import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getContainerReady } from '@/lib/container';

export const dynamic = 'force-dynamic';

const Query = z.object({
  window: z.enum(['24h', '2h']).default('24h'),
});

/**
 * Cron stub — gọi tay hoặc qua Vercel Cron:
 *   GET /api/cron/reminders?window=24h
 *
 * Tìm bookings status=confirmed có startAt trong khoảng [now+windowMs, now+windowMs+5min]
 * và gửi reminder qua MockNotificationSender (log ra console).
 *
 * Sprint 4+: wire Zalo ZNS thật + Vercel Cron schedule.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 },
    );
  }

  const c = await getContainerReady();
  const windowMs = parsed.data.window === '24h' ? 24 * 3600_000 : 2 * 3600_000;
  const slackMs = 5 * 60_000;
  const now = new Date();
  const windowStart = new Date(now.getTime() + windowMs);
  const windowEnd = new Date(windowStart.getTime() + slackMs);

  const tenantList = await c.tenants.findAll();

  const sent: Array<{ bookingId: string; tenantSlug: string; window: string }> = [];

  for (const tenant of tenantList) {
    const tProps = tenant.toJSON();
    // Iterate ±2 days to find bookings whose startAt is in the window
    for (let offset = 0; offset <= 2; offset++) {
      const date = new Date(now);
      date.setDate(date.getDate() + offset);
      const bookings = await c.bookings.findByTenantAndDate(tenant.id, date);
      for (const b of bookings) {
        const bp = b.toJSON();
        if (bp.status !== 'confirmed') continue;
        if (bp.slot.startAt < windowStart || bp.slot.startAt >= windowEnd) continue;

        await c.notification.sendBookingConfirmation({
          tenantId: tenant.id,
          customerId: bp.customerId,
          bookingId: bp.id,
        });
        await c.audit.log({
          tenantId: tenant.id,
          actorType: 'system',
          action: `reminder.${parsed.data.window}`,
          entity: 'booking',
          entityId: bp.id,
          payload: { sentAt: now.toISOString() },
        });
        sent.push({ bookingId: bp.id, tenantSlug: tProps.slug, window: parsed.data.window });
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      window: parsed.data.window,
      now: now.toISOString(),
      sentCount: sent.length,
      sent,
    },
  });
}
