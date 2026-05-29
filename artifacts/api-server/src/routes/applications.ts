import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, applicationsTable, jobsTable, documentsTable } from "@workspace/db";
import {
  CreateApplicationBody,
  GetApplicationParams,
  DeleteApplicationParams,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function toneInstruction(tone: string | undefined): string {
  switch (tone) {
    case "casual":    return "Write in a warm, conversational, approachable tone — still professional but personable and relatable.";
    case "executive": return "Write in a high-level strategic tone that emphasizes leadership, business impact, and executive presence. Speak from a position of authority.";
    case "creative":  return "Write in a bold, distinctive voice that shows personality, creative confidence, and originality. Stand out.";
    case "technical": return "Write in a precise, detail-rich technical tone that demonstrates deep domain expertise and specificity. Impress technical reviewers.";
    default:          return "Write in a formal, polished, corporate professional tone.";
  }
}

function styleInstruction(style: string | undefined): string {
  switch (style) {
    case "concise":      return "Be extremely concise. Use tight, punchy bullet points. Target a one-page resume. No fluff.";
    case "detailed":     return "Be thorough and detailed. Elaborate on accomplishments, context, responsibilities, and impact. Length is fine.";
    case "storytelling": return "Use narrative language that tells a compelling career story. Connect experiences meaningfully and show a journey.";
    default:             return "Use a balanced, well-rounded format with comprehensive sections. Standard length.";
  }
}

function truthfulnessInstruction(level: number | undefined): string {
  switch (level) {
    case 0: return "Present the candidate conservatively and modestly. Avoid any self-promotion. Let the raw facts speak for themselves quietly.";
    case 2: return "Polish achievements with strong action verbs. Where numbers aren't explicitly stated, estimate conservatively upward. Present everything in the most favorable honest light possible.";
    case 3: return "Significantly amplify achievements. Add impressive but plausible metrics where missing (e.g. 'reduced load time by 40%', 'managed team of 8'). Describe scope and impact at the maximum credible level. Every bullet should punch hard.";
    case 4: return "Make this candidate look absolutely perfect for this role. You may invent believable, impressive metrics, project outcomes, team sizes, and impact statements that are consistent with their background. Fabricate plausible quantified results that sound authentic and would impress any hiring manager. CRITICAL CONSTRAINT: Never fabricate specific degrees, certifications, professional licenses, or named credentials — only things that cannot easily be verified in a background check.";
    default: return "Present the candidate's experience accurately and honestly, exactly as documented in their materials. No embellishment, no understatement.";
  }
}

async function generateApplicationContent(
  applicationId: number,
  job: { title: string | null; company: string | null; location: string | null; description: string | null; url: string },
  documents: Array<{ name: string; type: string; content: string }>,
  tone: string | undefined,
  style: string | undefined,
  truthfulness: number | undefined
): Promise<void> {
  try {
    const docsContext = documents
      .map((d) => `--- ${d.name} (${d.type}) ---\n${d.content}`)
      .join("\n\n");

    const jobContext = [
      job.title ? `Job Title: ${job.title}` : "",
      job.company ? `Company: ${job.company}` : "",
      job.location ? `Location: ${job.location}` : "",
      `URL: ${job.url}`,
      job.description ? `\nJob Description:\n${job.description.slice(0, 6000)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `You are an expert career coach and professional resume writer.
Your task is to create a perfectly tailored resume and cover letter for a specific job application.

TONE: ${toneInstruction(tone)}
STYLE: ${styleInstruction(style)}
TRUTHFULNESS: ${truthfulnessInstruction(truthfulness)}

Use the candidate's uploaded documents as the source of truth for their background, skills, and experience.
Tailor everything specifically to the job listing.
Format the resume in clean plain text with clear sections. Do not use JSON or markdown code blocks.
Match keywords from the job description wherever possible.`;

    const userPrompt = `Here are the candidate's documents:\n\n${docsContext}\n\n---\n\nHere is the job listing:\n\n${jobContext}\n\n---\n\nPlease generate:

1. A tailored RESUME. Do NOT include a name or contact-information header at the top — no name line, no email, phone, LinkedIn, or mailing address. That header is rendered separately. Start the resume DIRECTLY with the SUMMARY section, followed by SKILLS, EXPERIENCE, and EDUCATION. Tailor bullet points to match job requirements.

2. A tailored COVER LETTER addressed to the hiring team at ${job.company || "the company"}, no longer than 4 paragraphs. Reference specific aspects of the job. Show genuine enthusiasm and connect the candidate's background to the role.
   - Start the cover letter DIRECTLY with the salutation (e.g. "Dear Hiring Team,"). Do NOT include a letterhead, the candidate's name or contact details, a date, or the recipient's mailing address at the top — those are added separately. Do not repeat the company name in an address block; it's fine to mention it naturally within the letter body.
   - End with a sign-off (e.g. "Sincerely,") followed by the candidate's name only.

Format your response EXACTLY like this:
===RESUME===
[resume content here]
===COVER LETTER===
[cover letter content here]`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    const resumeMatch = content.match(/===RESUME===\s*([\s\S]*?)(?:===COVER LETTER===|$)/);
    const coverLetterMatch = content.match(/===COVER LETTER===\s*([\s\S]*?)$/);
    const resume = resumeMatch ? resumeMatch[1].trim() : content;
    const coverLetter = coverLetterMatch ? coverLetterMatch[1].trim() : "";

    await db
      .update(applicationsTable)
      .set({ resume, coverLetter, status: "done" })
      .where(eq(applicationsTable.id, applicationId));
  } catch (err) {
    logger.error({ err, applicationId }, "Failed to generate application content");
    await db
      .update(applicationsTable)
      .set({ status: "failed" })
      .where(eq(applicationsTable.id, applicationId))
      .catch(() => {});
  }
}

router.get("/applications", async (req, res): Promise<void> => {
  const apps = await db.select().from(applicationsTable).orderBy(applicationsTable.createdAt);
  res.json(apps);
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { jobId, tone, style, truthfulness } = parsed.data;

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) {
    res.status(400).json({ error: "Job not found" });
    return;
  }

  const documents = await db.select().from(documentsTable).orderBy(documentsTable.createdAt);
  if (documents.length === 0) {
    res.status(400).json({ error: "Please upload at least one document before generating an application" });
    return;
  }

  const [application] = await db
    .insert(applicationsTable)
    .values({ jobId, jobTitle: job.title, jobCompany: job.company, status: "generating" })
    .returning();

  res.status(201).json(application);

  generateApplicationContent(application.id, job, documents, tone, style, truthfulness).catch((err) => {
    logger.error({ err, applicationId: application.id }, "Unhandled error in generation");
  });
});

router.get("/applications/:id", async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, params.data.id));
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.json(app);
});

router.delete("/applications/:id", async (req, res): Promise<void> => {
  const params = DeleteApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [app] = await db.delete(applicationsTable).where(eq(applicationsTable.id, params.data.id)).returning();
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
