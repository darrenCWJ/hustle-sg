"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

export function MobilePushToggle() {
  const [state, setState] = useState<"unsupported" | "denied" | "off" | "on" | "loading">(
    "loading",
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    });
  }, []);

  async function enable() {
    if (!VAPID_PUBLIC) return;
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as unknown as ArrayBuffer,
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setState("on");
    } catch {
      setState("off");
    }
  }

  async function disable() {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("on");
    }
  }

  if (state === "unsupported") return null;

  if (state === "denied") {
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.18)",
          fontSize: 13,
          color: "rgba(220,38,38,0.9)",
        }}
      >
        Notifications blocked in browser settings. Enable them to receive gig alerts.
      </div>
    );
  }

  const isOn = state === "on";
  const isLoading = state === "loading";

  return (
    <button
      onClick={isOn ? disable : enable}
      disabled={isLoading}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "14px 18px",
        borderRadius: 14,
        background: isOn ? "var(--color-jade-soft)" : "var(--color-muted)",
        border: `1px solid ${isOn ? "oklch(58% 0.13 165 / 0.3)" : "var(--color-line)"}`,
        color: isOn ? "var(--color-jade-ink)" : "var(--color-ink-soft)",
        fontSize: 14,
        fontWeight: 600,
        cursor: isLoading ? "default" : "pointer",
        textAlign: "left",
        transition: "all 0.2s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>{isOn ? "🔔" : "🔕"}</span>
        {isLoading
          ? "Please wait…"
          : isOn
            ? "Gig alerts enabled"
            : "Enable gig alerts"}
      </span>
      {/* Toggle pill */}
      <span
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          background: isOn ? "var(--color-jade)" : "var(--color-line)",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: isOn ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </span>
    </button>
  );
}
