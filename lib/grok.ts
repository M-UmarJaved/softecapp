import OpenAI from "openai";

export const GROK_BASE_URL = process.env.GROK_BASE_URL ?? "https://api.groq.com/openai/v1";

// Email extraction — accurate 70b model
export const GROK_EXTRACTION_MODEL = process.env.GROK_MODEL ?? "llama-3.3-70b-versatile";
// Chat — fast 8b model for instant responses (<500ms to first token)
export const GROK_FAST_MODEL = process.env.GROK_CHAT_MODEL ?? "llama-3.1-8b-instant";

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
