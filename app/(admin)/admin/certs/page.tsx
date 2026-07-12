import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { approveCertification, rejectCertification } from "./actions";

export default async function AdminCertsPage() {
  const service = createServiceClient();

  const { data: certs } = await service
    .from("certifications")
    .select("id, issuer, title, kind, issued_at, doc_url, extracted_skills, created_at, owner:profiles!certifications_user_id_fkey(handle, display_name)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true })
    .limit(100);

  const rows = certs ?? [];

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
        Credential verification
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "var(--color-ink-soft)", maxWidth: 640 }}>
        Approve only when the document or issuer checks out — approval grants the
        public Verified badge and feeds the ranking embedding. Every decision is
        written to the verification log.
      </p>

      {rows.length === 0 && (
        <p style={{ fontSize: 14, color: "var(--color-ink-mute)", padding: "40px 0" }}>
          Queue is clear — no certificates awaiting review.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((c) => {
          const owner = Array.isArray(c.owner) ? c.owner[0] : c.owner;
          return (
            <div
              key={c.id}
              style={{
                border: "1px solid var(--color-line)",
                borderRadius: 14,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 15 }}>{c.title}</strong>
                <span style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{c.issuer}</span>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-ink-mute)", textTransform: "uppercase" }}>
                  {c.kind}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--color-ink-mute)", marginLeft: "auto" }}>
                  {owner ? (
                    <Link href={`/profile/${owner.handle}`} style={{ color: "inherit" }}>
                      @{owner.handle}
                    </Link>
                  ) : (
                    "unknown user"
                  )}
                  {c.issued_at && ` · issued ${new Date(c.issued_at).toLocaleDateString("en-SG", { month: "short", year: "numeric" })}`}
                </span>
              </div>

              {(c.extracted_skills ?? []).length > 0 && (
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--color-ink-soft)" }}>
                  Extracted skills: {(c.extracted_skills ?? []).join(", ")}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {c.doc_url ? (
                  <a
                    href={c.doc_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-accent-ink, var(--color-ink))" }}
                  >
                    View document →
                  </a>
                ) : (
                  <span style={{ fontSize: 12.5, color: "var(--color-ink-mute)" }}>
                    No document uploaded
                  </span>
                )}
                <span style={{ flex: 1 }} />

                <form
                  action={async () => {
                    "use server";
                    await approveCertification(c.id);
                  }}
                  style={{ margin: 0 }}
                >
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 rounded-pill bg-ink text-surface font-semibold hover:bg-accent-ink transition"
                  >
                    Approve
                  </button>
                </form>

                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await rejectCertification(c.id, String(formData.get("reason") ?? ""));
                  }}
                  style={{ margin: 0, display: "flex", gap: 6, alignItems: "center" }}
                >
                  <label htmlFor={`reject-reason-${c.id}`} className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                    Rejection reason
                  </label>
                  <input
                    id={`reject-reason-${c.id}`}
                    name="reason"
                    placeholder="Reason (optional)"
                    style={{
                      fontSize: 12,
                      padding: "5px 10px",
                      borderRadius: 999,
                      border: "1px solid var(--color-line)",
                      background: "var(--color-surface)",
                      color: "var(--color-ink)",
                      width: 180,
                    }}
                  />
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 rounded-pill border border-line text-ink-soft hover:border-ink hover:text-ink transition"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
