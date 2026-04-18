"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";

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
type AuthAction = "sign-in" | "sign-up" | "google" | "magic-link";

const CALLBACK_ERRORS: Record<string, string> = {
  auth_callback_failed: "The sign-in link is invalid or expired. Please request a new one.",
};

function getRedirectTo() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/auth/callback?next=/dashboard`;
}

// ─── Google "G" icon ─────────────────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Google sign-in button ────────────────────────────────────────────────────

function GoogleButton({ isBusy, activeAction, onGoogle }: {
  isBusy: boolean;
  activeAction: AuthAction | null;
  onGoogle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onGoogle}
      disabled={isBusy}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {activeAction === "google" ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <GoogleIcon className="size-4" />
      )}
      {activeAction === "google" ? "Connecting…" : "Continue with Google"}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

// ─── Main login content ───────────────────────────────────────────────────────

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<AuthTab>("sign-in");
  const [activeAction, setActiveAction] = useState<AuthAction | null>(null);

  const [signInEmail,    setSignInEmail]    = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail,    setSignUpEmail]    = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [error,  setError]  = useState<string | null>(
    CALLBACK_ERRORS[searchParams.get("error") ?? ""] ?? null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [toast,  setToast]  = useState<string | null>(null);

  const redirectedFrom = searchParams.get("redirectedFrom");
  const isBusy = activeAction !== null;

  const clearMessages = () => { setError(null); setNotice(null); };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((c) => (c === message ? null : c)), 3200);
  };

  // ── Google OAuth ────────────────────────────────────────────────────────────

  const handleGoogle = async () => {
    clearMessages();
    setActiveAction("google");
    try {
      const supabase = createClient();
      const redirectTo = getRedirectTo();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (oauthError) throw oauthError;
      // Browser will redirect — no need to setActiveAction(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setActiveAction(null);
    }
  };

  // ── Email/password sign-in ──────────────────────────────────────────────────

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    const email = signInEmail.trim();
    const password = signInPassword;
    if (!email || !password) { setError("Email and password are required."); return; }
    setActiveAction("sign-in");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setActiveAction(null);
    }
  };

  // ── Sign-up ─────────────────────────────────────────────────────────────────

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    const email = signUpEmail.trim();
    const password = signUpPassword;
    if (!email || !password) { setError("Email and password are required."); return; }
    if (password.length < 8) { setError("Use at least 8 characters for your password."); return; }
    setActiveAction("sign-up");
    try {
      const supabase = createClient();
      const redirectTo = getRedirectTo();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });
      if (signUpError) throw signUpError;
      if (data.session) { router.replace("/dashboard"); router.refresh(); return; }
      setNotice("Account created. Check your email to verify before signing in.");
      setTab("sign-in");
      setSignInEmail(email);
      setSignInPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account. Please try again.");
    } finally {
      setActiveAction(null);
    }
  };

  // ── Magic link ──────────────────────────────────────────────────────────────

  const handleMagicLink = async () => {
    clearMessages();
    const email = signInEmail.trim();
    if (!email) { setError("Enter your email to receive a magic sign-in link."); return; }
    setActiveAction("magic-link");
    try {
      const supabase = createClient();
      const redirectTo = getRedirectTo();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });
      if (otpError) throw otpError;
      setNotice("Magic link sent. Check your inbox to continue.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send magic link. Please try again.");
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
                : "Sign in or create an account to save your results."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error  && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            {notice && <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">{notice}</div>}

            {/* Google button — shown above tabs, applies to both sign-in and sign-up */}
            <GoogleButton isBusy={isBusy} activeAction={activeAction} onGoogle={handleGoogle} />

            <OrDivider />

            <Tabs value={tab} onValueChange={(v) => { setTab(v as AuthTab); clearMessages(); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              </TabsList>

              {/* ── Sign In ── */}
              <TabsContent value="sign-in" className="mt-4">
                <form className="space-y-4" onSubmit={handleSignIn}>
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" value={signInEmail} autoComplete="email"
                      placeholder="you@example.com" disabled={isBusy}
                      onChange={(e) => setSignInEmail(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <button type="button" onClick={() => showToast("Password reset coming soon.")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Forgot Password?
                      </button>
                    </div>
                    <Input id="signin-password" type="password" value={signInPassword}
                      autoComplete="current-password" placeholder="Enter your password"
                      disabled={isBusy} onChange={(e) => setSignInPassword(e.target.value)} required />
                  </div>

                  <Button type="submit" className="w-full" disabled={isBusy}>
                    {activeAction === "sign-in" ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* ── Sign Up ── */}
              <TabsContent value="sign-up" className="mt-4">
                <form className="space-y-4" onSubmit={handleSignUp}>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" value={signUpEmail} autoComplete="email"
                      placeholder="you@example.com" disabled={isBusy}
                      onChange={(e) => setSignUpEmail(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" value={signUpPassword}
                      autoComplete="new-password" placeholder="Create a strong password (8+ chars)"
                      disabled={isBusy} onChange={(e) => setSignUpPassword(e.target.value)} required />
                  </div>

                  <Button type="submit" className="w-full" disabled={isBusy}>
                    {activeAction === "sign-up" ? "Creating account…" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {toast && (
        <div role="status" aria-live="polite"
          className="fixed right-4 bottom-4 z-50 max-w-sm rounded-lg border border-border/80 bg-card px-4 py-3 text-sm text-card-foreground shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="landing-bg flex min-h-screen items-center justify-center px-4 py-10">
        <div className="landing-content w-full max-w-md">
          <Card className="surface-glass border-border/70 shadow-2xl">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Loading authentication…
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
