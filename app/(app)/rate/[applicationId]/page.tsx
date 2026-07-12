import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RateForm } from "./RateForm";

export default async function RatePage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/singpass?next=/rate/${applicationId}`);

  const { data: app } = await supabase
    .from("applications")
    .select(
      `id, status, applicant_id,
       applicant:profiles!applications_applicant_id_fkey(id, display_name, handle),
       gigs(id, title, employer_id, employer:profiles!gigs_employer_id_fkey(id, display_name, handle))`,
    )
    .eq("id", applicationId)
    .single();

  if (!app || app.status !== "completed") redirect("/applications");

  const gig = app.gigs as any;
  const isApplicant = app.applicant_id === user.id;
  const isEmployer = gig?.employer_id === user.id;
  if (!isApplicant && !isEmployer) redirect("/applications");

  // Check if already rated
  const { data: existing } = await supabase
    .from("ratings")
    .select("id, stars, review")
    .eq("application_id", applicationId)
    .eq("from_id", user.id)
    .maybeSingle();

  // Double-blind reveal state: the counterparty's rating only passes RLS once
  // both sides have rated (or after 14 days) — visibility IS the reveal signal.
  let counterpartRated = false;
  if (existing) {
    const { data: counterpart } = await supabase
      .from("ratings")
      .select("id")
      .eq("application_id", applicationId)
      .neq("from_id", user.id)
      .maybeSingle();
    counterpartRated = Boolean(counterpart);
  }

  const ratee = isEmployer ? (app.applicant as any) : gig?.employer;
  const gigTitle = gig?.title ?? "Gig";

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "60px 28px 80px" }}>
      <a
        href={isEmployer ? "/applicants" : "/applications"}
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", textDecoration: "none", display: "inline-block", marginBottom: 28, fontWeight: 600 }}
      >
        ← {isEmployer ? "Applicants" : "My applications"}
      </a>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", margin: "0 0 6px", letterSpacing: "-0.025em" }}>
        Leave a review
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 32px" }}>
        For: <strong>{gigTitle}</strong>
      </p>

      {existing ? (
        <div style={{ padding: 28, borderRadius: 20, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 8px" }}>Already reviewed</h2>
          <div style={{ color: "#f59e0b", fontSize: 22, marginBottom: 10 }}>
            {"★".repeat(existing.stars)}{"☆".repeat(5 - existing.stars)}
          </div>
          <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.55 }}>{existing.review}</p>
          <p style={{ fontSize: 12.5, color: "var(--color-ink-mute)", margin: "14px 0 0", lineHeight: 1.5 }}>
            {counterpartRated
              ? "Both reviews are in — they're now visible on each other's profiles."
              : `Your review stays hidden until ${ratee?.display_name ?? "the other party"} submits theirs, or 14 days pass.`}
          </p>
        </div>
      ) : (
        <RateForm
          applicationId={applicationId}
          rateeName={ratee?.display_name ?? "User"}
          rateeHandle={ratee?.handle}
          isEmployer={isEmployer}
        />
      )}
    </main>
  );
}
