import { sql } from "./db";

export const LIMITS = {
  MAX_MESSAGES_PER_USER: 18,
  MAX_INPUT_CHARS: 500,
  MAX_OUTPUT_TOKENS: 300,
  MIN_MS_BETWEEN_REQUESTS: 3000,
  BUDGET_USD: 2,
  KILL_SWITCH_RATIO: 0.85,
};

const INPUT_COST_PER_TOKEN = 0.14 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 0.28 / 1_000_000;

async function getOrCreateUsage(userId: string) {
  const rows = await sql`
    INSERT INTO usage_tracking (user_id) VALUES (${userId})
    ON CONFLICT (user_id) DO NOTHING
    RETURNING *
  `;
  if (rows.length > 0) return rows[0];
  const existing =
    await sql`SELECT * FROM usage_tracking WHERE user_id = ${userId}`;
  return existing[0];
}

export async function checkRateLimit(userId: string): Promise<boolean> {
  const record = await getOrCreateUsage(userId);
  const now = Date.now();
  if (now - Number(record.last_request_at) < LIMITS.MIN_MS_BETWEEN_REQUESTS)
    return false;
  await sql`UPDATE usage_tracking SET last_request_at = ${now} WHERE user_id = ${userId}`;
  return true;
}

export async function checkQuota(userId: string): Promise<boolean> {
  const record = await getOrCreateUsage(userId);
  return Number(record.message_count) < LIMITS.MAX_MESSAGES_PER_USER;
}

export async function incrementMessageCount(userId: string) {
  await sql`UPDATE usage_tracking SET message_count = message_count + 1 WHERE user_id = ${userId}`;
}

export async function getRemainingMessages(userId: string): Promise<number> {
  const record = await getOrCreateUsage(userId);
  return Math.max(
    0,
    LIMITS.MAX_MESSAGES_PER_USER - Number(record.message_count),
  );
}

export async function recordSpend(inputTokens: number, outputTokens: number) {
  const cost =
    inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;
  await sql`UPDATE global_spend SET total_usd = total_usd + ${cost} WHERE id = 1`;
}

export async function isBudgetExhausted(): Promise<boolean> {
  const rows = await sql`SELECT total_usd FROM global_spend WHERE id = 1`;
  return (
    Number(rows[0].total_usd) >= LIMITS.BUDGET_USD * LIMITS.KILL_SWITCH_RATIO
  );
}
