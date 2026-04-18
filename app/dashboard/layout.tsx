import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";

function isAuthBypassed() {
  return (
    process.env.BYPASS_AUTH === "true" ||
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
  );
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  if (isAuthBypassed()) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen">
          <DashboardSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader
              title="Opportunity Inbox Copilot"
              subtitle="Guest mode active: deterministic ranking and extraction demo"
              email="guest@demo.local"
              name="Guest User"
              showUserNav={false}
            />

            <main className="flex-1 bg-muted/30 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            title="Opportunity Inbox Copilot"
            subtitle="Parse emails, rank opportunities, and act before deadlines"
            email={user.email ?? ""}
            name={displayName}
            avatarUrl={avatarUrl}
          />

          <main className="flex-1 bg-muted/30 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}