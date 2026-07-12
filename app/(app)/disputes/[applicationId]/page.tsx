import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DisputeForm } from "./DisputeForm";

const STATUS_LABELS: Record<string, { label: string; bg: string; fg: string; note: string }> = {
  open: {
    label: "Open",
    bg: "#fee2e2",
    fg: "#991b1b",
    note: "Received — our team will pick this up and may contact both sides.",
  },
  under_review: {
    label: "Under review",
    bg: "#fef9c3",
    fg: "#854d0e",
    note: "Our team is reviewing the case. We may contact you for more detail.",
  },
  resolved: {
    label: "Resolved",
    bg: "#dcfce7",
    fg: "#166534",
    note: "This dispute has been closed.",
  },
};

export default async function DisputePage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/singpass?next=/disputes/${applicationId}`);

  const { data: app } = await supabase
    .from("applications")
    .select("id, status, applicant_id, gigs(id, title, employer_id)")
    .eq("id", applicationId)
    .single();
  if (!app) redirect("/applications");

  const gig = app.gigs as unknown as { id: string; title: string; employer_id: string } | null;
  const isApplicant = app.applicant_id === user.id;
  const isEmployer = gig?.employer_id === user.id;
  if (!isApplicant && !isEmployer) redirect("/applications");

  // RLS scopes this to the application's parties.
  const { data: disputes } = await supabase
    .from("disputes")
    .select("id, opened_by, reason, details, status, resolution_note, created_at, resolved_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  const mine = (disputes ?? []).find((d) => d.opened_by === user.id);
  const canOpen =
    !mine && (app.status === "hired" || app.status === "completed");

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "60px 28px 80px" }}>
      <Link
        href={isEmployer ? "/applicants" : "/applications"}
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", textDecoration: "none", display: "inline-block", marginBottom: 28, fontWeight: 600 }}
      >
        ← {isEmployer ? "Applicants" : "My applications"}
      </Link>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", margin: "0 0 6px", letterSpacing: "-0.025em" }}>
        Dispute
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 32px" }}>
        For: <strong>{gig?.title ?? "Gig"}</strong>
      </p>

      {(disputes ?? []).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          {(disputes ?? []).map((d) => {
            const st = STATUS_LABELS[d.status] ?? STATUS_LABELS.open;
            return (
              <div key={d.id} style={{ padding: "20px 22px", borderRadius: 18, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999, background: st.bg, color: st.fg, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {st.label}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--color-ink-soft)", textTransform: "capitalize" }}>
                    {d.reason.replace("_", " ")}
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--color-ink-mute)", marginLeft: "auto" }}>
                    {d.opened_by === user.id ? "Opened by you" : "Opened by the other party"} ·{" "}
                    {new Date(d.created_at).toLocaleDateString("en-SG", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--color-ink)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                  {d.details}
                </p>
                {d.status === "resolved" && d.resolution_note ? (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--color-jade-ink)", lineHeight: 1.5 }}>
                    <strong>Resolution:</strong> {d.resolution_note}
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--color-ink-mute)" }}>{st.note}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canOpen && <DisputeForm applicationId={applicationId} />}

      {!canOpen && (disputes ?? []).length === 0 && (
        <div style={{ padding: "32px 24px", borderRadius: 18, border: "1px dashed var(--color-line)", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: 0 }}>
            Disputes can be opened once a gig is hired or completed.
          </p>
        </div>
      )}
    </main>
  );
}
