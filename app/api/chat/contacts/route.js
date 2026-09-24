// app/api/chat/contacts/route.js
import { initDb, getContacts } from "../../../../lib/server/db.js";
import { getUserId, unauthorized } from "../../../../lib/server/authHelper.js";

export async function GET(request) {
  // Inizializza DB
  const env = globalThis.__ENV;
  await initDb(env.DB);

  const userId = getUserId(request);
  if (!userId) return unauthorized();

  const rows = await getContacts(env.DB);

  return Response.json(
    rows.map((r) => ({ id: r.id, name: r.name, group: !!r.is_group }))
  );
}
