import { NextResponse } from "next/server";

import { addWaitlistSignup, WaitlistError } from "@/lib/db/waitlist";

type WaitlistPayload = {
  email?: unknown;
  source?: unknown;
  city?: unknown;
  companyName?: unknown;
};

function asOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: Request) {
  let payload: WaitlistPayload;

  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof payload.email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const signup = await addWaitlistSignup({
      email: payload.email,
      source: asOptionalString(payload.source) ?? "public-waitlist",
      city: asOptionalString(payload.city),
      companyName: asOptionalString(payload.companyName),
    });

    return NextResponse.json(
      {
        message: "You are on the waitlist.",
        signup,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof WaitlistError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unexpected server error while saving waitlist signup." },
      { status: 500 },
    );
  }
}