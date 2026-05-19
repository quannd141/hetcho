import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureCustomerForTenant, readCustomerCookie, clearCustomerSession } from '@/lib/customer-session';

export const dynamic = 'force-dynamic';

const Body = z.object({
  tenantSlug: z.string().min(1),
  phone: z.string().regex(/^0\d{9}$/),
  name: z.string().min(1).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 },
    );
  }

  const { customerId, created } = await ensureCustomerForTenant({
    tenantSlug: parsed.data.tenantSlug,
    phone: parsed.data.phone,
    name: parsed.data.name ?? 'Khách',
  });

  return NextResponse.json({
    success: true,
    data: { customerId, created, phone: parsed.data.phone },
  });
}

export async function GET(): Promise<NextResponse> {
  const cookie = readCustomerCookie();
  return NextResponse.json({
    success: true,
    data: cookie
      ? {
          phone: cookie.phone,
          name: cookie.name,
          tenantBindings: cookie.tenantBindings,
        }
      : null,
  });
}

export async function DELETE(): Promise<NextResponse> {
  clearCustomerSession();
  return NextResponse.json({ success: true, data: { loggedOut: true } });
}
