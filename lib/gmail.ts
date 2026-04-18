const GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API_BASE   = "https://gmail.googleapis.com/gmail/v1";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export function getGmailAuthUrl(state?: string): string {
  const clientId    = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GMAIL_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("GOOGLE_CLIENT_ID and GMAIL_REDIRECT_URI must be set in .env.local");
  }
  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         SCOPES,
    access_type:   "offline",
    prompt:        "consent",
    ...(state ? { state } : {}),
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GmailTokens = {
  access_token:   string;
  refresh_token?: string;
  expires_in:     number;
  token_type:     string;
};

export async function exchangeCodeForTokens(code: string): Promise<GmailTokens> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  process.env.GMAIL_REDIRECT_URI!,
      grant_type:    "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  return res.json() as Promise<GmailTokens>;
}

export type GmailMessage = {
  id:      string;
  subject: string;
  sender:  string;
  snippet: string;
  body:    string;
  date:    string;
};

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeURIComponent(
      atob(base64).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
    );
  } catch {
    return atob(base64);
  }
}

function extractBody(payload: Record<string, unknown>): string {
  const parts = payload.parts as Array<Record<string, unknown>> | undefined;
  if (parts) {
    for (const part of parts) {
      const body = part.body as Record<string, unknown> | undefined;
      if ((part.mimeType as string) === "text/plain" && body?.data) {
        return decodeBase64Url(body.data as string);
      }
    }
    for (const part of parts) {
      const body = part.body as Record<string, unknown> | undefined;
      if ((part.mimeType as string) === "text/html" && body?.data) {
        return decodeBase64Url(body.data as string).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }
    }
  }
  const body = payload.body as Record<string, unknown> | undefined;
  if (body?.data) return decodeBase64Url(body.data as string);
  return "";
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function fetchEmails(
  accessToken: string,
  maxResults = 15,
  unreadOnly = false,
): Promise<GmailMessage[]> {
  const params: Record<string, string> = { labelIds: "INBOX", maxResults: String(maxResults) };
  if (unreadOnly) params.q = "is:unread";

  const listRes = await fetch(
    `${GMAIL_API_BASE}/users/me/messages?` + new URLSearchParams(params),
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!listRes.ok) throw new Error(`Gmail list failed: ${await listRes.text()}`);

  const listData = await listRes.json() as { messages?: Array<{ id: string }> };
  const messageIds = listData.messages ?? [];
  if (messageIds.length === 0) return [];

  const messages = await Promise.all(
    messageIds.slice(0, maxResults).map(async ({ id }) => {
      const msgRes = await fetch(
        `${GMAIL_API_BASE}/users/me/messages/${id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!msgRes.ok) return null;

      const msg = await msgRes.json() as {
        id: string;
        snippet: string;
        payload: Record<string, unknown>;
        internalDate: string;
      };

      const hdrs    = (msg.payload.headers ?? []) as Array<{ name: string; value: string }>;
      const subject = getHeader(hdrs, "Subject") || "(no subject)";
      const sender  = getHeader(hdrs, "From");
      const date    = new Date(Number(msg.internalDate)).toISOString();
      const body    = extractBody(msg.payload) || msg.snippet;

      return { id: msg.id, subject, sender, snippet: msg.snippet, body: body.slice(0, 2000), date } satisfies GmailMessage;
    }),
  );

  return messages.filter((m): m is GmailMessage => m !== null);
}
