import { pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobsTable = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    url: text("url").notNull(),
    title: text("title"),
    company: text("company"),
    location: text("location"),
    description: text("description"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("jobs_session_id_idx").on(t.sessionId)],
);

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, sessionId: true, createdAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
