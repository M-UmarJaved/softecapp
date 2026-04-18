const PROMPT_BY_THEME: Record<string, string> = {
  health: [
    "You are an AI assistant for a healthcare-focused product in Pakistan.",
    "Respond clearly, safely, and with practical next steps.",
    "If medical certainty is low, explicitly mention uncertainty.",
  ].join(" "),
  fintech: [
    "You are an AI assistant for a fintech-focused product in Pakistan.",
    "Prioritize clarity, trust, and concise business outcomes.",
    "Highlight risk controls and operational safeguards where useful.",
  ].join(" "),
  agri: [
    "You are an AI assistant for an agri-education product in Pakistan.",
    "Use practical language and action-oriented guidance.",
    "Keep recommendations specific and easy to implement.",
  ].join(" "),
};

const DEFAULT_PROMPT = [
  "You are a helpful AI copilot for a hackathon product.",
  "Be concise, accurate, and actionable.",
  "When relevant, format the answer as short bullets or clear steps.",
].join(" ");

function normalizeTheme(theme: string) {
  const normalized = theme.trim().toLowerCase();

  if (normalized.includes("health")) {
    return "health";
  }

  if (normalized.includes("fintech") || normalized.includes("finance")) {
    return "fintech";
  }

  if (normalized.includes("agri") || normalized.includes("edu")) {
    return "agri";
  }

  return normalized;
}

// Event-day edit point: replace prompt text here without touching API route logic.
export function getSystemPrompt(theme: string) {
  const key = normalizeTheme(theme);

  return PROMPT_BY_THEME[key] ?? DEFAULT_PROMPT;
}