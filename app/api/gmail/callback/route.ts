import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/lib/gmail";

/**
 * GET /api/gmail/callback
 * Google redirects here after the user grants permission.
 * We exchange the code for tokens and store them in a short-lived cookie,
 * then redirect back to the analyze page.
 */
export async function GET(request: NextRequest) {
  const url   = new URL(request.url);
  const code  = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const returnTo = state ? decodeURIComponent(state) : "/analyze";

  if (error || !code) {
    const redirectUrl = new URL(returnTo, url.origin);
    redirectUrl.searchParams.set("gmail_error", error ?? "no_code");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // Store access token in a secure httpOnly cookie (30 min TTL)
    const redirectUrl = new URL(returnTo, url.origin);
    redirectUrl.searchParams.set("gmail_connected", "1");

    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set("gmail_access_token", tokens.access_token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   tokens.expires_in ?? 3600,
      path:     "/",
    });

    // Store refresh token if provided (longer-lived)
    if (tokens.refresh_token) {
      response.cookies.set("gmail_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge:   60 * 60 * 24 * 30, // 30 days
        path:     "/",
      });
    }

    return response;
  } catch (err) {
    const redirectUrl = new URL(returnTo, url.origin);
    redirectUrl.searchParams.set("gmail_error", "token_exchange_failed");
    return NextResponse.redirect(redirectUrl);
  }
}
