import { OpenAI } from "openai";
import { PERSONAS, PersonaKey } from "./prompts";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.API_KEY, // server-only, never exposed to browser
});

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function getPersonaReply(
  persona: PersonaKey,
  history: ChatMessage[],
) {
  const messages = [
    { role: "system" as const, content: PERSONAS[persona].systemPrompt },
    ...history,
  ];

  async function callOnce() {
    const result = await client.chat.completions.create({
      model: "deepseek-v4-flash",
      messages,
      max_tokens: 600,
    });
    return {
      content: result.choices[0].message.content?.trim() ?? "",
      usage: result.usage,
    };
  }

  let attempt = await callOnce();
  if (!attempt.content) {
    attempt = await callOnce(); // retry once if empty
  }

  return {
    reply: attempt.content || "Arre, kuch samajh nahi aaya, phir se pucho?",
    usage: attempt.usage,
  };
}
