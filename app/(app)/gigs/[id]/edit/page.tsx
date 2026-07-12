import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditGigForm } from "./EditGigForm";

// Convert a UTC ISO timestamp to a datetime-local value in SGT (UTC+8, no DST).
function toSgtLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return new Date(d.getTime() + 8 * 3600 * 1000).toISOString().slice(0, 16);
}

export default async function EditGigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/singpass?next=/gigs/${id}/edit`);

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, employer_id, status, title, description, skills_required, location, category, budget_cents, budget_kind, applications_close_at")
    .eq("id", id)
    .maybeSingle();
  if (!gig || gig.employer_id !== user.id) notFound();
  if (gig.status !== "open") redirect(`/gigs/${id}`);

  const { count: applicantCount } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("gig_id", id);

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "50px 28px 80px" }}>
      <Link
        href={`/gigs/${id}`}
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", textDecoration: "none", display: "inline-block", marginBottom: 28, fontWeight: 600 }}
      >
        ← Back to gig
      </Link>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", margin: "0 0 6px", letterSpacing: "-0.025em" }}>
        Edit gig
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 32px" }}>
        Changes go live immediately{(applicantCount ?? 0) > 0 ? " — current applicants see the updated posting." : "."}
      </p>

      <EditGigForm
        gigId={gig.id}
        hasApplicants={(applicantCount ?? 0) > 0}
        initial={{
          title: gig.title,
          description: gig.description,
          skills: (gig.skills_required ?? []).join(", "),
          location: gig.location ?? "",
          category: gig.category ?? "",
          budgetSgd: Math.round((gig.budget_cents ?? 0) / 100),
          budgetKind: gig.budget_kind === "hourly" ? "hourly" : "fixed",
          closeAtLocal: toSgtLocalInput(gig.applications_close_at),
        }}
      />
    </main>
  );
}
