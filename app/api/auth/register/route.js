// app/api/auth/register/route.js
import { initDb, getUserByEmail, createUser } from "../../../../lib/server/db.js";
import { hashPassword } from "../../../../lib/server/security.js";
import { signToken } from "../../../../lib/server/authHelper.js";

export async function POST(request, { env }) {
  // Inizializza DB
  await initDb(env.DB);

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

  const passwordHash = hashPassword(password);
  const user = await createUser(env.DB, {
    email,
    phone,
    password_hash: passwordHash,
    totp_secret: null,
  });

  const token = signToken(user.id);

  return Response.json(
    { token, user: { id: user.id, email: user.email, phone: user.phone } },
    { status: 201 }
  );
}
