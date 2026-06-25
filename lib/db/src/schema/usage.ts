import { pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Records one row per accepted AI generation. Used by the cost guardrail to cap
 * generations per anonymous session and per client IP per day, so a single
 * heavy user (or a script) can't quietly run up the OpenAI bill. This is a soft
 * limit tuned generously — normal users never hit it.
 */
export const generationUsageTable = pgTable(
  "generation_usage",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    ip: text("ip").notNull(),
    // UTC calendar day as YYYY-MM-DD, so counts reset at midnight UTC.
    day: text("day").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("generation_usage_day_session_idx").on(t.day, t.sessionId),
    index("generation_usage_day_ip_idx").on(t.day, t.ip),
  ],
);

export type GenerationUsage = typeof generationUsageTable.$inferSelect;
