import { and, eq, count, sql } from "drizzle-orm";
import { db, generationUsageTable } from "@workspace/db";

/**
 * Soft daily caps on AI generations, keyed independently by anonymous session
 * and by client IP. The point is cost control: each generation costs real
 * OpenAI money and there is no payment gate, so we prevent runaway usage while
 * staying generous enough that legitimate users never notice. Tunable via env.
 */
const SESSION_DAILY_LIMIT = Number(process.env.GENERATION_SESSION_DAILY_LIMIT ?? 20);
const IP_DAILY_LIMIT = Number(process.env.GENERATION_IP_DAILY_LIMIT ?? 40);

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
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
