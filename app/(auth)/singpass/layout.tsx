import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DEMO_MODE } from "@/lib/config/demo";

// The mock-Singpass surface is demo-only. Outside the demo, the real login
// path is email OTP (/login) — see IMPROVEMENT_PLAN.md Phase 3.1.
export default function SingpassLayout({ children }: { children: ReactNode }) {
  if (!DEMO_MODE) redirect("/login");
  return <>{children}</>;
}
