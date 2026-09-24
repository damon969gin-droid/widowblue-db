// app/api/auth/2fa/setup/route.js
import { initDb, getUserById, updateUserTotp } from "../../../../../lib/server/db.js";
import { generateTotpSecret, totpUri } from "../../../../../lib/server/security.js";
import { getUserId, unauthorized } from "../../../../../lib/server/authHelper.js";

export async function GET(request) {
  try {
    console.log("2FA Setup - DB binding available:", typeof DB !== 'undefined');
    
    await initDb();

    const userId = getUserId(request);
    if (!userId) return unauthorized();

    const user = await getUserById(userId);
    if (!user) {
      return Response.json({ error: "Utente non trovato" }, { status: 404 });
    }

    const totpSecret = generateTotpSecret();
    const issuer = "Widow Blue";
    const uri = totpUri(totpSecret, issuer, user.email);

    await updateUserTotp(userId, totpSecret, false);

    return Response.json({ totpUri: uri });
  } catch (error) {
    console.error("2FA Setup error:", String(error));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}
