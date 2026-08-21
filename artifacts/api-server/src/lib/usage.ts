import { and, eq, count, sql } from "drizzle-orm";
import { db, generationUsageTable } from "@workspace/db";

/**
 * Soft daily caps on AI generations, keyed independently by anonymous session
 * and by client IP. Tuned for free-tier Gemini quotas shared across all
 * visitors — legitimate users stay within limits; abuse can't burn the day.
 * Override via GENERATION_SESSION_DAILY_LIMIT / GENERATION_IP_DAILY_LIMIT.
 */
const SESSION_DAILY_LIMIT = Number(process.env.GENERATION_SESSION_DAILY_LIMIT ?? 5);
const IP_DAILY_LIMIT = Number(process.env.GENERATION_IP_DAILY_LIMIT ?? 10);

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The ISO timestamp of the next UTC midnight — when daily allowances reset.
 */
export function nextUtcReset(): string {
  const now = new Date();
  const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return reset.toISOString();
}

/**
 * Reports how many free generations remain today for this browser + IP, the
 * per-browser daily cap, and when the allowance resets. The effective remaining
 * count is the smaller of the session and IP allowances, since either cap can
 * block a generation. Read-only — does not consume any allowance.
 */
export async function getGenerationAllowance(
  sessionId: string,
  ip: string
): Promise<{ remaining: number; limit: number; resetAt: string }> {
  const day = todayUtc();
  const [[sessionRow], [ipRow]] = await Promise.all([
    db
      .select({ c: count() })
      .from(generationUsageTable)
      .where(and(eq(generationUsageTable.day, day), eq(generationUsageTable.sessionId, sessionId))),
    db
      .select({ c: count() })
      .from(generationUsageTable)
      .where(and(eq(generationUsageTable.day, day), eq(generationUsageTable.ip, ip))),
  ]);

  const sessionCount = Number(sessionRow?.c ?? 0);
  const ipCount = Number(ipRow?.c ?? 0);
  const sessionRemaining = Math.max(0, SESSION_DAILY_LIMIT - sessionCount);
  const ipRemaining = Math.max(0, IP_DAILY_LIMIT - ipCount);

  return {
    remaining: Math.min(sessionRemaining, ipRemaining),
    limit: SESSION_DAILY_LIMIT,
    resetAt: nextUtcReset(),
  };
}

/**
 * Atomically checks the daily caps and, if within limits, records one
 * generation. Returns true when the generation was recorded (allowed) and
 * false when a cap was hit.
 *
 * A per-session Postgres advisory lock (held for the transaction) serializes
 * concurrent requests from the same browser — the batch-generate case — so the
 * check and the insert can't interleave and overshoot the cap. The usage row is
 * only written when the request is within limits.
 */
export async function tryConsumeGeneration(sessionId: string, ip: string): Promise<boolean> {
  const day = todayUtc();
  return db.transaction(async (tx) => {
    // Serialize accounting per session; the lock auto-releases at txn end.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${sessionId})::bigint)`);

    const [sessionRow] = await tx
      .select({ c: count() })
      .from(generationUsageTable)
      .where(and(eq(generationUsageTable.day, day), eq(generationUsageTable.sessionId, sessionId)));
    const [ipRow] = await tx
      .select({ c: count() })
      .from(generationUsageTable)
      .where(and(eq(generationUsageTable.day, day), eq(generationUsageTable.ip, ip)));

    const sessionCount = Number(sessionRow?.c ?? 0);
    const ipCount = Number(ipRow?.c ?? 0);
    if (sessionCount >= SESSION_DAILY_LIMIT || ipCount >= IP_DAILY_LIMIT) {
      return false;
    }

    await tx.insert(generationUsageTable).values({ sessionId, ip, day });
    return true;
  });
}
