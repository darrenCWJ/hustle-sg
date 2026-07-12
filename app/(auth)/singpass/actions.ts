"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  hashNric,
  isValidNric,
  mockEmailForHash,
  mockPasswordForHash,
} from "@/lib/singpass/nric";
import { MOCK_MYINFO } from "@/lib/singpass/mock-profiles";
import { DEMO_MODE } from "@/lib/config/demo";
import { safeNext } from "@/lib/security/safe-redirect";
import { redirect } from "next/navigation";

export async function checkNricExists(nric: string): Promise<boolean> {
  // Demo-only. When disabled, do not act as an NRIC-existence oracle.
  if (!DEMO_MODE) return false;
  if (!isValidNric(nric)) return false;
  const hash = await hashNric(nric);
  const admin = createServiceClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("nric_hash", hash)
    .maybeSingle();
  return Boolean(data);
}

export async function mockSingpassSignIn(formData: FormData) {
  // Insecure-by-design mock auth: gated to the demo. A real deployment must use
  // a genuine identity provider (see IMPROVEMENT_PLAN.md Phase 3.1).
  if (!DEMO_MODE) {
    return {
      ok: false as const,
      error: "Mock Singpass sign-in is disabled on this deployment.",
    };
  }

  const nric = String(formData.get("nric") ?? "").trim().toUpperCase();
  // Sanitise the post-login redirect target to prevent open-redirect (CWE-601).
  const next = safeNext(String(formData.get("next") ?? "/feed"), "/feed");
  const displayName = String(formData.get("display_name") ?? "").trim() || null;

  if (!isValidNric(nric)) {
    return { ok: false as const, error: "Invalid NRIC. Check the digits and suffix letter." };
  }

  const hash = await hashNric(nric);
  const email = mockEmailForHash(hash);
  const password = mockPasswordForHash(hash);

  const admin = createServiceClient();
  const supabase = await createClient();

  // Try sign in first
  const signInRes = await supabase.auth.signInWithPassword({ email, password });

  if (signInRes.error) {
    // Create user on first encounter
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nric_hash: hash },
    });
    if (created.error && !created.error.message?.includes("already")) {
      return { ok: false as const, error: created.error.message };
    }

    // Sign in fresh
    const retry = await supabase.auth.signInWithPassword({ email, password });
    if (retry.error) {
      return { ok: false as const, error: retry.error.message };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Session not established." };

  // Ensure profile exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const prefill = MOCK_MYINFO[nric];
    const handleBase = prefill?.handle_hint ?? `user_${hash.slice(0, 6)}`;
    const handle = await uniqueHandle(handleBase);

    const { error: insertErr } = await admin.from("profiles").upsert(
      {
        id: user.id,
        handle,
        display_name: prefill?.full_name ?? displayName ?? `User ${hash.slice(0, 4)}`,
        headline: prefill?.headline ?? null,
        bio: prefill?.bio ?? null,
        role: prefill?.suggested_role ?? "freelancer",
        nric_hash: hash,
        singpass_verified_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (insertErr) {
      return { ok: false as const, error: `Profile creation failed: ${insertErr.message}` };
    }

    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  }

  // Mark identity as re-verified. NOTE: Singpass identity verification does NOT
  // imply any certificate is genuine — credentials are verified separately
  // against their issuer (see IMPROVEMENT_PLAN.md Phase 2.1). The previous bulk
  // auto-verify of all pending certs here was a forgeable trust signal (C4) and
  // has been removed.
  await admin
    .from("profiles")
    .update({ singpass_verified_at: new Date().toISOString(), nric_hash: hash })
    .eq("id", user.id);

  redirect(next);
}

async function uniqueHandle(base: string): Promise<string> {
  const admin = createServiceClient();
  const normalized = base.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24) || "user";
  let candidate = normalized;
  for (let n = 1; n <= 50; n++) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("handle", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${normalized}${n}`;
  }
  return `${normalized}_${Date.now().toString(36).slice(-4)}`;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
