import { NextResponse, type NextRequest } from "next/server";
import { fetchEmails } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("gmail_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "not_connected", message: "Gmail not connected." },
      { status: 401 },
    );
  }

  const url        = new URL(request.url);
  const maxResults = Math.min(Number(url.searchParams.get("max") ?? "15"), 15);
  const unreadOnly = url.searchParams.get("unread") === "true";

  try {
    const messages = await fetchEmails(accessToken, maxResults, unreadOnly);

    const emails = messages.map((msg) => ({
      id:           msg.id,
      subject:      msg.subject,
      sender:       msg.sender,
      body:         msg.body || msg.snippet,
      receivedDate: msg.date,
    }));

    return NextResponse.json({ emails, count: emails.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch emails";
    if (message.includes("401") || message.includes("invalid_token")) {
      return NextResponse.json(
        { error: "token_expired", message: "Gmail session expired. Please reconnect." },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: "fetch_failed", message }, { status: 502 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ disconnected: true });
  response.cookies.delete("gmail_access_token");
  response.cookies.delete("gmail_refresh_token");
  return response;
}
