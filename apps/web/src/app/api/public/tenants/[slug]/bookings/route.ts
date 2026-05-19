import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateBookingUseCase } from '@hetcho/application';
import { getContainerReady } from '@/lib/container';
import { ensureCustomerForTenant, getBoundCustomerId } from '@/lib/customer-session';

export const dynamic = 'force-dynamic';

const Body = z.object({
  serviceId: z.string().uuid(),
  staffId: z.string().uuid(),
  startAt: z.string(),
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().regex(/^0\d{9}$/),
  }),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(params.slug);
  if (!tenant) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found' } },
      { status: 404 },
    );
  }

  const { customerId } = await ensureCustomerForTenant({
    tenantSlug: params.slug,
    phone: input.customer.phone,
    name: input.customer.name,
  });

  const useCase = new CreateBookingUseCase(c.bookingDeps);
  try {
    const result = await useCase.execute({
      tenantId: tenant.id,
      customerId,
      serviceId: input.serviceId,
      staffId: input.staffId,
      startAt: new Date(input.startAt),
      returnUrl: `${request.nextUrl.origin}/${params.slug}/book/success`,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'BOOKING_ERROR', message: (err as Error).message } },
      { status: 400 },
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  const customerId = getBoundCustomerId(params.slug);
  if (!customerId) {
    return NextResponse.json({ success: true, data: { bookings: [] } });
  }

  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(params.slug);
  if (!tenant) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found' } },
      { status: 404 },
    );
  }

  // Iterate bookings repo; in-memory doesn't have findByCustomer so we scan dates
  const allBookings: Array<{ bookingId: string; status: string; startAt: string; endAt: string; serviceName: string; finalPriceVnd: number | null }> = [];
  const today = new Date();
  for (let offset = -30; offset <= 30; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dayBookings = await c.bookings.findByTenantAndDate(tenant.id, date);
    for (const b of dayBookings) {
      const props = b.toJSON();
      if (props.customerId !== customerId) continue;
      const service = await c.services.findById(props.serviceId, tenant.id);
      allBookings.push({
        bookingId: props.id,
        status: props.status,
        startAt: props.slot.startAt.toISOString(),
        endAt: props.slot.endAt.toISOString(),
        serviceName: service?.toJSON().name ?? '—',
        finalPriceVnd: props.finalPriceVnd ?? null,
      });
    }
  }
  allBookings.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  return NextResponse.json({ success: true, data: { bookings: allBookings } });
}
