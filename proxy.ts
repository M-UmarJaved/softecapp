import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

function isAuthBypassed() {
  return (
    process.env.BYPASS_AUTH === "true" ||
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
  );
}

export async function proxy(request: NextRequest) {
  if (isAuthBypassed()) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};