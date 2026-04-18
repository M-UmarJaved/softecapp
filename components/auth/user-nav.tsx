"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

  if (!source) {
    return "U";
  }

  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

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

      if (signOutError) {
        throw signOutError;
      }

      router.replace("/login");
      router.refresh();
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Unable to sign out right now. Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open user menu"
          render={
            <Button
              variant="outline"
              className="size-9 rounded-full border-border/80 p-0"
            />
          }
        >
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={10} className="min-w-56">
          <DropdownMenuLabel className="font-heading text-sm text-foreground">
            {name}
          </DropdownMenuLabel>
          <DropdownMenuLabel className="pt-0 text-xs font-normal text-muted-foreground">
            {email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {error ? (
        <p className="max-w-64 text-right text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}