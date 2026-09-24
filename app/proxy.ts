// app/proxy.ts - Next.js 16 proxy handler
import { NextResponse } from 'next/server';

export async function GET(request: Request, { env }: { env: any }) {
  // Inietta l'ambiente Cloudflare in globalThis
  globalThis.__CLOUDFLARE_ENV__ = env;
  
  // Ritorna una response vuota - il proxy serve solo per injectare env
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: Request, { env }: { env: any }) {
  globalThis.__CLOUDFLARE_ENV__ = env;
  return new NextResponse(null, { status: 204 });
}

export async function PUT(request: Request, { env }: { env: any }) {
  globalThis.__CLOUDFLARE_ENV__ = env;
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(request: Request, { env }: { env: any }) {
  globalThis.__CLOUDFLARE_ENV__ = env;
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: Request, { env }: { env: any }) {
  globalThis.__CLOUDFLARE_ENV__ = env;
  return new NextResponse(null, { status: 204 });
}

export async function HEAD(request: Request, { env }: { env: any }) {
  globalThis.__CLOUDFLARE_ENV__ = env;
  return new NextResponse(null, { status: 204 });
}

export async function OPTIONS(request: Request, { env }: { env: any }) {
  globalThis.__CLOUDFLARE_ENV__ = env;
  return new NextResponse(null, { status: 204 });
}
