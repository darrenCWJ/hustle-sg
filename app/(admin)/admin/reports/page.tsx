import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { updateReportStatus } from "./actions";

const STATUS_ORDER = ["open", "under_review", "resolved", "dismissed"] as const;

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  open: { bg: "#fee2e2", fg: "#991b1b" },
  under_review: { bg: "#fef9c3", fg: "#854d0e" },
  resolved: { bg: "#dcfce7", fg: "#166534" },
  dismissed: { bg: "var(--color-muted)", fg: "var(--color-ink-mute)" },
};

export default async function AdminReportsPage() {
  const service = createServiceClient();

  const { data: reports } = await service
    .from("reports")
    .select("id, target_kind, target_id, reason, details, status, created_at, reporter:profiles!reports_reporter_id_fkey(handle, display_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (reports ?? []).slice().sort(
    (a, b) => STATUS_ORDER.indexOf(a.status as (typeof STATUS_ORDER)[number]) - STATUS_ORDER.indexOf(b.status as (typeof STATUS_ORDER)[number]),
  );

  // Resolve user targets to handles so the row links somewhere useful.
  const userTargetIds = rows.filter((r) => r.target_kind === "user").map((r) => r.target_id);
  const { data: targetProfiles } = userTargetIds.length
    ? await service.from("profiles").select("id, handle").in("id", userTargetIds)
    : { data: [] as Array<{ id: string; handle: string }> };
  const handleById = new Map((targetProfiles ?? []).map((p) => [p.id, p.handle]));

  function targetLink(r: { target_kind: string; target_id: string }): { href: string | null; label: string } {
    if (r.target_kind === "gig") return { href: `/gigs/${r.target_id}`, label: "View gig" };
    if (r.target_kind === "user") {
      const handle = handleById.get(r.target_id);
      return handle
        ? { href: `/profile/${handle}`, label: `@${handle}` }
        : { href: null, label: "User (deleted)" };
    }
    return { href: null, label: `Rating ${r.target_id.slice(0, 8)}…` };
  }

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
        Reports
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "var(--color-ink-soft)" }}>
        One row per reporter/target. Resolve when acted on, dismiss when unfounded.
      </p>

      {rows.length === 0 && (
        <p style={{ fontSize: 14, color: "var(--color-ink-mute)", padding: "40px 0" }}>
          No reports yet. When users flag a profile, gig or review it lands here.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((r) => {
          const st = STATUS_STYLES[r.status] ?? STATUS_STYLES.open;
          const target = targetLink(r);
          const reporter = Array.isArray(r.reporter) ? r.reporter[0] : r.reporter;
          return (
            <div
              key={r.id}
              style={{
                border: "1px solid var(--color-line)",
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: 999,
                    background: st.bg,
                    color: st.fg,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {r.status.replace("_", " ")}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
                  {r.target_kind}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>
                  reason: <strong>{r.reason.replace("_", " ")}</strong>
                </span>
                <span style={{ fontSize: 11.5, color: "var(--color-ink-mute)", marginLeft: "auto" }}>
                  by @{reporter?.handle ?? "unknown"} ·{" "}
                  {new Date(r.created_at).toLocaleString("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {r.details && (
                <p style={{ margin: 0, fontSize: 13.5, color: "var(--color-ink)", whiteSpace: "pre-wrap" }}>
                  {r.details}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {target.href ? (
                  <Link href={target.href} style={{ fontSize: 12.5, color: "var(--color-accent-ink, var(--color-ink))", fontWeight: 600 }}>
                    {target.label} →
                  </Link>
                ) : (
                  <span style={{ fontSize: 12.5, color: "var(--color-ink-mute)" }}>{target.label}</span>
                )}
                <span style={{ flex: 1 }} />
                {r.status !== "under_review" && r.status !== "resolved" && (
                  <TriageButton reportId={r.id} status="under_review" label="Start review" />
                )}
                {r.status !== "resolved" && (
                  <TriageButton reportId={r.id} status="resolved" label="Resolve" />
                )}
                {r.status === "open" && (
                  <TriageButton reportId={r.id} status="dismissed" label="Dismiss" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TriageButton({ reportId, status, label }: { reportId: string; status: string; label: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await updateReportStatus(reportId, status);
      }}
      style={{ margin: 0 }}
    >
      <button
        type="submit"
        className="text-xs px-3 py-1.5 rounded-pill border border-line text-ink-soft hover:border-ink hover:text-ink transition"
      >
        {label}
      </button>
    </form>
  );
}
