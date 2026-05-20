import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { NotifyExpiringPackagesUseCase } from '@hetcho/application';
import { getContainerReady } from '@/lib/container';

export const dynamic = 'force-dynamic';

const Query = z.object({
  windowDays: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : undefined))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 1), {
      message: 'windowDays must be >= 1',
    }),
});

/**
 * Daily cron: notify customers with packages expiring within windowDays
 * (default 7 days). Emits audit events; notification dispatch is handled
 * by the audit-event subscriber (Zalo ZNS in production).
 *
 *   GET /api/cron/package-expiring[?windowDays=7]
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
  const uc = new NotifyExpiringPackagesUseCase(c.packageDeps);
  const tenants = await c.tenants.findAll();
  const perTenant: Array<{ tenantId: string; tenantSlug: string; notifiedCount: number }> = [];

  for (const tenant of tenants) {
    const result = await uc.execute({
      tenantId: tenant.id,
      ...(parsed.data.windowDays !== undefined ? { windowDays: parsed.data.windowDays } : {}),
    });
    perTenant.push({
      tenantId: tenant.id,
      tenantSlug: tenant.toJSON().slug,
      notifiedCount: result.notifiedCount,
    });
  }

  const totalNotified = perTenant.reduce((acc, r) => acc + r.notifiedCount, 0);
  return NextResponse.json({
    success: true,
    data: { totalNotified, perTenant, runAt: new Date().toISOString() },
  });
}
