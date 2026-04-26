import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { markAllRead } from "./actions";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/notifications");

  const { data: notifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const items = notifs ?? [];
  const unread = items.filter((n) => !n.read_at);

  const kindIcon: Record<string, string> = {
    application_received: "📥",
    application_status_changed: "📋",
    interview_submitted: "🎥",
    gig_filled: "✅",
    cert_verified: "🎓",
    instant_gig_accepted: "⚡",
  };

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-soft">Inbox</p>
          <h1 className="font-display text-display-md mt-1">Notifications</h1>
        </div>
        {unread.length > 0 && (
          <form action={markAllRead}>
            <button
              type="submit"
              className="text-xs font-semibold px-4 py-2 rounded-pill border border-line text-ink-soft hover:text-ink"
            >
              Mark all read
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-card border border-line p-12 text-center">
          <p className="font-display text-2xl mb-2">All caught up.</p>
          <p className="text-sm text-ink-soft">You have no notifications yet. Apply to gigs or post one to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className="rounded-card border p-4 flex gap-4 items-start"
              style={{
                background: n.read_at ? "var(--color-surface-raised)" : "var(--color-surface)",
                borderColor: n.read_at ? "var(--color-line)" : "var(--color-jade)",
              }}
            >
              <span className="text-xl mt-0.5 flex-shrink-0">
                {kindIcon[n.kind] ?? "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-semibold text-sm leading-snug">{n.title}</p>
                  <span className="text-[10px] font-mono text-ink-mute whitespace-nowrap flex-shrink-0">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                {n.body && (
                  <p className="text-sm text-ink-soft mt-1 leading-relaxed">{n.body}</p>
                )}
                {n.link && (
                  <Link
                    href={n.link}
                    className="text-xs font-semibold mt-2 inline-block"
                    style={{ color: "var(--color-jade-ink)" }}
                  >
                    View →
                  </Link>
                )}
              </div>
              {!n.read_at && (
                <span
                  className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full"
                  style={{ background: "var(--color-jade)" }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
