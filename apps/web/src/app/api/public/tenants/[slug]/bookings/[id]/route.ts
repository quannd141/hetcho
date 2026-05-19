import { type NextRequest, NextResponse } from 'next/server';
import { CancelBookingUseCase } from '@hetcho/application';
import { getContainerReady } from '@/lib/container';
import { getBoundCustomerId } from '@/lib/customer-session';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string; id: string } },
): Promise<NextResponse> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(params.slug);
  if (!tenant) return notFound();

  const booking = await c.bookings.findById(params.id as never);
  if (!booking) return notFound();
  const props = booking.toJSON();
  if (props.tenantId !== tenant.id) return notFound();

  const boundCustomerId = getBoundCustomerId(params.slug);
  if (boundCustomerId && boundCustomerId !== props.customerId) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Booking belongs to other customer' } },
      { status: 403 },
    );
  }

  const [service, staff] = await Promise.all([
    c.services.findById(props.serviceId, tenant.id),
    c.staff.findById(props.staffId, tenant.id),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      bookingId: props.id,
      status: props.status,
      startAt: props.slot.startAt.toISOString(),
      endAt: props.slot.endAt.toISOString(),
      durationMinutes: Math.round((props.slot.endAt.getTime() - props.slot.startAt.getTime()) / 60_000),
      serviceName: service?.toJSON().name ?? '—',
      servicePriceVnd: service?.priceVnd ?? 0,
      staffName: staff?.name ?? '—',
      depositRequiredVnd: props.depositRequiredVnd,
      depositPaidVnd: props.depositPaidVnd,
      finalPriceVnd: props.finalPriceVnd ?? null,
      isPeakSlot: tenant.isPeakSlot(props.slot.startAt),
      tenantName: tenant.toJSON().name,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string; id: string } },
): Promise<NextResponse> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(params.slug);
  if (!tenant) return notFound();

  const booking = await c.bookings.findById(params.id as never);
  if (!booking) return notFound();
  const props = booking.toJSON();
  if (props.tenantId !== tenant.id) return notFound();

  const boundCustomerId = getBoundCustomerId(params.slug);
  if (boundCustomerId && boundCustomerId !== props.customerId) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Not your booking' } },
      { status: 403 },
    );
  }

  const useCase = new CancelBookingUseCase(c.bookingDeps);
  try {
    const result = await useCase.execute({
      tenantId: tenant.id,
      bookingId: props.id,
      actorType: 'customer',
      reason: 'customer-cancel',
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'CANCEL_ERROR', message: (err as Error).message } },
      { status: 400 },
    );
  }
}

function notFound() {
  return NextResponse.json(
    { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
    { status: 404 },
  );
}
