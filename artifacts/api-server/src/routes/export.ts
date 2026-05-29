import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, applicationsTable, jobsTable } from "@workspace/db";
import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, UnderlineType, PageOrientation,
  convertInchesToTwip, TabStopPosition, TabStopType,
  LevelFormat, NumberFormat,
} from "docx";
import { logger } from "../lib/logger";

const router: IRouter = Router();

export type ExportLayout = "classic" | "modern" | "minimal";

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
}

// ─── PLACEHOLDER SUBSTITUTION ────────────────────────────────────────────────

function replacePlaceholders(text: string, profile: ProfileData): string {
  let out = text;

  // Name variants
  if (profile.name) {
    out = out.replace(/\[Your Name\]/gi, profile.name);
    out = out.replace(/\[Full Name\]/gi, profile.name);
    out = out.replace(/\[Name\]/gi, profile.name);
  }

  // Email variants
  if (profile.email) {
    out = out.replace(/\[Your Email(?: Address)?\]/gi, profile.email);
    out = out.replace(/\[Email(?: Address)?\]/gi, profile.email);
    out = out.replace(/\[your\.email@example\.com\]/gi, profile.email);
    out = out.replace(/\[email@example\.com\]/gi, profile.email);
  }

  // Phone variants
  if (profile.phone) {
    out = out.replace(/\[Your Phone(?: Number)?\]/gi, profile.phone);
    out = out.replace(/\[Phone(?: Number)?\]/gi, profile.phone);
    out = out.replace(/\[Telephone\]/gi, profile.phone);
  }

  // Location variants
  if (profile.location) {
    out = out.replace(/\[City,?\s*State(?:\s*ZIP)?\]/gi, profile.location);
    out = out.replace(/\[City,?\s*State\]/gi, profile.location);
    out = out.replace(/\[Location\]/gi, profile.location);
    out = out.replace(/\[Your Location\]/gi, profile.location);
  }

  // LinkedIn variants
  if (profile.linkedin) {
    out = out.replace(/\[LinkedIn(?: Profile)?(?: URL)?\]/gi, profile.linkedin);
    out = out.replace(/\[LinkedIn\]/gi, profile.linkedin);
  } else {
    // If no LinkedIn provided, remove the whole placeholder (including surrounding separators)
    out = out.replace(/\s*[|·•]\s*\[LinkedIn(?: Profile)?(?: URL)?\]/gi, "");
    out = out.replace(/\[LinkedIn(?: Profile)?(?: URL)?\]\s*[|·•]\s*/gi, "");
    out = out.replace(/\[LinkedIn(?: Profile)?(?: URL)?\]/gi, "");
    out = out.replace(/\s*[|·•]\s*\[LinkedIn\]/gi, "");
    out = out.replace(/\[LinkedIn\]\s*[|·•]\s*/gi, "");
    out = out.replace(/\[LinkedIn\]/gi, "");
  }

  return out;
}

// ─── HEADER STRIPPING ────────────────────────────────────────────────────────
// The AI-generated text usually begins with its own name + contact block.
// Since we render our own header from the profile, strip the leading one
// to avoid a duplicate header in the exported document.

