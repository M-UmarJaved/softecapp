const BASE_DEMO_RESPONSES = [
  "Thanks for your question. Demo mode is active, so this response is generated from local fallback data and still demonstrates your product flow reliably.",
  "Your AI shell is ready for event day. Keep this infrastructure and only swap your domain prompt and request schema for the final demo narrative.",
  "This fallback is intentional for pitch resilience. Even without internet, judges can see interaction quality, response structure, and business relevance.",
];

const THEME_HINTS: Record<string, string> = {
  health:
    "Healthcare mode: emphasize safe guidance, triage support, and clear uncertainty boundaries.",
  fintech:
    "Fintech mode: emphasize trust, compliance-minded summaries, and practical decision support.",
  agri:
    "Agri-Edu mode: emphasize farmer-friendly clarity, localized language cues, and action-first guidance.",
};

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

  return "default";
}

export function pickDemoFallbackResponse(userPrompt: string, theme: string) {
  const normalizedTheme = normalizeTheme(theme);
  const base =
    BASE_DEMO_RESPONSES[Math.floor(Math.random() * BASE_DEMO_RESPONSES.length)] ??
    BASE_DEMO_RESPONSES[0]!;
  const hint = THEME_HINTS[normalizedTheme] ??
    "General mode: provide concise, practical, and demo-friendly responses.";

  return [
    base,
    hint,
    "",
    `Prompt received: \"${userPrompt || "(empty prompt)"}\"`,
  ].join("\n");
}