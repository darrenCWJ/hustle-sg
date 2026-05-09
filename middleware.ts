import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;

  // Rewrite m.* subdomain to the /m/* route group
  if (
    (host.startsWith("m.") || host.startsWith("mobile.")) &&
    !pathname.startsWith("/m") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/m/feed" : `/m${pathname}`;
    return NextResponse.rewrite(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
