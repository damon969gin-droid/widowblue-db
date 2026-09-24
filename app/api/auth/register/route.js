// app/api/auth/register/route.js
import { initDb, getUserByEmail, createUser } from "../../../../lib/server/db.js";
import { hashPassword, signJwt } from "../../../../lib/server/security.js";

const JWT_SECRET = process.env.JWT_SECRET || "widowblue-secret-key-change-in-production";

export async function POST(request) {
  try {
    const env = globalThis.__CLOUDFLARE_ENV__;
    
    console.log("Register - env exists:", !!env);
    console.log("Register - env keys:", env ? Object.keys(env) : "N/A");
    console.log("Register - DB exists:", !!(env?.DB));
    
    if (!env || !env.DB) {
      return Response.json({ error: "Database not configured" }, { status: 500 });
    }

    // Inizializza DB e cattura errori
    try {
      await initDb(env.DB);
      console.log("DB initialized successfully");
    } catch (initError) {
      console.error("DB init error:", String(initError), JSON.stringify(initError, null, 2));
      return Response.json({ error: "DB init failed", details: String(initError) }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const phone = (body.phone || "").trim();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Email non valida" }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "La password deve avere almeno 8 caratteri" }, { status: 400 });
    }
    if (!phone) {
      return Response.json({ error: "Numero di telefono obbligatorio" }, { status: 400 });
    }

    const existing = await getUserByEmail(env.DB, email);
    if (existing) {
      return Response.json({ error: "Email già registrata" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(env.DB, {
      email,
      phone,
      password_hash: passwordHash,
      totp_secret: null,
    });

    const token = await signJwt({ userId: user.id }, JWT_SECRET);

    return Response.json(
      { token, user: { id: user.id, email: user.email, phone: user.phone } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", String(error), JSON.stringify(error, null, 2));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}

