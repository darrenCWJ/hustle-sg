"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/app/actions/messages";

export interface ThreadMessage {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface MessageThreadProps {
  applicationId: string;
  viewerId: string;
  otherName: string;
  canSend: boolean;
  initialMessages: ThreadMessage[];
}

export function MessageThread({
  applicationId,
  viewerId,
  otherName,
  canSend,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Live updates: Realtime postgres_changes respects RLS, so we only ever
  // receive rows this viewer is allowed to see.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${applicationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `application_id=eq.${applicationId}`,
        },
        (payload) => {
          const row = payload.new as ThreadMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, row],
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    setError(null);
    setDraft("");
    // Optimistic append; the realtime echo is deduped by id, and the temp row
    // is replaced on refresh. Failure restores the draft.
    const tempId = `temp-${messages.length}-${body.length}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, sender_id: viewerId, body, created_at: new Date().toISOString() },
    ]);
    startTransition(async () => {
      const res = await sendMessage(applicationId, body);
      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setDraft(body);
        setError(res.error ?? "Could not send.");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--color-line)", borderRadius: 20, overflow: "hidden" }}>
      <div style={{ maxHeight: "52vh", minHeight: 240, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10, background: "var(--color-surface)" }}>
        {messages.length === 0 && (
          <p style={{ fontSize: 13.5, color: "var(--color-ink-mute)", textAlign: "center", margin: "auto 0" }}>
            No messages yet — say hello to {otherName}.
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.sender_id === viewerId;
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isMine ? "flex-end" : "flex-start",
                maxWidth: "78%",
                padding: "9px 14px",
                borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: isMine ? "var(--color-ink)" : "var(--color-muted)",
                color: isMine ? "var(--color-surface)" : "var(--color-ink)",
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
              }}
            >
              {m.body}
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  marginTop: 4,
                  opacity: 0.6,
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {new Date(m.created_at).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ borderTop: "1px solid var(--color-line)", padding: 12, background: "var(--color-surface-raised)" }}>
        {canSend ? (
          <>
            {error && <p style={{ fontSize: 12.5, color: "#dc2626", margin: "0 0 8px" }}>{error}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <label htmlFor="message-draft" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Message {otherName}
              </label>
              <textarea
                id="message-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={2}
                placeholder={`Message ${otherName}… (Enter to send)`}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink)", fontSize: 14, resize: "none", fontFamily: "inherit" }}
              />
              <button
                type="button"
                onClick={submit}
                disabled={pending || !draft.trim()}
                style={{
                  padding: "0 20px",
                  borderRadius: 12,
                  border: "none",
                  background: draft.trim() && !pending ? "var(--color-ink)" : "var(--color-muted)",
                  color: draft.trim() && !pending ? "var(--color-surface)" : "var(--color-ink-mute)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: draft.trim() && !pending ? "pointer" : "default",
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 12.5, color: "var(--color-ink-mute)", margin: 0, textAlign: "center" }}>
            Messaging unlocks once the application is shortlisted, offered or hired.
          </p>
        )}
      </div>
    </div>
  );
}
