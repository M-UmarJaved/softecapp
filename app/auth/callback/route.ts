import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function sanitizeNextPath(nextParam: string | null) {
  if (!nextParam || !nextParam.startsWith("/")) {
    return "/dashboard";
  }
  return nextParam;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));

  console.log("[auth/callback] incoming params:", {
    hasCode: !!code,
    hasTokenHash: !!tokenHash,
    type,
    next,
    url: request.url,
  });

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log("[auth/callback] exchangeCodeForSession succeeded, redirecting to", next);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message, error);
    return NextResponse.redirect(
      new URL(`/login?error=auth_callback_failed&reason=${encodeURIComponent(error.message)}`, requestUrl.origin),
    );
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      console.log("[auth/callback] verifyOtp succeeded, redirecting to", next);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
    console.error("[auth/callback] verifyOtp failed:", error.message, error);
    return NextResponse.redirect(
      new URL(`/login?error=auth_callback_failed&reason=${encodeURIComponent(error.message)}`, requestUrl.origin),
    );
  }

  console.error("[auth/callback] no code or token_hash in request");
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_failed&reason=no_code", requestUrl.origin),
  );
}
