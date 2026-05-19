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
  const services = await c.services.findByTenant(tenant.id);
  return NextResponse.json({
    success: true,
    data: services
      .map((s) => s.toJSON())
      .filter((s) => s.isActive)
      .map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        durationMinutes: s.durationMinutes,
        priceVnd: s.priceVnd,
        depositNormalVnd: s.depositNormalVnd,
        depositPeakVnd: s.depositPeakVnd,
      })),
  });
}
