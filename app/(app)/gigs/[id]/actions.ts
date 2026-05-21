"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function applyToGig(gigId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/singpass?next=/gigs/${gigId}`);

  // Guard: reject if gig is closed or past its application deadline.
  const { data: gigMeta } = await supabase
    .from("gigs")
    .select("status, applications_close_at")
    .eq("id", gigId)
    .single();
  if (!gigMeta || gigMeta.status !== "open") return;
  if (gigMeta.applications_close_at && new Date(gigMeta.applications_close_at) < new Date()) return;

  const cover = String(formData.get("cover_note") ?? "").slice(0, 2000);

  const { data: app, error } = await supabase
    .from("applications")
    .insert({
      gig_id: gigId,
      applicant_id: user.id,
      cover_note: cover || null,
      status: "applied",
    })
    .select("id")
    .single();
  if (error || !app) return;

  // Notify employer via service client (bypasses RLS)
  const service = createServiceClient();
  const { data: gig } = await service
    .from("gigs")
    .select("employer_id, title, profiles!gigs_employer_id_fkey(display_name)")
    .eq("id", gigId)
    .single();
  const applicantProfile = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();
  const applicantName = applicantProfile.data?.display_name ?? "Someone";
  if (gig?.employer_id) {
    await service.from("notifications").insert({
      user_id: gig.employer_id,
      kind: "application_received",
      title: `${applicantName} applied for "${gig.title}"`,
      body: "Review their profile and async video responses.",
      link: `/interviews/${app.id}`,
      data: { application_id: app.id, gig_id: gigId },
    });
  }

  // Check if interviews exist → route to record flow
  const { data: qs } = await supabase
    .from("interview_questions")
    .select("id")
    .eq("gig_id", gigId)
    .limit(1);

  if (qs && qs.length > 0) {
    redirect(`/interviews/${app.id}`);
  }
  redirect(`/gigs/${gigId}`);
}

export async function closeGig(gigId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  // Verify caller is the gig's employer
  const { data: gig } = await supabase
    .from("gigs")
    .select("employer_id, status")
    .eq("id", gigId)
    .single();
  if (!gig || gig.employer_id !== user.id) return { ok: false as const, error: "Not authorised" };
  if (gig.status !== "open") return { ok: false as const, error: "Gig is already closed" };

  const service = createServiceClient();

  // Mark gig as filled
  await service.from("gigs").update({ status: "filled" }).eq("id", gigId);

  // Reject all still-pending applications (applied / interviewing / offered)
  await service
    .from("applications")
    .update({ status: "rejected" })
    .eq("gig_id", gigId)
    .in("status", ["applied", "interviewing", "offered"]);

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/applicants");
  revalidatePath(`/gigs/${gigId}`);

  return { ok: true as const };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "interviewing" | "shortlisted" | "offered" | "hired" | "rejected",
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  // Only the gig's employer may change application status.
  const { data: app } = await supabase
    .from("applications")
    .select("id, gigs!inner(employer_id)")
    .eq("id", applicationId)
    .single();

  const employerId = (app?.gigs as any)?.employer_id;
  if (!app || employerId !== user.id) return { ok: false as const, error: "Not authorised" };

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) return { ok: false as const, error: error.message };

  // Auto-close gig when all slots filled
  if (status === "hired") {
    const { data: appWithGig } = await supabase
      .from("applications")
      .select("gig_id, gigs!inner(id, headcount, status)")
      .eq("id", applicationId)
      .single();
    const gigId = (appWithGig?.gigs as any)?.id;
    const headcount = (appWithGig?.gigs as any)?.headcount ?? 1;
    const gigStatus = (appWithGig?.gigs as any)?.status;
    if (gigId && gigStatus === "open") {
      const { count: hiredCount } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("gig_id", gigId)
        .eq("status", "hired");
      if (hiredCount !== null && hiredCount >= headcount) {
        const service = createServiceClient();
        await service.from("gigs").update({ status: "filled" }).eq("id", gigId);
        await service
          .from("applications")
          .update({ status: "rejected" })
          .eq("gig_id", gigId)
          .in("status", ["applied", "interviewing", "offered"]);
      }
    }
  }

  // Notify the applicant of the status change.
  const statusMessages: Record<string, { title: string; body: string }> = {
    interviewing: {
      title: "You've been shortlisted!",
      body: "The employer wants to see your async interview responses.",
    },
    shortlisted: {
      title: "You've been shortlisted!",
      body: "Great news — you've made it to the next round.",
    },
    offered: {
      title: "You received an offer!",
      body: "The employer has sent you a direct offer. Check your application.",
    },
    hired: {
      title: "You got the gig!",
      body: "Congratulations — the employer has confirmed you for this role.",
    },
    rejected: {
      title: "Application update",
      body: "The employer has moved forward with other candidates.",
    },
  };

  const msg = statusMessages[status];
  if (msg) {
    const service = createServiceClient();

    // Fetch the applicant_id and gig title in one query.
    const { data: appRow } = await service
      .from("applications")
      .select("applicant_id, gigs(id, title)")
      .eq("id", applicationId)
      .single();

    if (appRow?.applicant_id) {
      const gigTitle = (appRow.gigs as any)?.title ?? "your gig";
      const gigId = (appRow.gigs as any)?.id;
      await service.from("notifications").insert({
        user_id: appRow.applicant_id,
        kind: "application_status_changed",
        title: msg.title,
        body: `${msg.body} — "${gigTitle}"`,
        link: gigId ? `/gigs/${gigId}` : "/applications",
        data: { application_id: applicationId, status },
      });
    }
  }

  return { ok: true as const };
}
