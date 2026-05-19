import { NextResponse } from 'next/server';
import { getContainerReady } from '@/lib/container';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
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

  const url = new URL(request.url);
  const serviceId = url.searchParams.get('serviceId');

  let staffList = await c.staff.findByTenant(tenant.id);
  if (serviceId) {
    staffList = staffList.filter((s) => s.serviceIds.includes(serviceId));
  }

  return NextResponse.json({
    success: true,
    data: staffList
      .filter((s) => s.isActive)
      .map((s) => ({
        id: s.id,
        name: s.name,
        photoUrl: s.photoUrl,
        serviceIds: s.serviceIds,
      })),
  });
}
