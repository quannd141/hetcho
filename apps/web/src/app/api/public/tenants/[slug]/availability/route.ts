import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GetAvailabilitySlotsUseCase } from '@hetcho/application';
import { getContainerReady } from '@/lib/container';

export const dynamic = 'force-dynamic';

const Query = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().uuid(),
});

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

  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(params.slug);
  if (!tenant) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found' } },
      { status: 404 },
    );
  }

  const useCase = new GetAvailabilitySlotsUseCase({
    tenants: c.tenants,
    services: c.services,
    bookings: c.bookings,
  });

  try {
    const result = await useCase.execute({
      tenantId: tenant.id,
      serviceId: parsed.data.serviceId,
      date: new Date(parsed.data.date + 'T00:00:00.000+07:00'),
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: (err as Error).message } },
      { status: 400 },
    );
  }
}
