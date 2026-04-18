import { NextResponse } from "next/server";
import { getGmailAuthUrl } from "@/lib/gmail";

/**
 * GET /api/gmail/auth
 * Redirects the user to Google's OAuth consent screen.
 * The `state` param carries the return URL so we redirect back after auth.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") ?? "/analyze";

  try {
    const authUrl = getGmailAuthUrl(encodeURIComponent(returnTo));
    return NextResponse.redirect(authUrl);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gmail auth setup error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
