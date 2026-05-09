import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { BottomTabBar } from "./BottomTabBar";

export const metadata: Metadata = {
  title: "HustleSG",
  description: "Find gigs near you",
};

export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let mode: "worker" | "employer" = "worker";
  let canToggle = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const jar = await cookies();
    const cookieMode = jar.get("hustle_mode")?.value;

    if (profile?.role === "both") {
      canToggle = true;
      mode = cookieMode === "employer" ? "employer" : "worker";
    } else if (profile?.role === "employer") {
      mode = "employer";
    }
  }

  return (
    <>
      <style>{`
        html, body { background: var(--color-surface) !important; overflow: hidden !important; }
      `}</style>
      <div
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-surface)",
          color: "var(--color-ink)",
          overflow: "hidden",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        <BottomTabBar mode={mode} canToggle={canToggle} />
      </div>
    </>
  );
}