function stripGeneratedHeader(text: string, profile: ProfileData): string {
  const lines = text.split("\n");

  const namesToStrip = [profile.name]
    .filter((s): s is string => !!s && !s.startsWith("["))
    .map(s => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim());

  const looksLikeContact = (line: string): boolean => {
    const t = line.trim();
    if (!t) return false;
    if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(t)) return true;        // email
    if (/linkedin\.com/i.test(t)) return true;                  // linkedin
    if (/\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/.test(t)) return true; // phone
    // pipe/middot-separated short line (classic contact line)
    if (/[|·•]/.test(t) && t.length < 140) return true;
    return false;
  };

  const looksLikeName = (line: string): boolean => {
    const norm = line.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    if (!norm) return false;
    return namesToStrip.some(n => n.length > 0 && (norm === n || norm.startsWith(n)));
  };

  // A line that looks like a person's full name even if it doesn't match the
  // profile exactly (e.g. the AI added a middle initial: "Daniel R. Grippin").
  // Only trusted as the very first content line.
  const looksLikeGenericName = (line: string): boolean => {
    const t = line.trim();
    if (!t || t.length > 50 || /\d/.test(t)) return false;
    const words = t.split(/\s+/);
    if (words.length < 2 || words.length > 5) return false;
    return words.every(w => /^[A-Z][a-zA-Z.'’-]*$/.test(w));
  };

  let i = 0;
  let sawContent = false;
  // "trusted" = a contact line or an exact profile-name match. We only strip a
  // generic-name first line when it's backed by a trusted line, so we never eat
  // a real section title that happens to be capitalized words.
  let sawTrusted = false;
  let end = 0;
  while (i < lines.length) {
    const t = (lines[i] ?? "").trim();
    if (!t) { i++; continue; }            // skip blank lines in the header zone
    const isContact = looksLikeContact(t);
    const isProfileName = looksLikeName(t);
    const isGenericName = !sawContent && looksLikeGenericName(t);
    if (isContact || isProfileName || isGenericName) {
      if (isContact || isProfileName) sawTrusted = true;
      sawContent = true;
      i++;
      end = i;
      continue;
    }
    break;                                 // first real content line
  }

  if (end === 0 || !sawTrusted) return text;
  // drop any remaining leading blank lines after the stripped header
  while (end < lines.length && !(lines[end] ?? "").trim()) end++;
  return lines.slice(end).join("\n");
}

// ─── COVER LETTER PREAMBLE STRIPPING ─────────────────────────────────────────
// AI cover letters usually open with a full letterhead: the candidate's name +
// address + contact line (duplicating the header we render), then a date and
// the recipient's mailing address (which repeats the company name). Since we
// render our own header and the letter references the company in its body, we
// drop everything before the salutation ("Dear ...,") for a clean letter.

function stripCoverLetterPreamble(text: string, _profile: ProfileData): string {
  const lines = text.split("\n");

  // Case 1: there's a salutation — keep it and drop everything above it
  // (sender letterhead, date, recipient address block, "To:"/"Re:" lines).
  const salutationIdx = lines.findIndex((l) =>
    /^\s*(dear\b|to whom it may concern|hello\b|hi\b|greetings\b)/i.test(l.trim())
  );
  if (salutationIdx >= 0) {
    return lines.slice(salutationIdx).join("\n").replace(/^\n+/, "");
  }

  // Case 2: no salutation. The letter may still open with a recipient block
  // (e.g. "Hiring Team" / company / city). Drop leading blank + short
  // non-prose lines until the first real body sentence.
  const wordCount = (t: string) => t.split(/\s+/).filter(Boolean).length;
  let i = 0;
  let stripped = false;
  let foundBody = false;
  while (i < lines.length) {
    const t = (lines[i] ?? "").trim();
    if (!t) {
      i++;
      continue;
    }
    if (wordCount(t) >= 8) {
      foundBody = true;
      break; // reached the letter body
    }
    i++;
    stripped = true;
  }

  if (!stripped || !foundBody) return text;
  while (i < lines.length && !(lines[i] ?? "").trim()) i++;
  return lines.slice(i).join("\n");
}

// ─── TEXT PARSER ─────────────────────────────────────────────────────────────

interface ParsedSection {
  heading: string | null;
  lines: string[];
}

function parseResumeText(text: string): ParsedSection[] {
  const rawLines = text.split("\n");
  const sections: ParsedSection[] = [];
  let current: ParsedSection = { heading: null, lines: [] };

  const isHeading = (line: string) => {
    const t = line.trim();
    if (!t || t.length > 80) return false;
    // All caps line (section header)
    if (/^[A-Z][A-Z\s&\/\-]+$/.test(t) && t.length > 2) return true;
    // Title case with no trailing punctuation except colon
    if (/^[A-Z][a-zA-Z\s&\/\-]+(:|)$/.test(t) && t.split(" ").length <= 5 && t === t.replace(/[^A-Za-z\s&\/\-:]/g, "")) return true;
    return false;
  };

  for (const raw of rawLines) {
    const line = raw.trimEnd();
    if (isHeading(line)) {
      if (current.heading !== null || current.lines.some(l => l.trim())) {
        sections.push(current);
      }
      current = { heading: line.trim().replace(/:$/, ""), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.heading !== null || current.lines.some(l => l.trim())) {
    sections.push(current);
  }
  return sections;
}

function isBullet(line: string) {
  return /^\s*[•\-\*·–]\s+/.test(line);
}

function cleanBullet(line: string) {
  return line.replace(/^\s*[•\-\*·–]\s+/, "").trim();
}

// ─── DOCX BUILDERS ───────────────────────────────────────────────────────────

// Shared helper: contact info line
function contactLine(profile: ProfileData, layout: ExportLayout): Paragraph | null {
  const parts: string[] = [];
  if (profile.email) parts.push(profile.email);
  if (profile.phone) parts.push(profile.phone);
  if (profile.location) parts.push(profile.location);
  if (profile.linkedin) parts.push(profile.linkedin);
  if (parts.length === 0) return null;

  const sep = layout === "modern" ? "  |  " : "  ·  ";
  const fontSize = layout === "minimal" ? 18 : layout === "modern" ? 19 : 18;

  return new Paragraph({
    alignment: layout === "classic" ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text: parts.join(sep),
        size: fontSize,
        color: layout === "modern" ? "374151" : "555555",
        font: layout === "modern" ? "Calibri" : layout === "minimal" ? "Georgia" : "Times New Roman",
      }),
    ],
  });
}

