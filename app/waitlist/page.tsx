"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2Icon, Loader2Icon, SparklesIcon } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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

type SubmissionState = "idle" | "loading" | "success" | "error";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setState("error");
      setMessage("Please enter an email address.");
      return;
    }

    setState("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          source: "waitlist-landing",
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ?? "Unable to join the waitlist right now.",
        );
      }

      setState("success");
      setMessage(result?.message ?? "You are on the waitlist.");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to join the waitlist right now.",
      );
    }
  };

  return (
    <div className="landing-bg flex min-h-screen flex-col">
      <SiteHeader />

      <main className="landing-content mx-auto flex w-full max-w-6xl flex-1 items-center px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pt-36">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1fr_0.95fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              <SparklesIcon className="size-3.5" />
              Early Access Waitlist
            </div>

            <h1 className="font-heading text-4xl leading-tight text-foreground sm:text-5xl">
              Reserve Your Spot Before We Launch
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Join 47+ businesses from Lahore, Karachi, and Islamabad.
            </p>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Sign up once and get launch invites, pilot slots, and product
              updates. This is the fastest way to secure access for your team.
            </p>
          </section>

          <Card className="surface-glass border-border/70 shadow-2xl">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Get Early Access</CardTitle>
              <CardDescription>
                Add your business email to the waitlist in under 10 seconds.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="waitlist-email">Work Email</Label>
                  <Input
                    id="waitlist-email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    placeholder="founder@company.com"
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={state === "loading"}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={state === "loading"}
                >
                  {state === "loading" ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </form>

              {message ? (
                <div
                  className={
                    state === "success"
                      ? "flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
                      : "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  }
                >
                  {state === "success" ? (
                    <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
                  ) : null}
                  <span>{message}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}