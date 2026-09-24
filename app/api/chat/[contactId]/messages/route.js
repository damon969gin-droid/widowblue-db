// app/api/chat/[contactId]/messages/route.js
import { initDb, getContactById, getMessagesForContact, saveMessage } from "../../../../../lib/server/db.js";
import { getUserId, unauthorized } from "../../../../../lib/server/authHelper.js";
import { publish } from "../../../../../lib/server/pubsub.js";

export async function GET(request, { params, env }) {
  // Inizializza DB
  const env = globalThis.__ENV;
  await initDb(env.DB);

  const userId = getUserId(request);
  if (!userId) return unauthorized();

  const { contactId } = params;

  const contact = await getContactById(env.DB, contactId);
  if (!contact) {
    return Response.json({ error: "Contatto non trovato" }, { status: 404 });
  }

  const rows = await getMessagesForContact(env.DB, contactId);

  return Response.json(
    rows.map((r) => ({
      id: r.id,
      from: r.sender,
      text: r.text,
      time: r.created_at,
    }))
  );
}

export async function POST(request, { params, env }) {
  // Inizializza DB
  const env = globalThis.__ENV;
  await initDb(env.DB);

  const userId = getUserId(request);
  if (!userId) return unauthorized();

  const { contactId } = params;

  const contact = await getContactById(env.DB, contactId);
  if (!contact) {
    return Response.json({ error: "Contatto non trovato" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const text = (body.text || "").trim();

  if (!text) {
    return Response.json({ error: "Messaggio vuoto" }, { status: 400 });
  }

  await saveMessage(env.DB, {
    contact_id: contactId,
    user_id: userId,
    sender: "user", // o come chiami l'utente nel tuo sistema
    text,
  });

  // Pubblica il messaggio ai subscriber (se usi pubsub)
  await publish(contactId, {
    type: "message",
    data: {
      contactId,
      from: "user",
      text,
      time: new Date().toISOString(),
    },
  });

  return Response.json({ ok: true }, { status: 201 });
}
