import OpenAI from "openai";

/**
 * OpenAI-compatible client. Defaults to Google Gemini's free OpenAI-compat
 * endpoint so the app can run at $0. Override OPENAI_BASE_URL / OPENAI_API_KEY
 * (or the legacy AI_INTEGRATIONS_* names) for Groq or other providers.
 *
 * Gemini:  https://generativelanguage.googleapis.com/v1beta/openai/
 * Groq:    https://api.groq.com/openai/v1
 */
function resolveApiKey(): string {
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY must be set (free key from https://aistudio.google.com).",
    );
  }
  return apiKey;
}

function resolveBaseURL(): string {
  return (
    process.env.OPENAI_BASE_URL ||
    process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta/openai/"
  );
}

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: resolveApiKey(),
      baseURL: resolveBaseURL(),
    });
  }
  return _openai;
}

/** Lazy proxy so dotenv can load before the first AI call. */
export const openai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    const client = getOpenAI();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/** Chat model id. Default is Gemini Flash on the free tier. */
export function getAiModel(): string {
  return process.env.AI_MODEL || "gemini-3.6-flash";
}

/** @deprecated Prefer getAiModel() so env is read at call time. */
export const AI_MODEL = "gemini-3.6-flash";
