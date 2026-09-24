// app/api/rewards/steps/route.js
import { initDb, getStepLog, upsertStepLog, getUserById } from "../../../../lib/server/db.js";
import { getUserId, unauthorized } from "../../../../lib/server/authHelper.js";
import { STEP_GOAL, MAX_PLAUSIBLE_STEPS, computeReward, today } from "../../../../lib/server/rewardsLogic.js";

export async function GET(request) {
  // Inizializza DB
  const env = globalThis.__ENV;
  await initDb(env.DB);

  const userId = getUserId(request);
  if (!userId) return unauthorized();

  const user = await getUserById(env.DB, userId);
  if (!user) {
    return Response.json({ error: "Utente non trovato" }, { status: 404 });
  }

  const day = today();
  const log = await getStepLog(env.DB, userId, day);

  return Response.json({
    steps: log?.steps ?? 0,
    wblu_awarded: log?.wblu_awarded ?? 0,
    stepGoal: STEP_GOAL,
  });
}

export async function POST(request) {
  // Inizializza DB
  const env = globalThis.__ENV;
  await initDb(env.DB);

  const userId = getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => ({}));
  let steps = Number(body.steps);

  if (!Number.isFinite(steps) || steps < 0 || steps > MAX_PLAUSIBLE_STEPS) {
    return Response.json({ error: "Numero di passi non valido" }, { status: 400 });
  }

  const day = today();
  const reward = computeReward(steps);

  await upsertStepLog(env.DB, {
    user_id: userId,
    day,
    steps,
    wblu_awarded: reward,
  });

  return Response.json({
    steps,
    wblu_awarded: reward,
  });
}

