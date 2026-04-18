"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontalIcon, BotIcon, UserIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

function ThinkingDots() {
  return (
    <div className="flex items-end gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <BotIcon className="size-4" />
      </span>
      <div className="rounded-2xl rounded-bl-md border border-border/60 bg-card px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0ms]" />
          <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:150ms]" />
          <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:300ms]" />
          <span className="ml-2 text-xs text-muted-foreground italic">AI is thinking…</span>
        </div>
      </div>
    </div>
  );
}

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
          {isStreaming && msg.content.length > 0 && (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-current align-middle opacity-70" />
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

const SUGGESTIONS = [
  "What scholarships should I apply for first?",
  "How can I improve my profile for better opportunities?",
  "What documents do I need for a scholarship?",
  "Difference between a fellowship and internship?",
];

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "intro", role: "assistant",
    content: "Hi! I'm your Opportunity Coach powered by Groq AI. Ask me about scholarships, internships, deadlines, or how to improve your profile.",
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const unmountedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Use a ref to track accumulated content — avoids stale closure in stream loop
  const accumulatedRef = useRef("");

  useEffect(() => () => { unmountedRef.current = true; }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content };
    const assistantId = `a-${Date.now()}`;

    // Reset accumulated ref
    accumulatedRef.current = "";

    // Add user message + empty assistant slot in ONE state update
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setIsLoading(true);
    setIsThinking(true);
    setStreamingId(assistantId);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: "opportunity-coach",
          useDemoFallback: true,
          // Build context from messages BEFORE the new ones were added
          messages: [...messages, userMsg].slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      if (!res.body) throw new Error("No response body from server");

      // Hide thinking dots — first chunk is about to arrive
      setIsThinking(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done || unmountedRef.current) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedRef.current += chunk;

        // Capture current value for the state update closure
        const currentContent = accumulatedRef.current;
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: currentContent } : m),
        );
      }

      // Flush any remaining bytes
      const remaining = decoder.decode();
      if (remaining) {
        accumulatedRef.current += remaining;
        const finalContent = accumulatedRef.current;
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: finalContent } : m),
        );
      }

    } catch (err) {
      setIsThinking(false);
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      const errContent =
        errMsg.includes("401") || errMsg.includes("key") || errMsg.includes("API")
          ? "API key error — check GROK_API_KEY in .env.local and restart the server."
          : `Sorry, I couldn't get a response right now. Error: ${errMsg}`;

      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: errContent } : m),
      );
    } finally {
      if (!unmountedRef.current) {
        setIsLoading(false);
        setIsThinking(false);
        setStreamingId(null);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    }
  };

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
              <p className="text-xs text-muted-foreground">Powered by Groq AI · llama-3.1-8b-instant</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[10px] text-muted-foreground">
            <span className={cn(
              "size-1.5 rounded-full transition-colors",
              isThinking ? "animate-pulse bg-yellow-400"
              : isLoading  ? "animate-pulse bg-blue-400"
              : "bg-green-400",
            )} />
            {isThinking ? "Thinking…" : isLoading ? "Streaming…" : "Online"}
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

        {/* Thinking dots — only while waiting for first byte */}
        {isThinking && <ThinkingDots />}

        {/* Suggestions — only on fresh chat */}
        {messages.length === 1 && !isLoading && (
          <div className="space-y-2 pt-2">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <SparklesIcon className="size-3" /> Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}
                  className="rounded-xl border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground">
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
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 144)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Ask about scholarships, deadlines, profile tips…"
            disabled={isLoading}
            className="min-h-10 max-h-36 flex-1 resize-none rounded-xl border border-input bg-background/80 px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-10 shrink-0 px-3"
            aria-label="Send"
          >
            {isLoading ? (
              <span className="flex gap-0.5">
                <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
              </span>
            ) : (
              <SendHorizontalIcon className="size-4" />
            )}
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
