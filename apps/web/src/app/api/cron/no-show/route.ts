import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AutoMarkNoShowUseCase } from '@hetcho/application';
import { getContainerReady } from '@/lib/container';

export const dynamic = 'force-dynamic';

const Query = z.object({
  graceMinutes: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : undefined))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0), {
      message: 'graceMinutes must be >= 0',
    }),
});

/**
 * Cron job: auto-mark no-show for confirmed bookings past start + grace.
 *   GET /api/cron/no-show[?graceMinutes=30]
 *
 * Deposit forfeited (kept by shop). Returns counts + forfeited total per tenant.
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
  const uc = new AutoMarkNoShowUseCase(c.bookingDeps);
  const tenants = await c.tenants.findAll();
  const perTenant: Array<{
    tenantId: string;
    tenantSlug: string;
    markedCount: number;
    markedIds: string[];
    depositForfeitedVnd: number;
  }> = [];

  for (const tenant of tenants) {
    const result = await uc.execute({
      tenantId: tenant.id,
      ...(parsed.data.graceMinutes !== undefined ? { graceMinutes: parsed.data.graceMinutes } : {}),
    });
    perTenant.push({
      tenantId: tenant.id,
      tenantSlug: tenant.toJSON().slug,
      markedCount: result.markedCount,
      markedIds: result.markedIds as unknown as string[],
      depositForfeitedVnd: result.depositForfeitedTotalVnd,
    });
  }

  const totalMarked = perTenant.reduce((acc, r) => acc + r.markedCount, 0);
  const totalForfeitedVnd = perTenant.reduce((acc, r) => acc + r.depositForfeitedVnd, 0);
  return NextResponse.json({
    success: true,
    data: { totalMarked, totalForfeitedVnd, perTenant, runAt: new Date().toISOString() },
  });
}
