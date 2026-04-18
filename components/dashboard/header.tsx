import { UserNav } from "@/components/auth/user-nav";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  showUserNav?: boolean;
};

export function DashboardHeader({
  title,
  subtitle,
  email,
  name,
  avatarUrl,
  showUserNav = true,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate font-heading text-lg text-foreground sm:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>

        {showUserNav ? (
          <UserNav email={email} name={name} avatarUrl={avatarUrl} />
        ) : (
          <span className="rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-xs text-secondary-foreground">
            Guest Mode
          </span>
        )}
      </div>
    </header>
  );
}