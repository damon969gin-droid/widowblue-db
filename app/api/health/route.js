// app/api/health/route.js
export async function GET(request) {
  // Debug: stampa tutto process.env
  console.log("process.env keys:", Object.keys(process.env || {}));
  console.log("globalThis.__CLOUDFLARE_ENV__:", globalThis.__CLOUDFLARE_ENV__ ? "exists" : "undefined");
  
  return Response.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    hasEnv: !!globalThis.__CLOUDFLARE_ENV__,
    hasDB: !!(globalThis.__CLOUDFLARE_ENV__?.DB)
  });
}
