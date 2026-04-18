import { notFound } from "next/navigation";
import { getSession } from "@/lib/session-store";
import { getSessionFromDb } from "@/lib/db/sessions";
import { ResultsView } from "./results-view";
import type { SessionData } from "@/lib/session-store";

type Props = { params: Promise<{ sessionId: string }> };

export default async function ResultsPage({ params }: Props) {
  const { sessionId } = await params;

  // 1. Try in-memory store first (fast, available right after analysis)
  let data: SessionData | null = getSession(sessionId);

  // 2. Fall back to Supabase if session expired or server restarted
  if (!data) {
    try {
      const row = await getSessionFromDb(sessionId);
      if (row) {
        const stored = row.results as Record<string, unknown>;
        // Reconstruct SessionData from DB row
        data = {
          opportunities: Array.isArray(stored.opportunities) ? stored.opportunities : [],
          skippedEmails: Array.isArray(stored.skippedEmails) ? stored.skippedEmails : [],
          extractedCount: typeof stored.extractedCount === "number" ? stored.extractedCount : row.total_opportunities,
          generatedAt: row.created_at,
          provider: "grok",
          summary: {
            generatedAt:        row.created_at,
            provider:           "grok",
            totalEmails:        0,
            totalOpportunities: row.total_opportunities,
            topScore:           0,
            avgScore:           0,
          },
        } as SessionData;
      }
    } catch {
      // DB unavailable — fall through to notFound
    }
  }

  if (!data) notFound();

  return <ResultsView data={data} sessionId={sessionId} />;
}
