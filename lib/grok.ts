import OpenAI from "openai";

export const GROK_BASE_URL = process.env.GROK_BASE_URL ?? "https://api.x.ai/v1";

// grok-3 → high-quality extraction (main pipeline)
// grok-3-mini → fast classification calls
export const GROK_EXTRACTION_MODEL = process.env.GROK_MODEL ?? "grok-3";
export const GROK_FAST_MODEL = "grok-3-mini";

let _client: OpenAI | null = null;

export function getGrokClient(): OpenAI {
  // Re-create if env changed (safe for serverless — module is re-imported per cold start)
  if (_client) return _client;

  const apiKey =
    process.env.GROK_API_KEY ??
    process.env.XAI_API_KEY ??
    process.env.OPENAI_API_KEY ??
    "";

  if (!apiKey) {
    throw new Error("No Grok API key found. Set GROK_API_KEY in .env.local.");
  }

  _client = new OpenAI({ apiKey, baseURL: GROK_BASE_URL });
  return _client;
}

export function hasGrokKey(): boolean {
  return Boolean(
    process.env.GROK_API_KEY ??
    process.env.XAI_API_KEY ??
    process.env.OPENAI_API_KEY,
  );
}
