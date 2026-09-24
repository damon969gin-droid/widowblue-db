// app/api/rewards/today/route.js
import { initDb, getStepLog, upsertStepLog, getUserById } from "../../../../lib/server/db.js";

export async function GET(request) {
  // Assicurati che il DB sia inizializzato (puoi farlo una volta all'avvio del worker)
  const env = globalThis.__ENV;
  await initDb(env.DB);

  // Esempio: prendi user_id da query o da sessione/auth
  const url = new URL(request.url);
  const userId = Number(url.searchParams.get("user_id"));

  if (!userId) {
    return new Response(JSON.stringify({ error: "user_id missing" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await getUserById(env.DB, userId);
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const log = await getStepLog(env.DB, userId, today);

  return new Response(JSON.stringify({ user, log }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
  const env = globalThis.__ENV;
  await initDb(env.DB);

  const body = await request.json();
  const { user_id, day, steps, wblu_awarded } = body;

  if (!user_id || !day || steps == null || wblu_awarded == null) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await upsertStepLog(env.DB, { user_id, day, steps, wblu_awarded });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

