import { NextResponse, userAgent } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { VIEW_COOKIE, mobilePathFor } from "@/lib/device/mobile-routes";
import type { NextRequest } from "next/server";

function isPhone(request: NextRequest): boolean {
  // Chromium sends the client hint on every request; trust it when present.
  const hint = request.headers.get("sec-ch-ua-mobile");
  if (hint === "?1") return true;
  if (hint === "?0") return false;
  // Safari/Firefox fall back to UA sniffing. Tablets keep the desktop site.
  return userAgent(request).device.type === "mobile";
}

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

  // Phones visiting a desktop page with a mobile equivalent get the /m
  // version, unless they opted for the desktop site ("Use desktop site"
  // sets the view cookie). GET only — never divert form posts.
  if (
    request.method === "GET" &&
    request.cookies.get(VIEW_COOKIE)?.value !== "desktop" &&
    isPhone(request)
  ) {
    const mobilePath = mobilePathFor(pathname);
    if (mobilePath) {
      const url = request.nextUrl.clone();
      url.pathname = mobilePath;
      return NextResponse.redirect(url);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
