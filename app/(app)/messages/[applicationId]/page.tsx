import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markThreadRead } from "@/app/actions/messages";
import { MessageThread, type ThreadMessage } from "./MessageThread";

const UNLOCKED_STATUSES = ["shortlisted", "offered", "hired", "completed"];

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/singpass?next=/messages/${applicationId}`);

  const { data: app } = await supabase
    .from("applications")
    .select(
      `id, status, applicant_id,
       applicant:profiles!applications_applicant_id_fkey(id, display_name, handle),
       gigs(id, title, employer_id, employer:profiles!gigs_employer_id_fkey(id, display_name, handle))`,
    )
    .eq("id", applicationId)
    .single();
  if (!app) redirect("/messages");

  const gig = app.gigs as any;
  const isApplicant = app.applicant_id === user.id;
  const isEmployer = gig?.employer_id === user.id;
  if (!isApplicant && !isEmployer) redirect("/messages");

  const other = isEmployer ? (app.applicant as any) : gig?.employer;
  const canSend = UNLOCKED_STATUSES.includes(app.status);

  // RLS scopes the rows; opening the thread marks the counterpart's messages read.
  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true })
    .limit(500);
  await markThreadRead(applicationId);

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "40px 28px 80px" }}>
      <Link
        href="/messages"
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", textDecoration: "none", display: "inline-block", marginBottom: 24, fontWeight: 600 }}
      >
        ← All messages
      </Link>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: 0, letterSpacing: "-0.025em" }}>
          {other?.display_name ?? "Conversation"}
        </h1>
        {other?.handle && (
          <Link href={`/profile/${other.handle}`} style={{ fontSize: 12.5, color: "var(--color-ink-soft)", fontFamily: "var(--font-mono)" }}>
            @{other.handle}
          </Link>
        )}
      </div>
      <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: "0 0 24px" }}>
        {gig?.id ? (
          <>
            About: <Link href={`/gigs/${gig.id}`} style={{ color: "inherit", fontWeight: 600 }}>{gig.title}</Link>
          </>
        ) : (
          "Gig conversation"
        )}
      </p>

      <MessageThread
        applicationId={applicationId}
        viewerId={user.id}
        otherName={other?.display_name?.split(" ")[0] ?? "them"}
        canSend={canSend}
        initialMessages={(messages ?? []) as ThreadMessage[]}
      />
    </main>
  );
}
