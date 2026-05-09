import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicantActions } from "./ApplicantActions";

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_COLOR: Record<string, string> = {
  applied: "var(--color-ink-mute)",
  interviewing: "#d97706",
  shortlisted: "var(--color-jade)",
  hired: "var(--color-jade)",
  rejected: "rgba(239,68,68,0.6)",
};

export default async function MobileEmployerApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ gig?: string }>;
}) {
  const { gig: gigFilter } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/m/singpass?next=/m/employer/applicants");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "freelancer") redirect("/m/feed");

  let query = supabase
    .from("applications")
    .select(
      `id, status, created_at, cover_note,
       gigs!inner(id, title, employer_id),
       applicant:profiles!applications_applicant_id_fkey(id, handle, display_name, headline, singpass_verified_at)`,
    )
    .eq("gigs.employer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(150);

  if (gigFilter) {
    query = query.eq("gig_id", gigFilter);
  }

  const { data: apps } = await query;

  const filterGig = gigFilter
    ? await supabase.from("gigs").select("id, title").eq("id", gigFilter).single()
    : null;

  const items = apps ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "10px 16px 8px",
          borderBottom: "1px solid var(--color-line)",
          flexShrink: 0,
        }}
      >
        {gigFilter && (
          <Link
            href="/m/employer/applicants"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: "var(--color-ink-mute)",
              textDecoration: "none",
              marginBottom: 6,
            }}
          >
            ← All applicants
          </Link>
        )}
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-ink-mute)",
            margin: "0 0 4px",
            fontWeight: 600,
          }}
        >
          Employer
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            margin: 0,
            letterSpacing: "-0.025em",
            color: "var(--color-ink)",
          }}
        >
          {filterGig?.data?.title ? `"${filterGig.data.title}"` : "Applicants"}
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {items.length} total ·{" "}
          {items.filter((a) => a.status === "hired").length} hired ·{" "}
          {items.filter((a) => a.status === "applied").length} pending
        </p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        {items.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 16,
              textAlign: "center",
              padding: 32,
            }}
          >
            <div style={{ fontSize: 48 }}>👥</div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                color: "var(--color-ink)",
                margin: 0,
              }}
            >
              No applicants yet.
            </p>
            <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: 0 }}>
              Workers will appear here once they apply to your gigs.
            </p>
            <Link
              href="/m/employer/gigs"
              style={{
                padding: "12px 28px",
                borderRadius: 999,
                background: "var(--color-ink)",
                color: "var(--color-surface)",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              View my gigs →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((app) => {
              const rawGig = app.gigs as unknown as { id: string; title: string } | null;
              const rawApplicant = app.applicant as unknown as
                | { id: string; handle: string | null; display_name: string | null; headline: string | null; singpass_verified_at: string | null }
                | { id: string; handle: string | null; display_name: string | null; headline: string | null; singpass_verified_at: string | null }[]
                | null;
              const applicant = Array.isArray(rawApplicant)
                ? (rawApplicant[0] ?? null)
                : rawApplicant;

              return (
                <div
                  key={app.id}
                  style={{
                    borderRadius: 14,
                    background: "var(--color-surface-raised)",
                    border: "1px solid var(--color-line)",
                    boxShadow: "var(--shadow-soft)",
                    padding: "11px 14px",
                  }}
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: STATUS_COLOR[app.status] ?? STATUS_COLOR.applied,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: STATUS_COLOR[app.status] ?? STATUS_COLOR.applied,
                          letterSpacing: "0.02em",
                          textTransform: "capitalize",
                        }}
                      >
                        {app.status}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-ink-mute)",
                      }}
                    >
                      {timeAgo(app.created_at)}
                    </span>
                  </div>

                  {/* Applicant name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 17,
                        margin: 0,
                        letterSpacing: "-0.02em",
                        color: "var(--color-ink)",
                      }}
                    >
                      {applicant?.display_name ?? "Applicant"}
                    </p>
                    {applicant?.singpass_verified_at && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "1px 6px",
                          borderRadius: 999,
                          background: "rgba(16,185,129,0.12)",
                          color: "var(--color-jade)",
                          fontWeight: 700,
                        }}
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {applicant?.headline && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--color-ink-soft)",
                        margin: "0 0 8px",
                      }}
                    >
                      {applicant.headline}
                    </p>
                  )}

                  {!gigFilter && rawGig && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--color-ink-mute)",
                        margin: "0 0 8px",
                      }}
                    >
                      For: {rawGig.title}
                    </p>
                  )}

                  {app.cover_note && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--color-ink-soft)",
                        margin: "0 0 10px",
                        fontStyle: "italic",
                        borderLeft: "2px solid var(--color-line)",
                        paddingLeft: 8,
                      }}
                    >
                      &ldquo;{app.cover_note}&rdquo;
                    </p>
                  )}

                  {/* Actions + profile link */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <ApplicantActions applicationId={app.id} initialStatus={app.status} />
                    {applicant?.handle && (
                      <Link
                        href={`/profile/${applicant.handle}`}
                        style={{
                          fontSize: 11,
                          color: "var(--color-ink-mute)",
                          textDecoration: "none",
                        }}
                      >
                        View profile →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
