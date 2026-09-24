// app/api/chat/contacts/route.js
import { initDb, getContacts } from "../../../../lib/server/db.js";
import { getUserId, unauthorized } from "../../../../lib/server/authHelper.js";

export async function GET(request) {
  try {
    console.log("Chat Contacts - DB binding available:", typeof DB !== 'undefined');
    
    await initDb();

    const userId = getUserId(request);
    if (!userId) return unauthorized();

    const rows = await getContacts();

    return Response.json(
      rows.map((r) => ({ id: r.id, name: r.name, group: !!r.is_group }))
    );
  } catch (error) {
    console.error("Chat Contacts error:", String(error));
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}
