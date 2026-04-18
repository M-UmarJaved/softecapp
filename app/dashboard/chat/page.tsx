"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontalIcon, Loader2Icon, BotIcon, UserIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <BotIcon className="size-4" />
      </span>
      <div className="rounded-2xl rounded-bl-md border border-border/60 bg-card px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
          <span className="size-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
          <span className="size-2 animate-bounce rounded-full bg-primary/60" />
          <span className="ml-2 text-xs text-muted-foreground">Grok is thinking…</span>
        </div>
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <BotIcon className="size-4" />
        </span>
      )}
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        isUser
          ? "rounded-br-md bg-primary text-primary-foreground"
          : "rounded-bl-md border border-border/60 bg-card text-card-foreground",
      )}>
        <p className="whitespace-pre-wrap break-words">
          {msg.content}
          {/* Blinking cursor while streaming */}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-current align-middle" />
          )}
        </p>
      </div>
      {isUser && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <UserIcon className="size-4" />
        </span>
      )}
    </div>
  );
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "What scholarships should I apply for first?",
  "How can I improve my CGPA for better opportunities?",
  "What documents do I need for a scholarship application?",
  "Explain the difference between a fellowship and an internship",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content: "Hi! I'm your Opportunity Coach powered by Grok AI. Ask me about scholarships, internships, deadlines, how to improve your profile, or anything about your opportunities.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const unmountedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => { unmountedRef.current = true; }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content };
    const assistantId = `a-${Date.now()}`;

    // Add user message — keep assistant placeholder OUT until we start streaming
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Small delay so the typing indicator shows before streaming starts
    await new Promise((r) => setTimeout(r, 100));

    // Now add the empty assistant message and mark it as streaming
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);
    setStreamingId(assistantId);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: "opportunity-coach",
          useDemoFallback: true,
          messages: [
            ...[...messages, userMsg].slice(-8).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" })) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || unmountedRef.current) break;

        accumulated += decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m),
        );
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `Sorry, I couldn't get a response right now.\n\n${
                  errorMsg.includes("API key") || errorMsg.includes("401")
                    ? "Make sure GROK_API_KEY is set in your .env.local file."
                    : `Error: ${errorMsg}`
                }`,
              }
            : m,
        ),
      );
    } finally {
      if (!unmountedRef.current) {
        setIsLoading(false);
        setStreamingId(null);
        // Refocus textarea
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    }
  };

  const showSuggestions = messages.length === 1; // only show after intro

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm">

      {/* Header */}
      <div className="border-b border-border/70 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <BotIcon className="size-4" />
            </span>
            <div>
              <p className="font-heading text-sm font-semibold text-foreground">Opportunity Coach</p>
              <p className="text-xs text-muted-foreground">Powered by Grok AI</p>
            </div>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[10px] text-muted-foreground">
            <span className={cn(
              "size-1.5 rounded-full",
              isLoading ? "animate-pulse bg-yellow-400" : "bg-green-400",
            )} />
            {isLoading ? "Thinking…" : "Online"}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isStreaming={msg.id === streamingId && isLoading}
          />
        ))}

        {/* Typing indicator — shows BEFORE the assistant message appears */}
        {isLoading && streamingId === null && (
          <TypingIndicator />
        )}

        {/* Suggested prompts */}
        {showSuggestions && !isLoading && (
          <div className="space-y-2 pt-2">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <SparklesIcon className="size-3" />
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-xl border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/70 bg-card/30 p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 144)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about scholarships, deadlines, profile tips…"
            disabled={isLoading}
            className="min-h-10 max-h-36 flex-1 resize-none rounded-xl border border-input bg-background/80 px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-10 shrink-0 px-3"
            aria-label="Send message"
          >
            {isLoading
              ? <Loader2Icon className="size-4 animate-spin" />
              : <SendHorizontalIcon className="size-4" />
            }
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
