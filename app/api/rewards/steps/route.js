// app/api/rewards/steps/route.js
import { initDb, getStepLog, upsertStepLog, getUserById } from "../../../../lib/server/db.js";
import { getUserId, unauthorized } from "../../../../lib/server/authHelper.js";
import { STEP_GOAL, MAX_PLAUSIBLE_STEPS, computeReward, today } from "../../../../lib/server/rewardsLogic.js";

export async function GET(request) {
  try {
    console.log("Rewards Steps GET - DB binding available:", typeof DB !== 'undefined');
    
    await initDb();

    const userId = getUserId(request);
    if (!userId) return unauthorized();

    const user = await getUserById(userId);
    if (!user) {
      return Response.json({ error: "Utente non trovato" }, { status: 404 });
    }

    const day = today();
    const log = await getStepLog(userId, day);

    return Response.json({
      steps: log?.steps ?? 0,
      wblu_awarded: log?.wblu_awarded ?? 0,
      stepGoal: STEP_GOAL,
    });
  } catch (error) {
    console.error("Rewards Steps GET error:", String(error));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log("Rewards Steps POST - DB binding available:", typeof DB !== 'undefined');
    
    await initDb();

    const userId = getUserId(request);
    if (!userId) return unauthorized();

    const body = await request.json().catch(() => ({}));
    let steps = Number(body.steps);

    if (!Number.isFinite(steps) || steps < 0 || steps > MAX_PLAUSIBLE_STEPS) {
      return Response.json({ error: "Numero di passi non valido" }, { status: 400 });
    }

    const day = today();
    const reward = computeReward(steps);

    await upsertStepLog({
      user_id: userId,
      day,
      steps,
      wblu_awarded: reward,
    });

    return Response.json({
      steps,
      wblu_awarded: reward,
    });
  } catch (error) {
    console.error("Rewards Steps POST error:", String(error));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}

