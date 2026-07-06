import { OpenAI } from "openai";
import { PERSONAS, PersonaKey } from "./prompts";
import { searchCreatorVideos } from "./tools/youtube";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.API_KEY,
});

type ChatMessage = { role: "user" | "assistant"; content: string };

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_creator_videos",
      description:
        "Search this persona's own YouTube videos for a topic. Use this whenever referencing a real video would make your teaching answer more credible or helpful, not just when explicitly asked. Default maxResults to 2 for a normal suggestion; only go higher if the user explicitly asks for more videos or a list. When mentioning a video in your reply, ALWAYS format it as a markdown link using the exact title and url from the tool result, like this: [video title](url) — never mention a title without its clickable link.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string" },
          maxResults: {
            type: "number",
            description:
              "How many videos to return. Default 2 unless user explicitly wants more.",
          },
        },
        required: ["topic"],
      },
    },
  },
];

async function runTool(functionName: string, args: any, persona: PersonaKey) {
  switch (functionName) {
    case "search_creator_videos":
      return await searchCreatorVideos(
        args.topic,
        persona,
        args.maxResults ?? 2,
      );
  }
}

export async function getPersonaReply(
  persona: PersonaKey,
  history: ChatMessage[],
) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system" as const, content: PERSONAS[persona].systemPrompt },
    ...history,
  ];

  let usage;

  for (let round = 1; round <= 4; round++) {
    console.log(` round ${round}: calling model...`);

    const result = await client.chat.completions.create({
      model: "deepseek-v4-flash",
      messages,
      tools: TOOLS,
      max_tokens: 600,
    });

    const choice = result.choices[0];
    usage = result.usage;

    if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
      const content = choice.message.content?.trim();

      if (content) {
        console.log(` (OUTPUT): ${content.slice(0, 80)}...`);
        return { reply: content, usage };
      }

      console.log(" Empty reply, retrying once...");
      const retry = await client.chat.completions.create({
        model: "deepseek-v4-flash",
        messages,
        tools: TOOLS,
        max_tokens: 600,
      });
      const retryContent = retry.choices[0].message.content?.trim();
      usage = retry.usage;

      return {
        reply: retryContent || "Arre, kuch samajh nahi aaya, phir se pucho?",
        usage,
      };
    }

    messages.push(choice.message);

    for (const call of choice.message.tool_calls) {
      if (call.type !== "function") continue;

      const args = JSON.parse(call.function.arguments);
      console.log(
        ` (TOOL_REQUEST): ${call.function.name}(${JSON.stringify(args)})`,
      );

      const output = await runTool(call.function.name, args, persona);

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(output),
      });
    }
  }

  console.error(" Hit max rounds without a final answer");
  return { reply: "Kuch zyada steps lag rahe hain, seedha pucho.", usage };
}
