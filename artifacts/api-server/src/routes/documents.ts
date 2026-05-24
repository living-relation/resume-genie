import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import multer from "multer";
import pdfParse from "pdf-parse";
import {
  CreateDocumentBody,
  GetDocumentParams,
  DeleteDocumentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/documents", async (req, res): Promise<void> => {
  const docs = await db.select().from(documentsTable).orderBy(documentsTable.createdAt);
  res.json(docs);
});

router.post("/documents", async (req, res): Promise<void> => {
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [doc] = await db.insert(documentsTable).values(parsed.data).returning();
  res.status(201).json(doc);
});

router.post("/documents/extract-pdf", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  if (req.file.mimetype !== "application/pdf") {
    res.status(400).json({ error: "File must be a PDF" });
    return;
  }

  try {
    const result = await pdfParse(req.file.buffer);
    const text = result.text.trim();
    if (!text) {
      res.status(400).json({ error: "Could not extract text from PDF — try copying and pasting instead" });
      return;
    }

    const basename = req.file.originalname.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
    const suggestedName = basename || "LinkedIn Profile";

    res.json({ text, suggestedName });
  } catch {
    res.status(400).json({ error: "Failed to parse PDF — the file may be scanned or password-protected" });
  }
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  const params = GetDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, params.data.id));
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.json(doc);
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [doc] = await db.delete(documentsTable).where(eq(documentsTable.id, params.data.id)).returning();
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
