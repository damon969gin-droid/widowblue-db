// middleware.js
export async function middleware(request, env) {
  // Inietta l'ambiente Cloudflare in globalThis
  globalThis.__CLOUDFLARE_ENV__ = env;
  
  // Prosegui con la request
  return Response.next();
}

export const config = {
  matcher: '/api/:path*',
};
