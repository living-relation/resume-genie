/**
 * Resolve upload format from MIME type and/or filename.
 * Windows browsers often send an empty MIME or application/octet-stream.
 * Those fall back to the file extension. A known MIME and a known extension
 * that name different formats is a conflict and is rejected.
 */
const MIME_TO_FORMAT: Record<string, DocumentFormat> = {
  "application/pdf": "pdf",
  "application/x-pdf": "pdf",
  "application/acrobat": "pdf",
  "text/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/vnd.ms-word": "doc",
  "application/x-msword": "doc",
  "text/plain": "txt",
  "text/txt": "txt",
};

/** No format claim. Callers may trust the extension. */
const GENERIC_MIME = new Set(["", "application/octet-stream", "binary/octet-stream"]);

export type DocumentFormat = "pdf" | "docx" | "doc" | "txt";

export type DocumentFormatResult =
  | { format: DocumentFormat; reason?: undefined }
  | { format: null; reason: "unsupported" | "conflict" };

/** Strip parameters and lowercase. `application/pdf; charset=binary` → `application/pdf`. */
export function normalizeMimeType(mimetype: string | undefined): string {
  if (!mimetype) return "";
  return mimetype.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function resolveDocumentFormat(
  mimetype: string | undefined,
  originalname: string | undefined,
): DocumentFormatResult {
  const mime = normalizeMimeType(mimetype);
  const fromExt = extensionFormat(originalname);

  if (!GENERIC_MIME.has(mime)) {
    const fromMime = MIME_TO_FORMAT[mime] ?? null;
    if (!fromMime) return { format: null, reason: "unsupported" };
    if (fromExt && fromExt !== fromMime) return { format: null, reason: "conflict" };
    return { format: fromMime };
  }

  if (fromExt) return { format: fromExt };
  return { format: null, reason: "unsupported" };
}

function extensionFormat(originalname: string | undefined): DocumentFormat | null {
  const name = (originalname ?? "").trim().toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx")) return "docx";
  if (name.endsWith(".doc")) return "doc";
  if (name.endsWith(".txt")) return "txt";
  return null;
}
