import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { startDisputeReview, resolveDispute } from "./actions";

const STATUS_ORDER = ["open", "under_review", "resolved"] as const;

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  open: { bg: "#fee2e2", fg: "#991b1b" },
  under_review: { bg: "#fef9c3", fg: "#854d0e" },
  resolved: { bg: "#dcfce7", fg: "#166534" },
};

export default async function AdminDisputesPage() {
  const service = createServiceClient();

  const { data: disputes } = await service
    .from("disputes")
    .select(
      `id, reason, details, status, resolution_note, created_at,
       opener:profiles!disputes_opened_by_fkey(handle, display_name),
       application:applications!disputes_application_id_fkey(
         id, applicant_id,
         applicant:profiles!applications_applicant_id_fkey(handle, display_name),
         gigs(id, title, employer_id, employer:profiles!gigs_employer_id_fkey(handle, display_name))
       )`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (disputes ?? []).slice().sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status as (typeof STATUS_ORDER)[number]) -
      STATUS_ORDER.indexOf(b.status as (typeof STATUS_ORDER)[number]),
  );

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
        Disputes
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "var(--color-ink-soft)" }}>
        open → under review → resolved. Resolving notifies both parties with your note.
      </p>

      {rows.length === 0 && (
        <p style={{ fontSize: 14, color: "var(--color-ink-mute)", padding: "40px 0" }}>
          No disputes. When a party flags a hired or completed gig it lands here.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((d) => {
          const st = STATUS_STYLES[d.status] ?? STATUS_STYLES.open;
          const opener = Array.isArray(d.opener) ? d.opener[0] : d.opener;
          const application = Array.isArray(d.application) ? d.application[0] : d.application;
          const gig = application
            ? ((Array.isArray(application.gigs) ? application.gigs[0] : application.gigs) as {
                id: string;
                title: string;
                employer: { handle: string; display_name: string } | Array<{ handle: string; display_name: string }>;
              } | null)
            : null;
          const applicant = application
            ? (Array.isArray(application.applicant) ? application.applicant[0] : application.applicant)
            : null;
          const employer = gig ? (Array.isArray(gig.employer) ? gig.employer[0] : gig.employer) : null;

          return (
            <div
              key={d.id}
              style={{ border: "1px solid var(--color-line)", borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999, background: st.bg, color: st.fg, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {d.status.replace("_", " ")}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, textTransform: "capitalize" }}>
                  {d.reason.replace("_", " ")}
                </span>
                {gig && (
                  <Link href={`/gigs/${gig.id}`} style={{ fontSize: 12.5, color: "var(--color-ink-soft)" }}>
                    {gig.title} →
                  </Link>
                )}
                <span style={{ fontSize: 11.5, color: "var(--color-ink-mute)", marginLeft: "auto" }}>
                  opened by @{opener?.handle ?? "unknown"} ·{" "}
                  {new Date(d.created_at).toLocaleString("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{d.details}</p>

              <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-mute)" }}>
                Parties: freelancer @{applicant?.handle ?? "?"} · employer @{employer?.handle ?? "?"}
              </p>

              {d.status === "resolved" ? (
                d.resolution_note && (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--color-jade-ink)" }}>
                    <strong>Resolution:</strong> {d.resolution_note}
                  </p>
                )
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {d.status === "open" && (
                    <form
                      action={async () => {
                        "use server";
                        await startDisputeReview(d.id);
                      }}
                      style={{ margin: 0 }}
                    >
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 rounded-pill border border-line text-ink-soft hover:border-ink hover:text-ink transition"
                      >
                        Start review
                      </button>
                    </form>
                  )}
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await resolveDispute(d.id, String(formData.get("note") ?? ""));
                    }}
                    style={{ margin: 0, display: "flex", gap: 6, alignItems: "center", flex: 1, minWidth: 280 }}
                  >
                    <label
                      htmlFor={`resolution-${d.id}`}
                      style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
                    >
                      Resolution note
                    </label>
                    <input
                      id={`resolution-${d.id}`}
                      name="note"
                      placeholder="Resolution note (sent to both parties)"
                      style={{ flex: 1, fontSize: 12, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink)" }}
                    />
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 rounded-pill bg-ink text-surface font-semibold hover:bg-accent-ink transition"
                    >
                      Resolve
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
