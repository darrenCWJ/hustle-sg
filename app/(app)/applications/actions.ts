"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function respondToOffer(appId: string, accept: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Verify caller is the applicant and status is still 'offered'
  const { data: app } = await supabase
    .from("applications")
    .select(
      `id, gig_id,
       gigs(title, employer_id)`,
    )
    .eq("id", appId)
    .eq("applicant_id", user.id)
    .eq("status", "offered")
    .single();

  if (!app) return;

  await supabase
    .from("applications")
    .update({ status: accept ? "hired" : "rejected" })
    .eq("id", appId);

  const gig = app.gigs as any;
  if (gig?.employer_id) {
    const { data: workerProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const workerName = workerProfile?.display_name ?? "The worker";
    const service = createServiceClient();
    await service.from("notifications").insert({
      user_id: gig.employer_id,
      kind: "application_status_changed",
      title: accept
        ? `${workerName} accepted your direct offer for "${gig.title}"`
        : `${workerName} declined your direct offer for "${gig.title}"`,
      body: accept
        ? "Visit your applicants to review."
        : "You may want to send an offer to another worker.",
      link: "/applicants",
      data: { application_id: appId, gig_id: app.gig_id },
    });
  }

  revalidatePath("/applications");
}

export async function acceptOffer(appId: string): Promise<void> {
  return respondToOffer(appId, true);
}

export async function declineOffer(appId: string): Promise<void> {
  return respondToOffer(appId, false);
}

// Freelancers can leave a pipeline they're no longer interested in
// (IMPROVEMENT_PLAN.md Phase 3.4) instead of ghosting the employer.
export async function withdrawApplication(appId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: app } = await supabase
    .from("applications")
    .select("id, gig_id, status, gigs(title, employer_id)")
    .eq("id", appId)
    .eq("applicant_id", user.id)
    .in("status", ["applied", "interviewing", "shortlisted", "offered"])
    .single();
  if (!app) return;

  const { error } = await supabase
    .from("applications")
    .update({ status: "withdrawn" })
    .eq("id", appId);
  if (error) {
    console.error("[applications] withdrawApplication", error);
    return;
  }

  const gig = app.gigs as unknown as { title: string; employer_id: string } | null;
  if (gig?.employer_id) {
    const { data: workerProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const service = createServiceClient();
    await service.from("notifications").insert({
      user_id: gig.employer_id,
      kind: "application_status_changed",
      title: `${workerProfile?.display_name ?? "An applicant"} withdrew from "${gig.title}"`,
      body: "They're no longer in the running — you may want to review other applicants.",
      link: "/applicants",
      data: { application_id: appId, gig_id: app.gig_id },
    });
  }

  revalidatePath("/applications");
}
