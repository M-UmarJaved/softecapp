"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Loader2Icon, SendHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
};

const MAX_TEXTAREA_HEIGHT = 180;

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
}

export function ChatInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = "Type your message...",
  className,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = disabled || isLoading || isSubmitting;

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    resizeTextarea(textareaRef.current);
  }, [value]);

  const submitMessage = async () => {
    const message = value.trim();

    if (!message || isBusy) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSend(message);
      setValue("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitMessage();
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await submitMessage();
    }
  };

  return (
    <form className={cn("flex items-end gap-2", className)} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isBusy}
        className="min-h-12 max-h-44 w-full resize-none rounded-lg border border-input bg-background/90 px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <Button
        type="submit"
        disabled={isBusy || !value.trim()}
        className="h-12 shrink-0 px-4"
        aria-label="Send message"
      >
        {isBusy ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <SendHorizontalIcon className="size-4" />
        )}
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}