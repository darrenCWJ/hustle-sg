"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const UNLOCKED_STATUSES = ["shortlisted", "offered", "hired", "completed"] as const;

const messageSchema = z.object({
  applicationId: z.string().uuid(),
  body: z.string().trim().min(1, "Message can't be empty").max(2000),
});

export async function sendMessage(
  applicationId: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = messageSchema.safeParse({ applicationId, body });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid message" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  // RLS re-checks all of this at the database; the app check exists to return
  // a useful error message instead of a bare policy violation.
  const { data: app } = await supabase
    .from("applications")
    .select("id, status, applicant_id, gigs(title, employer_id)")
    .eq("id", parsed.data.applicationId)
    .single();
  if (!app) return { ok: false, error: "Conversation not found." };
  if (!UNLOCKED_STATUSES.includes(app.status as (typeof UNLOCKED_STATUSES)[number])) {
    return { ok: false, error: "Messaging unlocks once you're shortlisted or hired." };
  }

  const gig = app.gigs as unknown as { title: string; employer_id: string } | null;
  const isApplicant = app.applicant_id === user.id;
  const isEmployer = gig?.employer_id === user.id;
  if (!isApplicant && !isEmployer) return { ok: false, error: "Not your conversation." };

  const { error } = await supabase.from("messages").insert({
    application_id: parsed.data.applicationId,
    sender_id: user.id,
    body: parsed.data.body,
  });
  if (error) {
    console.error("[messages] sendMessage", error);
    return { ok: false, error: "Could not send — you may not be able to message this user." };
  }

  // Notify the recipient, throttled: skip if they were already notified about
  // this thread in the last 30 minutes and haven't read it.
  const recipientId = isEmployer ? app.applicant_id : gig!.employer_id;
  const service = createServiceClient();
  const { data: recentNotif } = await service
    .from("notifications")
    .select("id")
    .eq("user_id", recipientId)
    .eq("kind", "message_received")
    .is("read_at", null)
    .contains("data", { application_id: parsed.data.applicationId })
    .gte("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
    .limit(1);

  if (!recentNotif || recentNotif.length === 0) {
    const { data: senderProfile } = await service
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    await service.from("notifications").insert({
      user_id: recipientId,
      kind: "message_received",
      title: `New message from ${senderProfile?.display_name ?? "your contact"}`,
      body: `About "${gig?.title ?? "a gig"}": ${parsed.data.body.slice(0, 120)}`,
      link: `/messages/${parsed.data.applicationId}`,
      data: { application_id: parsed.data.applicationId },
    });
  }

  return { ok: true };
}

// Read receipts are service-role writes (messages are user-immutable), gated
// on the caller being a party to the thread.
export async function markThreadRead(applicationId: string): Promise<void> {
  if (!z.string().uuid().safeParse(applicationId).success) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: app } = await supabase
    .from("applications")
    .select("id, applicant_id, gigs(employer_id)")
    .eq("id", applicationId)
    .single();
  if (!app) return;
  const gig = app.gigs as unknown as { employer_id: string } | null;
  if (app.applicant_id !== user.id && gig?.employer_id !== user.id) return;

  const service = createServiceClient();
  await service
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("application_id", applicationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}
