import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3301',
  'http://127.0.0.1:3301',
]);

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/public/')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : '';

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(allowed),
    });
  }

  const response = NextResponse.next();
  if (allowed) {
    for (const [k, v] of Object.entries(corsHeaders(allowed))) {
      response.headers.set(k, v);
    }
  }
  return response;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
  };
}

export const config = {
  matcher: ['/api/public/:path*'],
};
