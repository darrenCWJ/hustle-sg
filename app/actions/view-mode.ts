"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VIEW_COOKIE } from "@/lib/device/mobile-routes";

const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 180;

// Escape hatch from the phone auto-redirect (middleware.ts): remembers that
// this device wants the desktop site.
export async function switchToDesktopSite() {
  const jar = await cookies();
  jar.set(VIEW_COOKIE, "desktop", {
    path: "/",
    maxAge: SIX_MONTHS_SECONDS,
    httpOnly: true,
    sameSite: "lax",
  });
  redirect("/dashboard");
}

// Undo the opt-out so phones auto-redirect to /m again.
export async function switchToMobileSite() {
  const jar = await cookies();
  jar.delete(VIEW_COOKIE);
  redirect("/m/feed");
}
