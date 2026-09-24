// app/api/chat/[contactId]/messages/route.js
import { initDb, getContactById, getMessagesForContact, saveMessage } from "../../../../../lib/server/db.js";
import { getUserId, unauthorized } from "../../../../../lib/server/authHelper.js";
import { publish } from "../../../../../lib/server/pubsub.js";

export async function GET(request, { params }) {
  try {
    console.log("Chat Messages GET - DB binding available:", typeof DB !== 'undefined');
    
    await initDb();

    const userId = getUserId(request);
    if (!userId) return unauthorized();

    const { contactId } = params;

    const contact = await getContactById(contactId);
    if (!contact) {
      return Response.json({ error: "Contatto non trovato" }, { status: 404 });
    }

    const rows = await getMessagesForContact(contactId);

    return Response.json(
      rows.map((r) => ({
        id: r.id,
        from: r.sender,
        text: r.text,
        time: r.created_at,
      }))
    );
  } catch (error) {
    console.error("Chat Messages GET error:", String(error));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    console.log("Chat Messages POST - DB binding available:", typeof DB !== 'undefined');
    
    await initDb();

    const userId = getUserId(request);
    if (!userId) return unauthorized();

    const { contactId } = params;

    const contact = await getContactById(contactId);
    if (!contact) {
      return Response.json({ error: "Contatto non trovato" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const text = (body.text || "").trim();

    if (!text) {
      return Response.json({ error: "Messaggio vuoto" }, { status: 400 });
    }

    await saveMessage({
      contact_id: contactId,
      user_id: userId,
      sender: "user",
      text,
    });

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
  } catch (error) {
    console.error("Chat Messages POST error:", String(error));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}