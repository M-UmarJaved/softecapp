"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3Icon,
  HomeIcon,
  InboxIcon,
  MessageSquareIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  UsersIcon,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Overview",      href: "/dashboard",              icon: HomeIcon },
  { label: "Analyze",       href: "/analyze",                icon: InboxIcon },
  { label: "AI Coach",      href: "/dashboard/chat",         icon: MessageSquareIcon },
  { label: "Insights",      href: "/dashboard/analytics",    icon: BarChart3Icon },
  { label: "Waitlist",      href: "/dashboard/waitlist",     icon: UsersIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname.startsWith(href);
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border/70 bg-card/70 backdrop-blur-lg transition-all duration-300",
        collapsed ? "w-20" : "w-64 max-md:w-20",
      )}
    >
      <div className="flex h-16 items-center border-b border-border/70 px-3">
        <div
          className={cn(
            "flex min-w-0 items-center gap-2",
            collapsed ? "justify-center" : "flex-1",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BarChart3Icon className="size-4" />
          </span>

          <div className={cn("min-w-0", collapsed ? "hidden" : "block")}>
            <p className="truncate font-heading text-sm text-foreground">Opportunity Inbox</p>
            <p className="truncate text-xs text-muted-foreground">Copilot</p>
          </div>
        </div>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => setCollapsed((current) => !current)}
          className="ml-1 shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpenIcon className="size-4" />
          ) : (
            <PanelLeftCloseIcon className="size-4" />
          )}
        </Button>
      </div>

      <nav className="space-y-1 p-2">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: active ? "secondary" : "ghost", size: "sm" }),
                "h-10 w-full",
                collapsed
                  ? "justify-center px-0"
                  : "justify-start px-3 max-md:justify-center max-md:px-0",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span
                className={cn(
                  "truncate",
                  collapsed ? "sr-only" : "max-md:sr-only",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}