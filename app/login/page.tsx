"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthTab = "sign-in" | "sign-up";
type AuthAction = "sign-in" | "sign-up" | "magic-link";

const CALLBACK_ERRORS: Record<string, string> = {
  auth_callback_failed:
    "The sign-in link is invalid or expired. Please request a new one.",
};

function getRedirectTo() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/auth/callback?next=/dashboard`;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<AuthTab>("sign-in");
  const [activeAction, setActiveAction] = useState<AuthAction | null>(null);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [error, setError] = useState<string | null>(
    CALLBACK_ERRORS[searchParams.get("error") ?? ""] ?? null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const redirectedFrom = searchParams.get("redirectedFrom");
  const isBusy = activeAction !== null;

  const clearMessages = () => {
    setError(null);
    setNotice(null);
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 3200);
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    const email = signInEmail.trim();
    const password = signInPassword;

    if (!email || !password) {
      setError("Email and password are required to sign in.");
      return;
    }

    setActiveAction("sign-in");

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Unable to sign in right now. Please try again.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    const email = signUpEmail.trim();
    const password = signUpPassword;

    if (!email || !password) {
      setError("Email and password are required to create an account.");
      return;
    }

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    setActiveAction("sign-up");

    try {
      const supabase = createClient();
      const redirectTo = getRedirectTo();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: redirectTo
          ? {
              emailRedirectTo: redirectTo,
            }
          : undefined,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setNotice(
        "Account created. Check your email to verify your account before signing in.",
      );
      setTab("sign-in");
      setSignInEmail(email);
      setSignInPassword("");
    } catch (signUpError) {
      setError(
        signUpError instanceof Error
          ? signUpError.message
          : "Unable to create your account right now. Please try again.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  const handleMagicLink = async () => {
    clearMessages();

    const email = signInEmail.trim();

    if (!email) {
      setError("Enter your email to receive a magic sign-in link.");
      return;
    }

    setActiveAction("magic-link");

    try {
      const supabase = createClient();
      const redirectTo = getRedirectTo();

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: redirectTo
          ? {
              emailRedirectTo: redirectTo,
            }
          : undefined,
      });

      if (otpError) {
        throw otpError;
      }

      setNotice("Magic link sent. Check your inbox to continue.");
    } catch (otpError) {
      setError(
        otpError instanceof Error
          ? otpError.message
          : "Unable to send magic link right now. Please try again.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="landing-bg relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="landing-content w-full max-w-md">
        <Card className="surface-glass border-border/70 shadow-2xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">OI</span>
              <span className="font-heading text-sm font-semibold text-muted-foreground tracking-wide">Opportunity Inbox Copilot</span>
            </div>
            <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
            <CardDescription>
              {redirectedFrom
                ? `Sign in to continue to ${redirectedFrom}.`
                : "Sign in or create an account to save your analysis results."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                {notice}
              </div>
            ) : null}

            <Tabs
              value={tab}
              onValueChange={(value) => {
                setTab(value as AuthTab);
                clearMessages();
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="sign-in" className="mt-4">
                <form className="space-y-4" onSubmit={handleSignIn}>
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInEmail}
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={isBusy}
                      onChange={(event) => setSignInEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <button
                        type="button"
                        onClick={() =>
                          showToast("Forgot password flow will be added next.")
                        }
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <Input
                      id="signin-password"
                      type="password"
                      value={signInPassword}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={isBusy}
                      onChange={(event) => setSignInPassword(event.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isBusy}>
                    {activeAction === "sign-in" ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      or
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={isBusy}
                    onClick={handleMagicLink}
                  >
                    {activeAction === "magic-link"
                      ? "Sending link..."
                      : "Send Magic Link"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="sign-up" className="mt-4">
                <form className="space-y-4" onSubmit={handleSignUp}>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpEmail}
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={isBusy}
                      onChange={(event) => setSignUpEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpPassword}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      disabled={isBusy}
                      onChange={(event) => setSignUpPassword(event.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isBusy}>
                    {activeAction === "sign-up"
                      ? "Creating account..."
                      : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-50 max-w-sm rounded-lg border border-border/80 bg-card px-4 py-3 text-sm text-card-foreground shadow-xl"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="landing-bg flex min-h-screen items-center justify-center px-4 py-10">
          <div className="landing-content w-full max-w-md">
            <Card className="surface-glass border-border/70 shadow-2xl">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Loading authentication...
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}