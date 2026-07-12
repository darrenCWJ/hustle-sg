import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

const UNLOCKED_STATUSES = ["shortlisted", "offered", "hired", "completed"];

export default async function MessagesInboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/messages");

  // Conversations = unlocked applications where the viewer is a party.
  // Two queries (as applicant / as employer) — RLS scopes both.
  const [asApplicant, asEmployer] = await Promise.all([
    supabase
      .from("applications")
      .select(
        `id, status, created_at,
         gigs!inner(id, title, employer_id, employer:profiles!gigs_employer_id_fkey(display_name, handle))`,
      )
      .eq("applicant_id", user.id)
      .in("status", UNLOCKED_STATUSES),
    supabase
      .from("applications")
      .select(
        `id, status, created_at,
         applicant:profiles!applications_applicant_id_fkey(display_name, handle),
         gigs!inner(id, title, employer_id)`,
      )
      .eq("gigs.employer_id", user.id)
      .in("status", UNLOCKED_STATUSES),
  ]);

  interface Conversation {
    applicationId: string;
    otherName: string;
    otherHandle: string | null;
    gigTitle: string;
    status: string;
    lastMessageAt: string | null;
    lastMessagePreview: string | null;
    unreadCount: number;
  }

  const conversations = new Map<string, Conversation>();
  for (const a of asApplicant.data ?? []) {
    const gig = a.gigs as any;
    const employer = Array.isArray(gig?.employer) ? gig.employer[0] : gig?.employer;
    conversations.set(a.id, {
      applicationId: a.id,
      otherName: employer?.display_name ?? "Employer",
      otherHandle: employer?.handle ?? null,
      gigTitle: gig?.title ?? "Gig",
      status: a.status,
      lastMessageAt: null,
      lastMessagePreview: null,
      unreadCount: 0,
    });
  }
  for (const a of asEmployer.data ?? []) {
    const applicant = Array.isArray(a.applicant) ? a.applicant[0] : (a.applicant as any);
    const gig = a.gigs as any;
    conversations.set(a.id, {
      applicationId: a.id,
      otherName: applicant?.display_name ?? "Applicant",
      otherHandle: applicant?.handle ?? null,
      gigTitle: gig?.title ?? "Gig",
      status: a.status,
      lastMessageAt: null,
      lastMessagePreview: null,
      unreadCount: 0,
    });
  }

  const appIds = Array.from(conversations.keys());
  if (appIds.length > 0) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("application_id, sender_id, body, created_at, read_at")
      .in("application_id", appIds)
      .order("created_at", { ascending: false })
      .limit(600);
    for (const m of msgs ?? []) {
      const convo = conversations.get(m.application_id);
      if (!convo) continue;
      if (!convo.lastMessageAt) {
        convo.lastMessageAt = m.created_at;
        convo.lastMessagePreview = m.body.slice(0, 90);
      }
      if (m.sender_id !== user.id && !m.read_at) convo.unreadCount += 1;
    }
  }

  const rows = Array.from(conversations.values()).sort((a, b) => {
    const at = a.lastMessageAt ?? "";
    const bt = b.lastMessageAt ?? "";
    return bt.localeCompare(at);
  });

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "50px 28px 80px" }}>
      <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
        Conversations
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
        Messages
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: "0 0 32px" }}>
        A thread opens for each application once it&apos;s shortlisted, offered or hired.
      </p>

      {rows.length === 0 ? (
        <div style={{ padding: "56px 24px", borderRadius: 20, border: "1px dashed var(--color-line)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 8px" }}>No conversations yet.</p>
          <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: 0 }}>
            When an application reaches the shortlist (or beyond), you can message the other side here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((c) => (
            <Link
              key={c.applicationId}
              href={`/messages/${c.applicationId}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                borderRadius: 16,
                border: "1px solid var(--color-line)",
                background: "var(--color-surface-raised)",
                textDecoration: "none",
                color: "var(--color-ink)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{c.otherName}</span>
                  <span style={{ fontSize: 12, color: "var(--color-ink-mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.gigTitle}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.lastMessagePreview ?? "No messages yet — start the conversation."}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: 6, flexShrink: 0 }}>
                {c.lastMessageAt && (
                  <span style={{ fontSize: 11, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>
                    {timeAgo(c.lastMessageAt)}
                  </span>
                )}
                {c.unreadCount > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, minWidth: 20, height: 20, borderRadius: 999, background: "var(--color-accent)", color: "oklch(22% 0.08 38)", display: "grid", placeItems: "center", padding: "0 6px" }}>
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
