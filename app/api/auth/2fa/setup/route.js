// app/api/auth/2fa/setup/route.js
import { initDb, getUserById, updateUserTotp } from "../../../../../lib/server/db.js";
import { generateTotpSecret, totpUri } from "../../../../../lib/server/security.js";
import { getUserId, unauthorized } from "../../../../../lib/server/authHelper.js";

export async function GET(request) {
  const env = globalThis.__ENV;
  await initDb(env.DB);

  const userId = getUserId(request);
  if (!userId) return unauthorized();

  const user = await getUserById(env.DB, userId);
  if (!user) {
    return Response.json({ error: "Utente non trovato" }, { status: 404 });
  }

  const totpSecret = generateTotpSecret();
  const issuer = "Widow Blue";
  const uri = totpUri(totpSecret, issuer, user.email);

  await updateUserTotp(env.DB, userId, totpSecret, false);

  return Response.json({ totpUri: uri });
}

