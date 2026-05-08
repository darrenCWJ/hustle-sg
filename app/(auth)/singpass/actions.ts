"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  hashNric,
  isValidNric,
  mockEmailForHash,
  mockPasswordForHash,
} from "@/lib/singpass/nric";
import { MOCK_MYINFO } from "@/lib/singpass/mock-profiles";
import { redirect } from "next/navigation";

export async function mockSingpassSignIn(formData: FormData) {
  const nric = String(formData.get("nric") ?? "").trim().toUpperCase();
  const next = String(formData.get("next") ?? "/feed");
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
    const handleBase =
      prefill?.handle_hint ?? `user_${hash.slice(0, 6)}`;
    const handle = await uniqueHandle(handleBase);

    // Use service client to bypass RLS for initial insert
    await admin.from("profiles").insert({
      id: user.id,
      handle,
      display_name: prefill?.full_name ?? displayName ?? `User ${hash.slice(0, 4)}`,
      headline: prefill?.headline ?? null,
      bio: prefill?.bio ?? null,
      role: prefill?.suggested_role ?? "freelancer",
      nric_hash: hash,
      singpass_verified_at: new Date().toISOString(),
    });

    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  }

  // Mark as re-verified
  await admin
    .from("profiles")
    .update({ singpass_verified_at: new Date().toISOString(), nric_hash: hash })
    .eq("id", user.id);

  // Auto-verify any WSQ certs for this user via Singpass trust
  await admin
    .from("certifications")
    .update({
      verification_status: "verified",
      verification_method: "singpass",
      verified_at: new Date().toISOString(),
      verified: true,
    })
    .eq("user_id", user.id)
    .eq("kind", "wsq")
    .eq("verification_status", "pending");

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
