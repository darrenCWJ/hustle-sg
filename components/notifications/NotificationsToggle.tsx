"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

export function NotificationsToggle() {
  const [state, setState] = useState<"unsupported" | "denied" | "off" | "on" | "loading">("loading");

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
      if (permission !== "granted") { setState("denied"); return; }

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

  if (state === "unsupported" || state === "denied") return null;

  return (
    <button
      onClick={state === "on" ? disable : enable}
      disabled={state === "loading"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 16px",
        borderRadius: 999,
        border: "1px solid var(--color-line)",
        background: state === "on" ? "var(--color-jade-soft)" : "var(--color-surface-raised)",
        color: state === "on" ? "var(--color-jade-ink)" : "var(--color-ink-soft)",
        fontSize: 13,
        fontWeight: 600,
        cursor: state === "loading" ? "default" : "pointer",
        transition: "background 0.2s, color 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 15 }}>{state === "on" ? "🔔" : "🔕"}</span>
      {state === "loading" ? "…" : state === "on" ? "Notifications on" : "Enable notifications"}
    </button>
  );
}
