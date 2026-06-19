import { pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const documentsTable = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("documents_session_id_idx").on(t.sessionId)],
);

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, sessionId: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
