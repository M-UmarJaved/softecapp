import OpenAI from "openai";
import { NextResponse } from "next/server";

import { pickDemoFallbackResponse } from "@/lib/ai/demo-data";
import { getSystemPrompt } from "@/lib/ai/prompts";

type IncomingRole = "user" | "assistant" | "system";

type IncomingMessage = {
  role: IncomingRole;
  content: string;
};

type GenerateRequestBody = {
  theme?: string;
  model?: string;
  messages?: IncomingMessage[];
  useDemoFallback?: boolean;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

declare global {
  var __aiRouteRateLimitStore: Map<string, RateLimitState> | undefined;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const DEFAULT_GROK_MODEL = "grok-3-mini";     // fast model for chat streaming
const DEFAULT_GROK_BASE_URL = "https://api.x.ai/v1";

const rateLimitStore =
  globalThis.__aiRouteRateLimitStore ?? new Map<string, RateLimitState>();
globalThis.__aiRouteRateLimitStore = rateLimitStore;

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();

  return forwardedFor || realIp || "unknown";
}

function cleanRateLimitStore(now: number) {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function applyRateLimit(clientId: string) {
  const now = Date.now();
  cleanRateLimitStore(now);

  const current = rateLimitStore.get(clientId);

  if (!current || current.resetAt <= now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(clientId, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    };
  }

  const nextCount = current.count + 1;
  current.count = nextCount;
  rateLimitStore.set(clientId, current);

  if (nextCount > RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000),
      ),
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - nextCount),
    resetAt: current.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

function toStreamHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store, no-transform",
    Connection: "keep-alive",
    ...extra,
  };
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createWordByWordStream(text: string, signal: AbortSignal) {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/).filter(Boolean);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of words) {
        if (signal.aborted) {
          break;
        }

        controller.enqueue(encoder.encode(chunk));
        await sleep(chunk.trim() ? 22 : 8);
      }

      controller.close();
    },
    cancel() {
      if (!signal.aborted) {
        // Upstream cancellation is handled by the route-level AbortController.
      }
    },
  });
}

function resolveApiKey() {
  return (
    process.env.GROK_API_KEY ||
    process.env.XAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    ""
  );
}

function normalizeMessages(messages: IncomingMessage[] | undefined) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      (message): message is IncomingMessage =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
}

function getLastUserMessage(messages: IncomingMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user");
}

/*
  Environment setup for local development (.env.local):

  GROK_API_KEY=your-xai-api-key
  GROK_MODEL=grok-3-mini-fast
  GROK_BASE_URL=https://api.x.ai/v1

  Optional compatibility alias if your tooling still expects OpenAI naming:
  OPENAI_API_KEY=your-xai-api-key
*/
export async function POST(request: Request) {
  const clientId = getClientIdentifier(request);
  const rate = applyRateLimit(clientId);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please retry shortly.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSeconds),
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  }

  let body: GenerateRequestBody;

  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      {
        status: 400,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  }

  const theme = typeof body.theme === "string" ? body.theme : "health";
  const useDemoFallback = body.useDemoFallback ?? true;
  const messages = normalizeMessages(body.messages);

  if (messages.length === 0) {
    return NextResponse.json(
      {
        error: "At least one user message is required.",
      },
      {
        status: 400,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  }

  const lastUserMessage = getLastUserMessage(messages)?.content ?? "";

  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort(), {
    once: true,
  });

  const apiKey = resolveApiKey();

  if (!apiKey) {
    const fallbackText = pickDemoFallbackResponse(lastUserMessage, theme);

    return new Response(
      createWordByWordStream(fallbackText, abortController.signal),
      {
        status: 200,
        headers: toStreamHeaders({
          "X-AI-Provider": "demo-fallback",
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        }),
      },
    );
  }

  const model =
    (typeof body.model === "string" && body.model.trim()) ||
    process.env.GROK_MODEL ||
    DEFAULT_GROK_MODEL;

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.GROK_BASE_URL || DEFAULT_GROK_BASE_URL,
  });

  try {
    const startedAt = Date.now();
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;
    let streamedWordCount = 0;

    const completion = await client.chat.completions.create(
      {
        model,
        stream: true,
        stream_options: {
          include_usage: true,
        },
        temperature: 0.25,
        messages: [
          {
            role: "system",
            content: getSystemPrompt(theme),
          },
          ...messages,
        ],
      },
      {
        signal: abortController.signal,
      },
    );

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            if (abortController.signal.aborted) {
              break;
            }

            if (chunk.usage) {
              promptTokens = chunk.usage.prompt_tokens ?? promptTokens;
              completionTokens =
                chunk.usage.completion_tokens ?? completionTokens;
              totalTokens = chunk.usage.total_tokens ?? totalTokens;
            }

            const delta = chunk.choices?.[0]?.delta?.content;

            if (!delta) {
              continue;
            }

            streamedWordCount += delta
              .split(/\s+/)
              .filter(Boolean).length;

            controller.enqueue(encoder.encode(delta));
          }

          console.info("[AI Route Usage]", {
            provider: "grok",
            model,
            promptTokens,
            completionTokens,
            totalTokens,
            streamedWordCount,
            durationMs: Date.now() - startedAt,
            theme,
          });

          controller.close();
        } catch (streamError) {
          controller.error(streamError);
        }
      },
      cancel() {
        if (!abortController.signal.aborted) {
          abortController.abort();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: toStreamHeaders({
        "X-AI-Provider": "grok",
        "X-AI-Model": String(model),
        "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
        "X-RateLimit-Remaining": String(rate.remaining),
        "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
      }),
    });
  } catch (error) {
    if (abortController.signal.aborted) {
      return NextResponse.json(
        { error: "Request was aborted." },
        {
          status: 499,
          headers: {
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
            "X-RateLimit-Remaining": String(rate.remaining),
            "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
          },
        },
      );
    }

    if (useDemoFallback) {
      const fallbackText = pickDemoFallbackResponse(lastUserMessage, theme);

      return new Response(
        createWordByWordStream(fallbackText, abortController.signal),
        {
          status: 200,
          headers: toStreamHeaders({
            "X-AI-Provider": "demo-fallback",
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
            "X-RateLimit-Remaining": String(rate.remaining),
            "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
          }),
        },
      );
    }

    console.error("[AI Route Error]", error);

    return NextResponse.json(
      {
        error: "Unable to generate a response from Grok right now.",
      },
      {
        status: 502,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  }
}