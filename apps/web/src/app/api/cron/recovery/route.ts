import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FindCustomersForRecoveryUseCase } from '@hetcho/application';
import { getContainerReady } from '@/lib/container';

export const dynamic = 'force-dynamic';

const Query = z.object({
  buckets: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => Number.parseInt(s.trim(), 10)) : undefined))
    .refine(
      (v) => v === undefined || v.every((n) => Number.isInteger(n) && n >= 1),
      { message: 'buckets must be comma-separated positive integers (e.g. 30,60,90)' },
    ),
  toleranceDays: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : undefined))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0), {
      message: 'toleranceDays must be >= 0',
    }),
});

/**
 * Daily cron: find customers whose lastVisitAt sits on a recovery bucket
 * (default 30 / 60 / 90 days ago, ±1 day tolerance). Emits audit events
 * for downstream Zalo ZNS dispatch.
 *
 *   GET /api/cron/recovery[?buckets=30,60,90&toleranceDays=1]
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
  const uc = new FindCustomersForRecoveryUseCase({
    tenants: c.bookingDeps.tenants,
    customers: c.bookingDeps.customers,
    audit: c.bookingDeps.audit,
    now: c.bookingDeps.now,
  });
  const tenants = await c.tenants.findAll();
  const perTenant: Array<{
    tenantId: string;
    tenantSlug: string;
    matchedCount: number;
    perBucket: Record<number, number>;
  }> = [];

  for (const tenant of tenants) {
    const result = await uc.execute({
      tenantId: tenant.id,
      ...(parsed.data.buckets !== undefined ? { buckets: parsed.data.buckets } : {}),
      ...(parsed.data.toleranceDays !== undefined ? { toleranceDays: parsed.data.toleranceDays } : {}),
    });
    const perBucket: Record<number, number> = {};
    for (const m of result.matches) {
      perBucket[m.bucketDays] = (perBucket[m.bucketDays] ?? 0) + 1;
    }
    perTenant.push({
      tenantId: tenant.id,
      tenantSlug: tenant.toJSON().slug,
      matchedCount: result.matchedCount,
      perBucket,
    });
  }

  const totalMatched = perTenant.reduce((acc, r) => acc + r.matchedCount, 0);
  return NextResponse.json({
    success: true,
    data: { totalMatched, perTenant, runAt: new Date().toISOString() },
  });
}
