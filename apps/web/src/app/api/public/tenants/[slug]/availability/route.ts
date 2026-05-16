import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const Query = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
});

/**
 * GET /api/public/tenants/:slug/availability?date=2026-06-01&serviceId=...
 *
 * Sprint 0: stub trả mock slot grid (30-min interval 8:00-22:00).
 * Sprint 2: implement thật qua use case GetAvailabilityUseCase.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 },
    );
  }

  const slots = generateMockSlots(parsed.data.date);
  return NextResponse.json({
    success: true,
    data: {
      tenantSlug: params.slug,
      date: parsed.data.date,
      slots,
    },
  });
}

function generateMockSlots(date: string): Array<{ startAt: string; available: boolean }> {
  const result: Array<{ startAt: string; available: boolean }> = [];
  for (let h = 8; h < 22; h++) {
    for (const m of [0, 30]) {
      const startAt = `${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+07:00`;
      result.push({ startAt, available: Math.random() > 0.3 });
    }
  }
  return result;
}
