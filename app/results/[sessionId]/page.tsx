import { notFound } from "next/navigation";
import { getSession } from "@/lib/session-store";
import { ResultsView } from "./results-view";

type Props = { params: Promise<{ sessionId: string }> };

export default async function ResultsPage({ params }: Props) {
  const { sessionId } = await params;
  const data = getSession(sessionId);
  if (!data) notFound();
  return <ResultsView data={data} sessionId={sessionId} />;
}
