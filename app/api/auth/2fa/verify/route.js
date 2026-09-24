// app/api/auth/2fa/verify/route.js
import { initDb, getUserById, updateUserTotp } from "../../../../../lib/server/db.js";
import { verifyTotp } from "../../../../../lib/server/security.js";
import { getUserId, unauthorized } from "../../../../../lib/server/authHelper.js";

export async function POST(request) {
  try {
    console.log("2FA Verify - DB binding available:", typeof DB !== 'undefined');
    
    await initDb();

    const userId = getUserId(request);
    if (!userId) return unauthorized();

    const user = await getUserById(userId);
    if (!user) {
      return Response.json({ error: "Utente non trovato" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const totpCode = String(body.totpCode || "");

    if (!user.totp_secret) {
      return Response.json({ error: "Nessun segreto 2FA configurato" }, { status: 400 });
    }

    if (!verifyTotp(user.totp_secret, totpCode)) {
      return Response.json({ error: "Codice 2FA non valido" }, { status: 401 });
    }

    await updateUserTotp(userId, user.totp_secret, true);

    return Response.json({ ok: true, totpEnabled: true });
  } catch (error) {
    console.error("2FA Verify error:", String(error));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}