// ─── CLASSIC LAYOUT ──────────────────────────────────────────────────────────
// Centered name, horizontal rule, Times New Roman body

function buildClassic(name: string, profile: ProfileData, sections: ParsedSection[]): Paragraph[] {
  const paras: Paragraph[] = [];

  // Name
  paras.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [new TextRun({
      text: name,
      bold: true,
      size: 36,
      font: "Times New Roman",
      color: "000000",
    })],
  }));

  // Contact info
  const contact = contactLine(profile, "classic");
  if (contact) paras.push(contact);

  // Divider
  paras.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
    spacing: { before: 80, after: 160 },
    children: [],
  }));

  // Sections
  for (const section of sections) {
    if (section.heading) {
      paras.push(new Paragraph({
        spacing: { before: 160, after: 60 },
        children: [new TextRun({
          text: section.heading.toUpperCase(),
          bold: true,
          size: 22,
          font: "Times New Roman",
          allCaps: true,
          color: "000000",
        })],
      }));
      paras.push(new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" } },
        spacing: { before: 0, after: 120 },
        children: [],
      }));
    }

    for (const line of section.lines) {
      const t = line.trim();
      if (!t) {
        paras.push(new Paragraph({ spacing: { before: 0, after: 40 }, children: [] }));
        continue;
      }
      if (isBullet(line)) {
        paras.push(new Paragraph({
          indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.15) },
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: "• ", size: 20, font: "Times New Roman" }),
            new TextRun({ text: cleanBullet(line), size: 20, font: "Times New Roman" }),
          ],
        }));
      } else {
        paras.push(new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [new TextRun({ text: t, size: 20, font: "Times New Roman" })],
        }));
      }
    }
  }

  return paras;
}

// ─── MODERN LAYOUT ────────────────────────────────────────────────────────────
// Left-aligned name in a dark header block, Calibri, colored section bars

function buildModern(name: string, profile: ProfileData, sections: ParsedSection[]): Paragraph[] {
  const paras: Paragraph[] = [];
  const accentColor = "1D4ED8"; // Tailwind blue-700

  // Name (large, bold, accent color)
  paras.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 40 },
    children: [new TextRun({
      text: name,
      bold: true,
      size: 48,
      font: "Calibri",
      color: accentColor,
    })],
  }));

  // Contact info
  const contact = contactLine(profile, "modern");
  if (contact) paras.push(contact);

  // Thick accent rule
  paras.push(new Paragraph({
    border: { bottom: { style: BorderStyle.THICK, size: 16, color: accentColor } },
    spacing: { before: 80, after: 200 },
    children: [],
  }));

  // Sections
  for (const section of sections) {
    if (section.heading) {
      // Section heading with left accent bar feel via bold + color
      paras.push(new Paragraph({
        spacing: { before: 200, after: 80 },
        border: { left: { style: BorderStyle.THICK, size: 16, color: accentColor } },
        indent: { left: convertInchesToTwip(0.15) },
        children: [new TextRun({
          text: section.heading.toUpperCase(),
          bold: true,
          size: 24,
          font: "Calibri",
          color: accentColor,
        })],
      }));
    }

    for (const line of section.lines) {
      const t = line.trim();
      if (!t) {
        paras.push(new Paragraph({ spacing: { before: 0, after: 30 }, children: [] }));
        continue;
      }
      if (isBullet(line)) {
        paras.push(new Paragraph({
          indent: { left: convertInchesToTwip(0.2), hanging: convertInchesToTwip(0.15) },
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: "▸ ", size: 20, color: accentColor, font: "Calibri" }),
            new TextRun({ text: cleanBullet(line), size: 20, font: "Calibri", color: "111827" }),
          ],
        }));
      } else {
        paras.push(new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [new TextRun({ text: t, size: 20, font: "Calibri", color: "111827" })],
        }));
      }
    }
  }

  return paras;
}

// ─── MINIMAL LAYOUT ───────────────────────────────────────────────────────────
// Georgia serif, lots of whitespace, small-caps headings, no lines

