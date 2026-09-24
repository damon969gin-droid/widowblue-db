// app/api/chat/contacts/route.js
import { initDb, getContacts } from "../../../../lib/server/db.js";
import { getUserId, unauthorized } from "../../../../lib/server/authHelper.js";

export async function GET(request) {
  const env = globalThis.__CLOUDFLARE_ENV__;
  
  if (!env || !env.DB) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }
  
  await initDb(env.DB);

  const userId = getUserId(request);
  if (!userId) return unauthorized();

  const rows = await getContacts(env.DB);

  return Response.json(
    rows.map((r) => ({ id: r.id, name: r.name, group: !!r.is_group }))
  );
}
