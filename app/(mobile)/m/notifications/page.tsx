import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const KIND_ICON: Record<string, string> = {
  application_received: "📥",
  application_status_changed: "📋",
  interview_submitted: "🎥",
  gig_filled: "✅",
  cert_verified: "🎓",
  instant_gig_accepted: "⚡",
};

export default async function MobileNotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/m/singpass?next=/m/notifications");

  const { data: notifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const items = notifs ?? [];
  const unreadCount = items.filter((n) => !n.read_at).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "10px 16px 8px",
          borderBottom: "1px solid var(--color-line)",
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
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
            Inbox
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
            Notifications
          </h1>
        </div>
        {unreadCount > 0 && (
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              background: "rgba(239,68,68,0.10)",
              color: "#dc2626",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {unreadCount} new
          </span>
        )}
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
              gap: 12,
              textAlign: "center",
              padding: 32,
            }}
          >
            <div style={{ fontSize: 48 }}>🔔</div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                color: "var(--color-ink)",
                margin: 0,
              }}
            >
              All quiet here.
            </p>
            <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: 0 }}>
              Apply to gigs to start receiving updates.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((n) => (
              <div
                key={n.id}
                style={{
                  borderRadius: 16,
                  background: "var(--color-surface-raised)",
                  border: `1px solid ${n.read_at ? "var(--color-line)" : "oklch(58% 0.13 165 / 0.3)"}`,
                  boxShadow: n.read_at ? "none" : "var(--shadow-soft)",
                  padding: "11px 14px",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>
                  {KIND_ICON[n.kind] ?? "🔔"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-ink)",
                        margin: 0,
                        lineHeight: 1.35,
                      }}
                    >
                      {n.title}
                    </p>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-ink-mute)",
                        flexShrink: 0,
                      }}
                    >
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  {n.body && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--color-ink-soft)",
                        margin: "0 0 6px",
                        lineHeight: 1.45,
                      }}
                    >
                      {n.body}
                    </p>
                  )}
                  {n.link && (
                    <Link
                      href={n.link}
                      style={{ fontSize: 12, color: "var(--color-jade)", fontWeight: 600 }}
                    >
                      View →
                    </Link>
                  )}
                </div>
                {!n.read_at && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--color-accent)",
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
