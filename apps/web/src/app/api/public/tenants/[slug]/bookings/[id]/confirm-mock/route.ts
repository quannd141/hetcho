import { type NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { MarkDepositPaidUseCase } from '@hetcho/application';
import { getContainerReady } from '@/lib/container';

export const dynamic = 'force-dynamic';

/**
 * Mock VNPay return callback for night-shift mode.
 * Khách bấm "Thanh toán cọc" → Mini App điều hướng tới /book/success?bookingId=...
 * + đồng thời POST đến endpoint này để mark booking confirmed.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { slug: string; id: string } },
): Promise<NextResponse> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(params.slug);
  if (!tenant) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found' } },
      { status: 404 },
    );
  }

  const booking = await c.bookings.findById(params.id as never);
  if (!booking) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
      { status: 404 },
    );
  }
  const props = booking.toJSON();
  const useCase = new MarkDepositPaidUseCase(c.bookingDeps);

  try {
    const result = await useCase.execute({
      tenantId: tenant.id,
      bookingId: props.id,
      amountVnd: props.depositRequiredVnd,
      gatewayTxnId: `mock-vnpay-${randomUUID()}`,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: (err as Error).message } },
      { status: 400 },
    );
  }
}
