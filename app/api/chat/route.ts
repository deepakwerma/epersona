import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPersonaReply } from "@/lib/ai";
import { PersonaKey } from "@/lib/prompts";
import { saveMessage } from "@/lib/chat";
import {
  checkRateLimit,
  checkQuota,
  incrementMessageCount,
  getRemainingMessages,
  recordSpend,
  isBudgetExhausted,
  LIMITS,
} from "@/lib/usage";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await isBudgetExhausted()) {
    return NextResponse.json(
      { error: "Free tier temporarily paused. Check back later." },
      { status: 503 },
    );
  }
  if (!(await checkRateLimit(userId))) {
    return NextResponse.json(
      { error: "Slow down — wait a few seconds between messages." },
      { status: 429 },
    );
  }
  if (!(await checkQuota(userId))) {
    return NextResponse.json(
      {
        error:
          "You've used all your free messages. Thanks for trying e Persona! Feel free to reach out to us at **deepakrvermaa@gmail.com** to request more free messages. ",
      },
      { status: 403 },
    );
  }

  const { persona, messages } = await req.json();
  if (persona !== "hitesh" && persona !== "piyush") {
    return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
  }
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.content?.length > LIMITS.MAX_INPUT_CHARS) {
    return NextResponse.json(
      {
        error: `Message too long. Keep it under ${LIMITS.MAX_INPUT_CHARS} characters.`,
      },
      { status: 400 },
    );
  }

  try {
    const { reply, usage } = await getPersonaReply(
      persona as PersonaKey,
      messages,
    );
    await incrementMessageCount(userId);
    if (usage)
      await recordSpend(usage.prompt_tokens ?? 0, usage.completion_tokens ?? 0);

    const lastUserMessage = messages[messages.length - 1];
    await saveMessage(userId, persona, "user", lastUserMessage.content);
    await saveMessage(userId, persona, "assistant", reply);

    return NextResponse.json({
      reply,
      remaining: await getRemainingMessages(userId),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI call failed" }, { status: 500 });
  }
}
