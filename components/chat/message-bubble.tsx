import { BotIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ChatMessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt?: string | Date;
};

type MessageBubbleProps = {
  message: ChatMessage;
  isTyping?: boolean;
};

export function MessageBubble({ message, isTyping = false }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser ? (
        <Avatar className="size-8 border border-border/70 bg-secondary text-secondary-foreground">
          <AvatarFallback>
            <BotIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
      ) : null}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/70 bg-card text-card-foreground",
        )}
      >
        {isTyping ? (
          <div className="flex items-center gap-1.5" aria-label="Assistant is typing">
            <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>

      {isUser ? (
        <Avatar className="size-8 border border-border/70 bg-primary/15 text-primary">
          <AvatarFallback>
            <UserIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  );
}