"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserIcon, LogOutIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

type UserNavProps = {
  email: string;
  name?: string;
  avatarUrl?: string;
};

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  if (!source) return "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
}

export function UserNav({ email, name = "User", avatarUrl }: UserNavProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = getInitials(name, email);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign out.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <DropdownMenu>
        {/* Trigger — DropdownMenuTrigger already renders a <button>, no extra wrapper */}
        <DropdownMenuTrigger
          aria-label="Open user menu"
          className="flex size-9 items-center justify-center rounded-full border border-border/80 bg-background outline-none transition-all hover:ring-2 hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={10} className="min-w-56">
          {/* User info — plain divs, NOT DropdownMenuLabel which requires Menu.Group */}
          <div className="px-2 py-2 border-b border-border/60 mb-1">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>

          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            <UserIcon className="size-3.5 mr-2" />
            My Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            <LogOutIcon className="size-3.5 mr-2" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <p className="max-w-64 text-right text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
