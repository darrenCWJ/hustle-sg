import { createServiceClient } from "@/lib/supabase/server";

export default async function AdminErrorsPage() {
  const service = createServiceClient();

  const { data: errors } = await service
    .from("app_errors")
    .select("id, source, scope, message, stack, digest, url, created_at, reporter:profiles!app_errors_user_id_fkey(handle)")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = errors ?? [];

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
        Errors
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "var(--color-ink-soft)" }}>
        Last 100 captured errors — server captures and client error boundaries.
      </p>

      {rows.length === 0 && (
        <p style={{ fontSize: 14, color: "var(--color-ink-mute)", padding: "40px 0" }}>
          Nothing captured. Quiet is good.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((e) => {
          const reporter = Array.isArray(e.reporter) ? e.reporter[0] : e.reporter;
          return (
            <details
              key={e.id}
              style={{ border: "1px solid var(--color-line)", borderRadius: 12, padding: "12px 16px" }}
            >
              <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", listStyle: "none" }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 9px",
                    borderRadius: 999,
                    background: e.source === "server" ? "#fee2e2" : "#fef9c3",
                    color: e.source === "server" ? "#991b1b" : "#854d0e",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {e.source}
                </span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-ink-soft)" }}>
                  {e.scope}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 480 }}>
                  {e.message}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--color-ink-mute)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                  {reporter?.handle ? `@${reporter.handle} · ` : ""}
                  {new Date(e.created_at).toLocaleString("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </summary>
              <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--color-ink-soft)", display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>{e.message}</p>
                {e.url && <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>URL: {e.url}</p>}
                {e.digest && <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>Digest: {e.digest}</p>}
                {e.stack && (
                  <pre style={{ margin: 0, padding: 10, borderRadius: 8, background: "var(--color-muted)", fontSize: 11, overflowX: "auto", maxHeight: 240 }}>
                    {e.stack}
                  </pre>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}
