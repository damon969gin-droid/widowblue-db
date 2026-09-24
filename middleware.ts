// middleware.ts - Per OpenNext + Cloudflare
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Per OpenNext, l'ambiente è accessibile via request.env o globalThis
  const env = (request as any).env || globalThis.__CLOUDFLARE_ENV__;
  
  if (env) {
    globalThis.__CLOUDFLARE_ENV__ = env;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
