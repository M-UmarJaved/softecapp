"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  Loader2Icon,
  RefreshCwIcon,
  SettingsIcon,
  UnlinkIcon,
  XCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RawEmail } from "@/lib/types";

type Props = {
  onEmailsImported: (emails: RawEmail[]) => void;
  isConnected: boolean;
  onConnectedChange: (connected: boolean) => void;
};

type FetchState = "idle" | "fetching" | "success" | "error";

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

export function GmailImport({ onEmailsImported, isConnected, onConnectedChange }: Props) {
  const [fetchState,  setFetchState]  = useState<FetchState>("idle");
  const [fetchedCount, setFetchedCount] = useState(0);
  const [errorMsg,    setErrorMsg]    = useState("");
  const [showFilter,  setShowFilter]  = useState(false);

  // Filter state
  const [unreadOnly,  setUnreadOnly]  = useState(false);
  const [maxEmails,   setMaxEmails]   = useState(15);

  const connectGmail = () => {
    window.location.href = `/api/gmail/auth?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  };

  const fetchEmails = async () => {
    setFetchState("fetching");
    setErrorMsg("");

    const params = new URLSearchParams({
      max:    String(maxEmails),
      unread: String(unreadOnly),
    });

    try {
      const res  = await fetch(`/api/gmail/emails?${params}`);
      const data = await res.json() as {
        emails?: RawEmail[];
        count?: number;
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        if (data.error === "not_connected" || data.error === "token_expired") {
          onConnectedChange(false);
          setFetchState("error");
          setErrorMsg("Gmail session expired. Please reconnect.");
          return;
        }
        throw new Error(data.message ?? "Failed to fetch emails");
      }

      const emails = data.emails ?? [];
      setFetchedCount(emails.length);
      setFetchState("success");
      onEmailsImported(emails);
    } catch (err) {
      setFetchState("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to fetch emails");
    }
  };

  const disconnect = async () => {
    await fetch("/api/gmail/emails", { method: "DELETE" });
    onConnectedChange(false);
    setFetchState("idle");
    setFetchedCount(0);
  };

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <button type="button" onClick={connectGmail}
        className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-left transition-all hover:border-white/18 hover:bg-white/5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/6">
          <GoogleIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Import from Gmail</p>
          <p className="text-xs text-slate-500">Connect to fetch emails directly from your inbox</p>
        </div>
        <span className="shrink-0 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 transition-colors group-hover:bg-blue-500/20">
          Connect →
        </span>
      </button>
    );
  }

  // ── Connected ──────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-green-500/20 bg-green-500/5 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10">
            <GoogleIcon className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white">Gmail connected</p>
              <CheckCircle2Icon className="size-3.5 text-green-400" />
            </div>
            <p className="text-xs text-slate-500">
              {fetchState === "success"
                ? `${fetchedCount} email${fetchedCount !== 1 ? "s" : ""} imported`
                : unreadOnly ? "Will fetch unread emails" : `Will fetch latest ${maxEmails} emails`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Filter toggle */}
          <button type="button" onClick={() => setShowFilter((v) => !v)}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              showFilter ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-300",
            )}
            title="Filter options">
            <SettingsIcon className="size-3.5" />
          </button>

          {/* Fetch button */}
          <button type="button" onClick={fetchEmails} disabled={fetchState === "fetching"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              fetchState === "fetching"
                ? "cursor-not-allowed bg-white/5 text-slate-500"
                : "border border-green-500/20 bg-green-500/15 text-green-400 hover:bg-green-500/25",
            )}>
            {fetchState === "fetching"
              ? <><Loader2Icon className="size-3.5 animate-spin" /> Fetching…</>
              : <><RefreshCwIcon className="size-3.5" /> Import Emails</>}
          </button>

          {/* Disconnect */}
          <button type="button" onClick={disconnect}
            className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white/5 hover:text-slate-400"
            title="Disconnect Gmail">
            <UnlinkIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="border-t border-white/8 bg-white/3 px-4 py-3 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Fetch Options</p>

          {/* Unread toggle */}
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-300">Unread emails only</p>
              <p className="text-[10px] text-slate-600">Only fetch emails you haven&apos;t read yet</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={unreadOnly}
              onClick={() => setUnreadOnly((v) => !v)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                unreadOnly ? "bg-blue-500" : "bg-white/15",
              )}>
              <span className={cn(
                "pointer-events-none inline-block size-4 rounded-full bg-white shadow transition-transform",
                unreadOnly ? "translate-x-4" : "translate-x-0",
              )} />
            </button>
          </label>

          {/* Count slider */}
          {!unreadOnly && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-slate-300">Number of emails to fetch</p>
                <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-xs font-bold text-blue-400">
                  {maxEmails}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={15}
                step={1}
                value={maxEmails}
                onChange={(e) => setMaxEmails(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                <span>5</span>
                <span>10</span>
                <span>15</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {fetchState === "error" && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-400">
          <XCircleIcon className="size-3.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Empty result */}
      {fetchState === "success" && fetchedCount === 0 && (
        <div className="mx-4 mb-3 rounded-lg border border-yellow-500/20 bg-yellow-500/8 px-3 py-2 text-xs text-yellow-400">
          No emails found with the current filter. Try adjusting the options above.
        </div>
      )}
    </div>
  );
}
