import { sql } from "./db";

type Persona = "hitesh" | "piyush";
type Role = "user" | "assistant";

export async function saveMessage(userId: string, persona: Persona, role: Role, content: string) {
  await sql`
    INSERT INTO messages (user_id, persona, role, content)
    VALUES (${userId}, ${persona}, ${role}, ${content})
  `;
}

export async function getHistory(userId: string, persona: Persona) {
  const rows = await sql`
    SELECT role, content FROM messages
    WHERE user_id = ${userId} AND persona = ${persona}
    ORDER BY created_at ASC
  `;
  return rows as { role: Role; content: string }[];
}