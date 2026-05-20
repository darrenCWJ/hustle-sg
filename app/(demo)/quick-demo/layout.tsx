"use client";

import { DemoProvider, useDemo } from "./DemoProvider";
import { DemoTabBar } from "./components/DemoTabBar";
import { PROFILES } from "./data";
import { useRouter } from "next/navigation";

function AccountSwitcher() {
  const { activeAccountId, switchAccount, resetDemo, activeAccount } = useDemo();
  const router = useRouter();

  function handleSwitch(id: string) {
    switchAccount(id);
    const profile = PROFILES.find((p) => p.id === id);
    if (profile?.role === "employer") {
      router.push("/quick-demo/dashboard");
    } else {
      router.push("/quick-demo/feed");
    }
  }

  if (!activeAccountId) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "var(--color-surface-raised)",
        borderBottom: "1px solid var(--color-line)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
          marginRight: 4,
        }}
      >
        DEMO
      </span>

      <div style={{ display: "flex", gap: 6, flex: 1 }}>
        {PROFILES.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSwitch(p.id)}
            title={`${p.name} (${p.specialization ?? p.role})`}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: activeAccountId === p.id
                ? "2px solid var(--color-accent)"
                : "2px solid var(--color-line)",
              background: activeAccountId === p.id
                ? "var(--color-accent-soft)"
                : "var(--color-muted)",
              color: activeAccountId === p.id
                ? "var(--color-accent-ink)"
                : "var(--color-ink-mute)",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            {p.avatar}
          </button>
        ))}
      </div>

      <span
        style={{
          fontSize: 11,
          color: "var(--color-ink-soft)",
          marginRight: 8,
          whiteSpace: "nowrap",
        }}
      >
        {activeAccount.name}
      </span>

      <button
        onClick={resetDemo}
        style={{
          fontSize: 10,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 6,
          border: "1px solid var(--color-line)",
          background: "transparent",
          color: "var(--color-ink-mute)",
          cursor: "pointer",
        }}
      >
        Reset
      </button>
    </div>
  );
}

function DemoShell({ children }: { children: React.ReactNode }) {
  const { activeAccountId } = useDemo();

  if (!activeAccountId) {
    return <>{children}</>;
  }

  return (
    <>
      <AccountSwitcher />
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {children}
      </div>
      <DemoTabBar />
    </>
  );
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <div
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-surface)",
          color: "var(--color-ink)",
          overflow: "hidden",
          maxWidth: 430,
          margin: "0 auto",
          boxShadow: "0 0 0 1px var(--color-line)",
        }}
      >
        <DemoShell>{children}</DemoShell>
      </div>
    </DemoProvider>
  );
}
