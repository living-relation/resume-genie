/**
 * Resolve upload format from MIME type and/or filename.
 * Windows browsers often send an empty MIME or application/octet-stream.
 */
const MIME_TO_FORMAT: Record<string, DocumentFormat> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "text/plain": "txt",
};

export type DocumentFormat = "pdf" | "docx" | "doc" | "txt";

export function resolveDocumentFormat(
  mimetype: string | undefined,
  originalname: string | undefined,
): DocumentFormat | null {
  const mime = (mimetype ?? "").trim().toLowerCase();
  if (mime && MIME_TO_FORMAT[mime]) {
    return MIME_TO_FORMAT[mime];
  }

  const name = (originalname ?? "").trim().toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx")) return "docx";
  if (name.endsWith(".doc")) return "doc";
  if (name.endsWith(".txt")) return "txt";
  return null;
}
