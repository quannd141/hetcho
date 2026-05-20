import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AutoReleaseStalePendingUseCase } from '@hetcho/application';
import { getContainerReady } from '@/lib/container';

export const dynamic = 'force-dynamic';

const Query = z.object({
  pendingTimeoutMs: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : undefined))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 60_000), {
      message: 'pendingTimeoutMs must be >= 60000',
    }),
});

/**
 * Cron job: auto-release pending bookings unpaid > 5 minutes.
 *   GET /api/cron/auto-release[?pendingTimeoutMs=300000]
 *
 * Runs per-tenant. Returns counts per tenant.
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
  const uc = new AutoReleaseStalePendingUseCase(c.bookingDeps);
  const tenants = await c.tenants.findAll();
  const perTenant: Array<{ tenantId: string; tenantSlug: string; releasedCount: number; releasedIds: string[] }> = [];

  for (const tenant of tenants) {
    const result = await uc.execute({
      tenantId: tenant.id,
      ...(parsed.data.pendingTimeoutMs !== undefined ? { pendingTimeoutMs: parsed.data.pendingTimeoutMs } : {}),
    });
    perTenant.push({
      tenantId: tenant.id,
      tenantSlug: tenant.toJSON().slug,
      releasedCount: result.releasedCount,
      releasedIds: result.releasedIds as unknown as string[],
    });
  }

  const totalReleased = perTenant.reduce((acc, r) => acc + r.releasedCount, 0);
  return NextResponse.json({
    success: true,
    data: { totalReleased, perTenant, runAt: new Date().toISOString() },
  });
}
