// lib/server/cloudflare-db.js
// Utility per accedere al database D1 con OpenNext + Cloudflare

let dbInstance = null;

// Funzione per inizializzare il DB una volta sola
export async function getDB() {
  if (dbInstance) {
    return dbInstance;
  }
  
  // Prova ad accedere all'ambiente Cloudflare
  const env = globalThis.__CLOUDFLARE_ENV__;
  
  if (!env || !env.DB) {
    console.error("Cloudflare env:", env ? Object.keys(env) : "undefined");
    throw new Error("D1 database not available");
  }
  
  dbInstance = env.DB;
  return dbInstance;
}

// Reset per testing
export function resetDB() {
  dbInstance = null;
}
