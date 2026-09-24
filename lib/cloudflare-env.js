// lib/cloudflare-env.js
// Utility per accedere ai bindings Cloudflare in OpenNext

let cloudflareEnv = null;

export function setCloudflareEnv(env) {
  cloudflareEnv = env;
}

export function getCloudflareEnv() {
  return cloudflareEnv;
}

export function getDB() {
  if (!cloudflareEnv || !cloudflareEnv.DB) {
    throw new Error("D1 database not available");
  }
  return cloudflareEnv.DB;
}
