// app/api/rewards/today/route.js
import { initDb, getStepLog, upsertStepLog, getUserById } from "../../../../lib/server/db.js";

export async function GET(request, context) {
  const env = context?.env || globalThis.__ENV;
  
  if (!env || !env.DB) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }
  
  await initDb(env.DB);

  const url = new URL(request.url);
  const userId = Number(url.searchParams.get("user_id"));

  if (!userId) {
    return Response.json({ error: "user_id missing" }, { status: 400 });
  }

  const user = await getUserById(env.DB, userId);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const log = await getStepLog(env.DB, userId, today);

  return Response.json({ user, log });
}

export async function POST(request, context) {
  const env = context?.env || globalThis.__ENV;
  
  if (!env || !env.DB) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }
  
  await initDb(env.DB);

  const body = await request.json();
  const { user_id, day, steps, wblu_awarded } = body;

  if (!user_id || !day || steps == null || wblu_awarded == null) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  await upsertStepLog(env.DB, { user_id, day, steps, wblu_awarded });

  return Response.json({ ok: true });
}
