"use client";

import { useEffect, useRef, useState } from "react";

import { ChatWindow } from "@/components/chat/chat-window";
import type { ChatMessage } from "@/components/chat/message-bubble";

const DEMO_RESPONSES = [
  "Great question. In Demo Mode, Opportunity Inbox can still show a reliable assistant experience without internet dependency or API keys.",
  "Use this assistant to explain ranking decisions, decode score breakdowns, and suggest next actions for each opportunity.",
  "For event day, keep this interface and connect the send handler to your real explainability endpoint.",
  "This shell can work as a profile coach, deadline planner, or application checklist assistant with minimal code changes.",
];

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildDemoReply(prompt: string, iteration: number) {
  const response = DEMO_RESPONSES[iteration % DEMO_RESPONSES.length] ?? DEMO_RESPONSES[0]!;
  return `${response}\n\nPrompt captured: "${prompt}"`;
}

function buildApiModeReply(prompt: string) {
  return `API Mode is active. Connect your model endpoint in this page's send handler to replace this placeholder response.\n\nLatest prompt: "${prompt}"`;
}

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      content:
        "Welcome to Opportunity Coach. Ask about fit scores, urgency, or required documents and compare Demo Mode with API Mode.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const demoTurnRef = useRef(0);
  const unmountedRef = useRef(false);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const streamAssistantReply = async (assistantId: string, fullText: string) => {
    const words = fullText.split(" ");

    for (let index = 1; index <= words.length; index += 1) {
      if (unmountedRef.current) {
        return;
      }

      await wait(25 + Math.floor(Math.random() * 55));

      const partial = words.slice(0, index).join(" ");

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: partial,
              }
            : message,
        ),
      );
    }
  };

  const handleSend = async (
    input: string,
    context: { demoMode: boolean },
  ) => {
    if (isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${crypto.randomUUID()}`,
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };

    const assistantId = `assistant-${crypto.randomUUID()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage, assistantPlaceholder]);
    setIsLoading(true);

    try {
      const responseText = context.demoMode
        ? buildDemoReply(input, demoTurnRef.current++)
        : buildApiModeReply(input);

      await streamAssistantReply(assistantId, responseText);
    } finally {
      if (!unmountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <ChatWindow
      messages={messages}
      onSend={handleSend}
      isLoading={isLoading}
      title="AI Chat Console"
      description="Explainability and coaching shell with fallback Demo Mode."
      initialDemoMode
    />
  );
}