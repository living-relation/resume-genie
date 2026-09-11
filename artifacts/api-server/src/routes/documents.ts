import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import {
  CreateDocumentBody,
  GetDocumentParams,
  DeleteDocumentParams,
} from "@workspace/api-zod";
import { stripSession } from "../lib/session";
import { resolveDocumentFormat } from "../lib/document-format";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/documents", async (req, res): Promise<void> => {
  const docs = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.sessionId, req.sessionId))
    .orderBy(documentsTable.createdAt);
  res.json(docs.map(stripSession));
});

router.post("/documents", async (req, res): Promise<void> => {
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [doc] = await db
      .insert(documentsTable)
      .values({ ...parsed.data, sessionId: req.sessionId })
      .returning();
    res.status(201).json(stripSession(doc));
  } catch (err) {
    logger.error({ err }, "Failed to save document");
    res.status(500).json({
      error:
        "Could not save document. Check that DATABASE_URL in .env is set and the database is reachable.",
    });
  }
});

router.post("/documents/extract-pdf", (req, res, next) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "File is too large. Maximum size is 10 MB." });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}, async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const format = resolveDocumentFormat(req.file.mimetype, req.file.originalname);
  if (!format) {
    res.status(400).json({ error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." });
    return;
  }

  try {
    let text = "";

    if (format === "pdf") {
      const result = await pdfParse(req.file.buffer);
      text = result.text.trim();
      if (!text) {
        res.status(400).json({ error: "Could not extract text from PDF — try copying and pasting instead" });
        return;
      }
    } else if (format === "docx" || format === "doc") {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value.trim();
      if (!text) {
        res.status(400).json({ error: "Could not extract text from this Word document" });
        return;
      }
    } else if (format === "txt") {
      text = req.file.buffer.toString("utf-8").trim();
      if (!text) {
        res.status(400).json({ error: "The text file appears to be empty" });
        return;
      }
    }

    const ext = new RegExp(`\\.(${format}|pdf|docx?|txt)$`, "i");
    const suggestedName = req.file.originalname.replace(ext, "").replace(/[-_]/g, " ") || "My Resume";

    res.json({ text, suggestedName });
  } catch {
    res.status(400).json({ error: "Failed to parse file — try copying and pasting the text instead" });
  }
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  const params = GetDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [doc] = await db
    .select()
    .from(documentsTable)
    .where(and(eq(documentsTable.id, params.data.id), eq(documentsTable.sessionId, req.sessionId)));
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.json(stripSession(doc));
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [doc] = await db
    .delete(documentsTable)
    .where(and(eq(documentsTable.id, params.data.id), eq(documentsTable.sessionId, req.sessionId)))
    .returning();
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
