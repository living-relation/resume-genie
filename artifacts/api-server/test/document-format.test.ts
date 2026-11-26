import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeMimeType, resolveDocumentFormat } from "../src/lib/document-format";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("normalizeMimeType", () => {
  it("strips parameters and case", () => {
    assert.equal(normalizeMimeType(" Application/PDF ; charset=binary "), "application/pdf");
    assert.equal(normalizeMimeType(undefined), "");
    assert.equal(normalizeMimeType(""), "");
  });
});

describe("resolveDocumentFormat", () => {
  it("accepts PDF, DOCX, DOC, and TXT by MIME", () => {
    assert.deepEqual(resolveDocumentFormat("application/pdf", "resume.pdf"), { format: "pdf" });
    assert.deepEqual(resolveDocumentFormat(DOCX, "resume.docx"), { format: "docx" });
    assert.deepEqual(resolveDocumentFormat("application/msword", "resume.doc"), { format: "doc" });
    assert.deepEqual(resolveDocumentFormat("text/plain", "resume.txt"), { format: "txt" });
  });

  it("accepts empty MIME and application/octet-stream by extension", () => {
    assert.deepEqual(resolveDocumentFormat("", "resume.pdf"), { format: "pdf" });
    assert.deepEqual(resolveDocumentFormat(undefined, "Resume.DOCX"), { format: "docx" });
    assert.deepEqual(resolveDocumentFormat("application/octet-stream", "notes.txt"), { format: "txt" });
    assert.deepEqual(resolveDocumentFormat("application/octet-stream", "old.DOC"), { format: "doc" });
  });

  it("accepts MIME aliases and a missing extension when the MIME is known", () => {
    assert.deepEqual(resolveDocumentFormat("application/x-pdf", "upload"), { format: "pdf" });
    assert.deepEqual(resolveDocumentFormat("text/pdf", "upload.bin"), { format: "pdf" });
    assert.deepEqual(resolveDocumentFormat("application/vnd.ms-word", "letter.doc"), { format: "doc" });
    assert.deepEqual(resolveDocumentFormat("text/plain; charset=utf-8", "plain.txt"), { format: "txt" });
  });

  it("rejects an extension that disagrees with the MIME", () => {
    assert.deepEqual(resolveDocumentFormat("application/pdf", "notes.txt"), {
      format: null,
      reason: "conflict",
    });
    assert.deepEqual(resolveDocumentFormat("text/plain", "resume.pdf"), {
      format: null,
      reason: "conflict",
    });
    assert.deepEqual(resolveDocumentFormat(DOCX, "resume.doc"), {
      format: null,
      reason: "conflict",
    });
  });

  it("rejects types we do not extract", () => {
    assert.deepEqual(resolveDocumentFormat("image/png", "pic.png"), {
      format: null,
      reason: "unsupported",
    });
    assert.deepEqual(resolveDocumentFormat("", "archive.zip"), {
      format: null,
      reason: "unsupported",
    });
  });
});
