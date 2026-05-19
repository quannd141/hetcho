import { type NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Review } from '@hetcho/domain';
import { BookingId, CustomerId, ReviewId, TenantId } from '@hetcho/shared';
import { getContainerReady } from '@/lib/container';
import { getBoundCustomerId } from '@/lib/customer-session';

export const dynamic = 'force-dynamic';

const Body = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).default(''),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } },
): Promise<NextResponse> {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
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

  const booking = await c.bookings.findById(BookingId(params.id));
  if (!booking) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
      { status: 404 },
    );
  }
  const props = booking.toJSON();
  if (props.tenantId !== tenant.id) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Booking not in tenant' } },
      { status: 404 },
    );
  }
  if (props.status !== 'completed') {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_STATE', message: 'Chỉ đánh giá khi booking đã completed' } },
      { status: 400 },
    );
  }

  const customerId = getBoundCustomerId(params.slug);
  if (!customerId || customerId !== props.customerId) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Not your booking' } },
      { status: 403 },
    );
  }

  const existing = await c.reviews.findByBookingId(BookingId(params.id));
  const review = Review.create({
    id: existing?.id ?? ReviewId(randomUUID()),
    tenantId: TenantId(tenant.id),
    bookingId: BookingId(params.id),
    customerId: CustomerId(props.customerId),
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    createdAt: existing?.toJSON().createdAt ?? new Date(),
  });
  await c.reviews.save(review);

  return NextResponse.json({ success: true, data: { saved: true, reviewId: review.id } });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string; id: string } },
): Promise<NextResponse> {
  const c = await getContainerReady();
  const review = await c.reviews.findByBookingId(BookingId(params.id));
  return NextResponse.json({ success: true, data: review ? review.toJSON() : null });
}
