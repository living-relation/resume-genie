import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationsTable = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    jobId: integer("job_id").notNull(),
    jobTitle: text("job_title"),
    jobCompany: text("job_company"),
    resume: text("resume"),
    coverLetter: text("cover_letter"),
    status: text("status").notNull().default("generating"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("applications_session_id_idx").on(t.sessionId)],
);

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, sessionId: true, createdAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
