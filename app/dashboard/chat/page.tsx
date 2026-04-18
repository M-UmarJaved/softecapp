"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontalIcon, Loader2Icon, BotIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function MessageBubble({ msg }: { msg: Message }) {
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
        <p className="whitespace-pre-wrap break-words">{msg.content || "…"}</p>
      </div>
      {isUser && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <UserIcon className="size-4" />
        </span>
      )}
    </div>
  );
}

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content: "Hi! I'm your Opportunity Coach powered by Grok AI. Ask me about scholarships, internships, how to improve your profile, or anything about your opportunities.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const unmountedRef = useRef(false);

  useEffect(() => () => { unmountedRef.current = true; }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    const assistantId = `a-${Date.now()}`;
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: "health",
          useDemoFallback: true,
          messages: [
            // Send last 6 messages as context
            ...[...messages, userMsg].slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

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
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, I couldn't connect to the AI right now. Make sure GROK_API_KEY is set in your environment." }
            : m,
        ),
      );
    } finally {
      if (!unmountedRef.current) setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-border/70 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BotIcon className="size-4" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">Opportunity Coach</p>
            <p className="text-xs text-muted-foreground">Powered by Grok AI · Ask anything about your opportunities</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-end gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <BotIcon className="size-4" />
            </span>
            <div className="rounded-2xl rounded-bl-md border border-border/60 bg-card px-4 py-3">
              <div className="flex gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/70 p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-end gap-2"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about scholarships, deadlines, profile tips..."
            disabled={isLoading}
            className="min-h-10 max-h-36 flex-1 resize-none rounded-xl border border-input bg-background/80 px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="h-10 shrink-0 px-3">
            {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : <SendHorizontalIcon className="size-4" />}
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