function buildMinimal(name: string, profile: ProfileData, sections: ParsedSection[]): Paragraph[] {
  const paras: Paragraph[] = [];

  // Name
  paras.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 60 },
    children: [new TextRun({
      text: name,
      bold: true,
      size: 44,
      font: "Georgia",
      color: "111111",
    })],
  }));

  // Contact info
  const contact = contactLine(profile, "minimal");
  if (contact) paras.push(contact);

  // Spacer
  paras.push(new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }));

  // Sections
  for (const section of sections) {
    if (section.heading) {
      paras.push(new Paragraph({
        spacing: { before: 240, after: 80 },
        children: [new TextRun({
          text: section.heading.toUpperCase(),
          size: 18,
          font: "Georgia",
          color: "888888",
          allCaps: true,
          characterSpacing: 80,
        })],
      }));
    }

    for (const line of section.lines) {
      const t = line.trim();
      if (!t) {
        paras.push(new Paragraph({ spacing: { before: 0, after: 60 }, children: [] }));
        continue;
      }
      if (isBullet(line)) {
        paras.push(new Paragraph({
          indent: { left: convertInchesToTwip(0.2) },
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({ text: "— ", size: 20, font: "Georgia", color: "aaaaaa" }),
            new TextRun({ text: cleanBullet(line), size: 20, font: "Georgia", color: "222222" }),
          ],
        }));
      } else {
        paras.push(new Paragraph({
          spacing: { before: 30, after: 30 },
          children: [new TextRun({ text: t, size: 20, font: "Georgia", color: "222222" })],
        }));
      }
    }
  }

  return paras;
}

// ─── COVER LETTER BUILDER ────────────────────────────────────────────────────

function buildCoverLetter(
  text: string,
  name: string,
  profile: ProfileData,
  layout: ExportLayout,
): Paragraph[] {
  const paras: Paragraph[] = [];
  const font = layout === "modern" ? "Calibri" : layout === "minimal" ? "Georgia" : "Times New Roman";
  const accentColor = layout === "modern" ? "1D4ED8" : "000000";
  const bodyColor = layout === "minimal" ? "222222" : "000000";

  // Name header
  paras.push(new Paragraph({
    alignment: layout === "classic" ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: name, bold: true, size: layout === "modern" ? 40 : 36, font, color: accentColor })],
  }));

  const contact = contactLine(profile, layout);
  if (contact) paras.push(contact);

  if (layout === "classic") {
    paras.push(new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
      spacing: { before: 80, after: 200 },
      children: [],
    }));
  } else if (layout === "modern") {
    paras.push(new Paragraph({
      border: { bottom: { style: BorderStyle.THICK, size: 16, color: accentColor } },
      spacing: { before: 80, after: 200 },
      children: [],
    }));
  } else {
    paras.push(new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }));
  }

  // Body paragraphs
  const lines = text.split("\n");
  for (const line of lines) {
    const t = line.trim();
    paras.push(new Paragraph({
      spacing: { before: t ? 40 : 20, after: t ? 40 : 20 },
      children: t
        ? [new TextRun({ text: t, size: 22, font, color: bodyColor })]
        : [],
    }));
  }

  return paras;
}

// ─── MAIN ROUTE ──────────────────────────────────────────────────────────────

router.post("/applications/:id/export", async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid application id" });
    return;
  }

  const layout: ExportLayout = (req.body?.layout as ExportLayout) ?? "classic";
  if (!["classic", "modern", "minimal"].includes(layout)) {
    res.status(400).json({ error: "Invalid layout. Choose classic, modern, or minimal." });
    return;
  }

  const profileRaw: ProfileData = req.body?.profile ?? {};
  const docType: "resume" | "cover_letter" = req.body?.docType === "cover_letter" ? "cover_letter" : "resume";

  try {
    const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (app.status !== "done") {
      res.status(400).json({ error: "Application is not ready yet" });
      return;
    }

    // Resolve profile name: use provided, fall back to job title placeholder
    const resolvedName = profileRaw.name?.trim() || "[Your Name]";
    const profile: ProfileData = {
      name: resolvedName,
      email: profileRaw.email?.trim() || "[your.email@example.com]",
      phone: profileRaw.phone?.trim() || "[Phone Number]",
      location: profileRaw.location?.trim() || "[City, State]",
      // LinkedIn: only include if actually provided
      linkedin: profileRaw.linkedin?.trim() || undefined,
    };

    // Get job title for filename
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
    const jobTitle = job?.title ?? "application";
    const safeTitle = jobTitle.replace(/[^a-zA-Z0-9\s\-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);

    let paragraphs: Paragraph[];
    let filename: string;

    if (docType === "cover_letter") {
      const text = stripCoverLetterPreamble(replacePlaceholders(app.coverLetter ?? "", profile), profile);
      paragraphs = buildCoverLetter(text, resolvedName, profile, layout);
      filename = `cover-letter-${safeTitle}-${layout}.docx`;
    } else {
      const text = stripGeneratedHeader(replacePlaceholders(app.resume ?? "", profile), profile);
      const sections = parseResumeText(text);
      paragraphs =
        layout === "classic" ? buildClassic(resolvedName, profile, sections) :
        layout === "modern"  ? buildModern(resolvedName, profile, sections) :
                               buildMinimal(resolvedName, profile, sections);
      filename = `resume-${safeTitle}-${layout}.docx`;
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: paragraphs,
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (err) {
    logger.error({ err, id }, "Failed to export application as DOCX");
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
