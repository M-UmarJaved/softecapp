import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { getSession } from "@/lib/session-store";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ sessionId: string }>;
};

export default async function ResultsPage({ params }: Props) {
  const { sessionId } = await params;
  const data = getSession(sessionId);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/opportunities"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
        >
          <ArrowLeftIcon className="size-4" />
          New Analysis
        </Link>
        <p className="text-sm text-muted-foreground">
          Session <span className="font-mono text-xs">{sessionId.slice(0, 8)}…</span>
          {" · "}Results expire in 30 minutes
        </p>
      </div>

      <ResultsDashboard data={data} />
    </div>
  );
}
