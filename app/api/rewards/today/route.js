// app/api/rewards/today/route.js
import { initDb, getStepLog, upsertStepLog, getUserById } from "../../../../lib/server/db.js";

export async function GET(request) {
  try {
    console.log("Rewards Today GET - DB binding available:", typeof DB !== 'undefined');
    
    await initDb();

    const url = new URL(request.url);
    const userId = Number(url.searchParams.get("user_id"));

    if (!userId) {
      return Response.json({ error: "user_id missing" }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const log = await getStepLog(userId, today);

    return Response.json({ user, log });
  } catch (error) {
    console.error("Rewards Today GET error:", String(error));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log("Rewards Today POST - DB binding available:", typeof DB !== 'undefined');
    
    await initDb();

    const body = await request.json();
    const { user_id, day, steps, wblu_awarded } = body;

    if (!user_id || !day || steps == null || wblu_awarded == null) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    await upsertStepLog({ user_id, day, steps, wblu_awarded });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Rewards Today POST error:", String(error));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}
