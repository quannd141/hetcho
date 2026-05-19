import { NextResponse } from 'next/server';
import { getContainerReady } from '@/lib/container';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(params.slug);
  if (!tenant) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found' } },
      { status: 404 },
    );
  }
  const t = tenant.toJSON();
  return NextResponse.json({
    success: true,
    data: {
      id: t.id,
      slug: t.slug,
      name: t.name,
      type: t.type,
      slotMinutes: t.slotMinutes,
      timezone: t.timezone,
      workingHours: t.workingHours,
      peakWindows: t.peakWindows,
      cancelPolicy: t.cancelPolicy,
    },
  });
}
