import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      service: 'het-cho-web',
      timestamp: new Date().toISOString(),
      nightShiftMode: process.env.NIGHT_SHIFT_MODE === 'true',
    },
  });
}
