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

async function generateApplicationContent(
  applicationId: number,
  job: { title: string | null; company: string | null; location: string | null; description: string | null; url: string },
  documents: Array<{ name: string; type: string; content: string }>
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
Use the candidate's uploaded documents as the source of truth for their skills, experience, and background.
Tailor the content specifically to the job listing provided.
Format the resume in clean plain text with clear sections. Do not use JSON or markdown code blocks.
Be specific, quantify achievements where possible, and match keywords from the job description.`;

    const userPrompt = `Here are the candidate's documents:\n\n${docsContext}\n\n---\n\nHere is the job listing:\n\n${jobContext}\n\n---\n\nPlease generate:

1. A tailored RESUME that highlights the most relevant experience and skills for this specific role. Format it as a clean, ATS-friendly plain text resume with sections: Contact Info (use placeholder [Name], [Email], [Phone], [LinkedIn] if not found), Summary, Skills, Experience, Education. Tailor bullet points to match the job requirements.

2. A tailored COVER LETTER addressed to the hiring team at ${job.company || "the company"}, no longer than 4 paragraphs. Reference specific aspects of the job and company. Show genuine enthusiasm and connect the candidate's background to the role.

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
      .set({
        resume,
        coverLetter,
        status: "done",
      })
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

  const { jobId } = parsed.data;

  // Check job exists
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) {
    res.status(400).json({ error: "Job not found" });
    return;
  }

  // Get all user documents
  const documents = await db.select().from(documentsTable).orderBy(documentsTable.createdAt);
  if (documents.length === 0) {
    res.status(400).json({ error: "Please upload at least one document before generating an application" });
    return;
  }

  // Create application record
  const [application] = await db
    .insert(applicationsTable)
    .values({
      jobId,
      jobTitle: job.title,
      jobCompany: job.company,
      status: "generating",
    })
    .returning();

  res.status(201).json(application);

  // Generate content asynchronously
  generateApplicationContent(application.id, job, documents).catch((err) => {
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
