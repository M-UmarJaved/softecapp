import type { AnalyzeOpportunitiesResponse } from "@/lib/opportunity-inbox/types";

export type SessionData = AnalyzeOpportunitiesResponse & {
  skippedEmails?: Array<{ id: string; subject: string; reason: string; confidence: number }>;
};

type SessionEntry = {
  data: SessionData;
  expiresAt: number;
};

declare global {
  var __analysisSessionStore: Map<string, SessionEntry> | undefined;
}

const SESSION_TTL_MS = 30 * 60 * 1000;

const store: Map<string, SessionEntry> =
  globalThis.__analysisSessionStore ?? new Map();
globalThis.__analysisSessionStore = store;

function purgeExpired() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}

export function saveSession(sessionId: string, data: SessionData): void {
  purgeExpired();
  store.set(sessionId, { data, expiresAt: Date.now() + SESSION_TTL_MS });
}

export function getSession(sessionId: string): SessionData | null {
  purgeExpired();
  return store.get(sessionId)?.data ?? null;
}
