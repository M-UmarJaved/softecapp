"use client";

import { useEffect, useRef, useState } from "react";
import { SparklesIcon } from "lucide-react";

import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble, type ChatMessage } from "@/components/chat/message-bubble";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChatWindowProps = {
  messages: ChatMessage[];
  onSend: (
    message: string,
    context: { demoMode: boolean },
  ) => Promise<void> | void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  className?: string;
  initialDemoMode?: boolean;
  onDemoModeChange?: (enabled: boolean) => void;
};

export function ChatWindow({
  messages,
  onSend,
  isLoading = false,
  title = "AI Chat Interface",
  description = "Use Demo Mode for a reliable offline pitch flow.",
  className,
  initialDemoMode = true,
  onDemoModeChange,
}: ChatWindowProps) {
  const [demoMode, setDemoMode] = useState(initialDemoMode);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onDemoModeChange?.(demoMode);
  }, [demoMode, onDemoModeChange]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const handleSend = async (message: string) => {
    await onSend(message, { demoMode });
  };

  return (
    <Card
      className={cn(
        "surface-glass flex h-[calc(100vh-11rem)] min-h-[36rem] flex-col border-border/70",
        className,
      )}
    >
      <CardHeader className="border-b border-border/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-heading text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          <Button
            type="button"
            variant={demoMode ? "default" : "outline"}
            size="sm"
            className="w-full gap-2 sm:w-auto"
            onClick={() => setDemoMode((enabled) => !enabled)}
          >
            <SparklesIcon className="size-4" />
            Demo Mode: {demoMode ? "On" : "Off"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div
          ref={scrollContainerRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6"
        >
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-background/60 p-6 text-center text-sm text-muted-foreground">
              Start the conversation to preview the pitch-ready chat flow.
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {isLoading ? (
            <MessageBubble
              message={{ id: "assistant-typing", role: "assistant", content: "" }}
              isTyping
            />
          ) : null}
        </div>

        <div className="border-t border-border/70 bg-card/30 p-3 sm:p-4">
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            disabled={isLoading}
            placeholder="Ask anything about your AI solution..."
          />
        </div>
      </CardContent>
    </Card>
  );
}