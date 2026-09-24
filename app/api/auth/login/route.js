// app/api/auth/login/route.js
import { initDb, getUserByEmail } from "../../../../lib/server/db.js";
import { verifyPassword, verifyTotp, signJwt } from "../../../../lib/server/security.js";

const JWT_SECRET = process.env.JWT_SECRET || "widowblue-secret-key-change-in-production";

export async function POST(request, { env }) {
  try {
    if (!env || !env.DB) {
      console.error("D1 binding DB not found in env:", env ? Object.keys(env) : "env is undefined");
      return Response.json({ error: "Database not configured" }, { status: 500 });
    }

    await initDb(env.DB);

    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const totpCode = body.totpCode;

    if (!email || !password) {
      return Response.json({ error: "Email e password sono obbligatori" }, { status: 400 });
    }

    const user = await getUserByEmail(env.DB, email);

    if (!user || !await verifyPassword(password, user.password_hash)) {
      return Response.json({ error: "Credenziali non valide" }, { status: 401 });
    }

    if (user.totp_enabled) {
      if (!totpCode || !await verifyTotp(user.totp_secret, String(totpCode))) {
        return Response.json(
          { error: "Codice 2FA mancante o non valido", requires2fa: true },
          { status: 401 }
        );
      }
    }

    const token = await signJwt({ userId: user.id }, JWT_SECRET);

    return Response.json(
      { token, user: { id: user.id, email: user.email, phone: user.phone } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", String(error), JSON.stringify(error, null, 2));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}
