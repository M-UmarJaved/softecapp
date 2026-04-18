import { NextResponse } from "next/server";
import { loadProfile, saveProfile } from "@/lib/db/profile";
import type { StudentProfileSpec } from "@/lib/types";

/** GET /api/profile — load the logged-in user's saved profile */
export async function GET() {
  try {
    const profile = await loadProfile();
    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load profile" },
      { status: 500 },
    );
  }
}

/** POST /api/profile — save the logged-in user's profile */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await saveProfile(body as StudentProfileSpec);
    return NextResponse.json({ saved: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save profile";
    const status = msg === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
