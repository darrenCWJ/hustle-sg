"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/security/safe-redirect";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Interim real authentication (IMPROVEMENT_PLAN.md Phase 3.1): Supabase email
// OTP. This is the ONLY login path when NEXT_PUBLIC_DEMO_MODE=false; the mock
// Singpass flow stays demo-only. Full Singpass/MyInfo OIDC replaces this when
// government onboarding is available.

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export async function requestLoginCode(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  // Throttle per address: OTP emails are an abuse vector (mail-bombing).
  const allowed = await checkRateLimit(`otp:${parsed.data}`, 3, 600);
  if (!allowed) {
    return { ok: false, error: "Too many codes requested — try again in a few minutes." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { shouldCreateUser: true },
  });
  if (error) {
    console.error("[login] requestLoginCode", error);
    return { ok: false, error: "Could not send the code. Try again shortly." };
  }
  return { ok: true };
}

export async function verifyLoginCode(
  email: string,
  code: string,
  next: string,
): Promise<{ ok: boolean; error?: string }> {
  const parsedEmail = emailSchema.safeParse(email);
  const parsedCode = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code").safeParse(code);
  if (!parsedEmail.success) return { ok: false, error: "Invalid email" };
  if (!parsedCode.success) {
    return { ok: false, error: parsedCode.error.issues[0]?.message ?? "Invalid code" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsedEmail.data,
    token: parsedCode.data,
    type: "email",
  });
  if (error) {
    return { ok: false, error: "That code didn't work — check it or request a new one." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session not established." };

  const target = safeNext(next, "/feed");

  // First sign-in: create a minimal profile, then run onboarding.
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const localPart = parsedEmail.data.split("@")[0] ?? "user";
    const handle = await uniqueHandle(localPart);
    const admin = createServiceClient();
    const { error: insertErr } = await admin.from("profiles").upsert(
      {
        id: user.id,
        handle,
        display_name: localPart.replace(/[._-]+/g, " ").trim() || "New user",
        role: "freelancer",
        // No nric_hash / singpass_verified_at: OTP proves email ownership only.
      },
      { onConflict: "id" },
    );
    if (insertErr) {
      console.error("[login] profile creation", insertErr);
      return { ok: false, error: "Could not set up your profile. Try again." };
    }
    redirect(`/onboarding?next=${encodeURIComponent(target)}`);
  }

  redirect(target);
}

async function uniqueHandle(base: string): Promise<string> {
  const admin = createServiceClient();
  const normalized =
    base.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24).padEnd(3, "0") || "user";
  let candidate = normalized;
  for (let n = 1; n <= 50; n++) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("handle", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${normalized}-${n}`;
  }
  return `${normalized}-${Date.now() % 100000}`;
}
