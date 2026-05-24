"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { PROFILES } from "../data";

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeAccount, applications, getMessagesForApplication, sendMessage, getAllGigs, updateApplicationStatus } = useDemo();
  const allGigs = getAllGigs();
  const [input, setInput] = useState("");

  const appId = searchParams.get("app");

  if (!appId) {
    const relevantApps = applications.filter((a) => {
      if (activeAccount.role === "employer") return true;
      return a.freelancerId === activeAccount.id;
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            padding: "10px 16px 8px",
            borderBottom: "1px solid var(--color-line)",
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              margin: 0,
              letterSpacing: "-0.025em",
              color: "var(--color-ink)",
            }}
          >
            Messages
          </h1>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          {relevantApps.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "var(--color-ink-mute)",
                fontSize: 13,
              }}
            >
              No conversations yet. Apply to a gig to start messaging.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {relevantApps.map((app) => {
                const gig = allGigs.find((g) => g.id ===app.gigId);
                const freelancer = PROFILES.find((p) => p.id === app.freelancerId);
                const msgs = getMessagesForApplication(app.id);
                const lastMsg = msgs[msgs.length - 1];
                const otherParty =
                  activeAccount.role === "employer" ? freelancer : PROFILES[0];
                return (
                  <button
                    key={app.id}
                    onClick={() => router.push(`/quick-demo/messages?app=${app.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--color-line)",
                      background: "var(--color-surface-raised)",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--color-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--color-ink-soft)",
                        flexShrink: 0,
                      }}
                    >
                      {otherParty?.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)" }}>
                        {otherParty?.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-ink-mute)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lastMsg ? lastMsg.body : `Re: ${gig?.title}`}
                      </div>
                    </div>
                    {(msgs.length > 0 || app.status === "offered") && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: app.status === "offered" ? "#ef4444" : "var(--color-accent)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {msgs.length || 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const app = applications.find((a) => a.id === appId);
  if (!app) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--color-ink-mute)" }}>
        Conversation not found.
      </div>
    );
  }

  const gig = allGigs.find((g) => g.id ===app.gigId);
  const freelancer = PROFILES.find((p) => p.id === app.freelancerId);
  const msgs = getMessagesForApplication(appId);
  const otherParty = activeAccount.role === "employer" ? freelancer : PROFILES[0];

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(appId!, trimmed);
    setInput("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid var(--color-line)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => router.push("/quick-demo/messages")}
          style={{
            fontSize: 18,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-accent)",
            padding: "4px",
          }}
        >
          ←
        </button>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--color-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            color: "var(--color-ink-soft)",
          }}
        >
          {otherParty?.avatar}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
            {otherParty?.name}
          </div>
          <div style={{ fontSize: 10, color: "var(--color-ink-mute)" }}>
            Re: {gig?.title}
          </div>
        </div>
      </div>

      {/* Interview card — visible to freelancer when shortlisted */}
      {app.status === "shortlisted" && activeAccount.role === "freelancer" && gig && gig.questions && gig.questions.length > 0 && (
        <div style={{ margin: "10px 12px 0", padding: "14px 16px", borderRadius: 14, background: "#fef9c3", border: "1px solid #fde68a", flexShrink: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#854d0e", margin: "0 0 6px" }}>
            Interview request
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)", margin: "0 0 2px" }}>{gig.title}</p>
          <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 12px" }}>
            Record {gig.questions.length} short video answer{gig.questions.length !== 1 ? "s" : ""} to proceed with your application.
          </p>
          <button
            onClick={() => router.push(`/quick-demo/interview/${appId}`)}
            style={{ fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 999, border: "none", background: "#854d0e", color: "#fff", cursor: "pointer" }}
          >
            Complete interview →
          </button>
        </div>
      )}

      {/* Offer card — visible to freelancer when status is offered */}
      {app.status === "offered" && activeAccount.role === "freelancer" && gig && (
        <div style={{ margin: "10px 12px 0", padding: "14px 16px", borderRadius: 14, background: "var(--color-accent-soft)", border: "1px solid var(--color-accent)", flexShrink: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent-ink)", margin: "0 0 6px" }}>
            Direct invite
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)", margin: "0 0 2px" }}>{gig.title}</p>
          <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 12px" }}>
            {gig.budget}{gig.location ? ` · ${gig.location}` : ""}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => router.push(`/quick-demo/gig/${gig.id}`)}
              style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 999, border: "1px solid var(--color-accent)", background: "transparent", color: "var(--color-accent-ink)", cursor: "pointer" }}
            >
              View listing →
            </button>
            <button
              onClick={() => {
                updateApplicationStatus(app.id, "applied");
                router.push(`/quick-demo/gig/${gig.id}`);
              }}
              style={{ fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 999, border: "none", background: "var(--color-ink)", color: "var(--color-surface)", cursor: "pointer" }}
            >
              Accept & apply
            </button>
            <button
              onClick={() => updateApplicationStatus(app.id, "rejected")}
              style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-ink-mute)", cursor: "pointer" }}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {msgs.length === 0 && (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: "var(--color-ink-mute)",
              fontSize: 12,
            }}
          >
            No messages yet. Start the conversation!
          </div>
        )}
        {msgs.map((msg) => {
          const isMine = msg.senderId === activeAccount.id;
          const sender = PROFILES.find((p) => p.id === msg.senderId);
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMine ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: isMine ? "var(--color-accent)" : "var(--color-muted)",
                  color: isMine ? "#fff" : "var(--color-ink)",
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                {msg.body}
              </div>
              <span
                style={{
                  fontSize: 9,
                  color: "var(--color-ink-mute)",
                  marginTop: 2,
                  padding: "0 4px",
                }}
              >
                {sender?.name} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: "8px 12px",
          borderTop: "1px solid var(--color-line)",
          display: "flex",
          gap: 8,
          flexShrink: 0,
          background: "var(--color-surface-raised)",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 20,
            border: "1px solid var(--color-line)",
            background: "var(--color-surface)",
            fontSize: 13,
            outline: "none",
            color: "var(--color-ink)",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            padding: "8px 14px",
            borderRadius: 20,
            border: "none",
            background: input.trim() ? "var(--color-accent)" : "var(--color-muted)",
            color: input.trim() ? "#fff" : "var(--color-ink-mute)",
            fontWeight: 700,
            fontSize: 12,
            cursor: input.trim() ? "pointer" : "default",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function DemoMessagesPage() {
  return (
    <Suspense>
      <MessagesContent />
    </Suspense>
  );
}
