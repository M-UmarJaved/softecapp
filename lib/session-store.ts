/**
 * In-memory session store for analysis results.
 * Keyed by sessionId (UUID). Entries expire after 30 minutes.
 * This is sufficient for a hackathon demo — no DB needed for results.
 */
import type { AnalyzeOpportunitiesResponse } from "@/lib/opportunity-inbox/types";

type SessionEntry = {
  data: AnalyzeOpportunitiesResponse;
  expiresAt: number;
};

declare global {
  var __analysisSessionStore: Map<string, SessionEntry> | undefined;
}

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const store: Map<string, SessionEntry> =
  globalThis.__analysisSessionStore ?? new Map();
globalThis.__analysisSessionStore = store;

function purgeExpired() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}

export function saveSession(sessionId: string, data: AnalyzeOpportunitiesResponse): void {
  purgeExpired();
  store.set(sessionId, { data, expiresAt: Date.now() + SESSION_TTL_MS });
}

export function getSession(sessionId: string): AnalyzeOpportunitiesResponse | null {
  purgeExpired();
  return store.get(sessionId)?.data ?? null;
}
