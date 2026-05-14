"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

type State = "unsupported" | "denied" | "off" | "on" | "loading" | "error";

export function NotificationsToggle() {
  const [state, setState] = useState<State>("loading");

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
    }).catch(() => setState("off"));
  }, []);

  async function enable() {
    if (!VAPID_PUBLIC) return;
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission === "denied") { setState("denied"); return; }
      if (permission !== "granted") { setState("off"); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as unknown as ArrayBuffer,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) {
        await sub.unsubscribe();
        setState("error");
        setTimeout(() => setState("off"), 3000);
        return;
      }

      setState("on");
    } catch {
      setState("error");
      setTimeout(() => setState("off"), 3000);
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

  const isOn      = state === "on";
  const isDenied  = state === "denied";
  const isError   = state === "error";
  const isLoading = state === "loading";

  let label: string;
  if (isLoading) label = "…";
  else if (isOn)     label = "Notifications on";
  else if (isDenied) label = "Notifications blocked";
  else if (isError)  label = "Failed — try again";
  else               label = "Enable notifications";

  let icon: string;
  if (isOn)     icon = "🔔";
  else if (isDenied || isError) icon = "🔕";
  else          icon = "🔕";

  let bg: string;
  if (isOn)     bg = "var(--color-jade-soft)";
  else if (isError) bg = "oklch(95% 0.04 30)";
  else          bg = "var(--color-surface-raised)";

  let fg: string;
  if (isOn)     fg = "var(--color-jade-ink)";
  else if (isError) fg = "oklch(45% 0.18 30)";
  else if (isDenied) fg = "var(--color-ink-mute)";
  else          fg = "var(--color-ink-soft)";

  return (
    <button
      onClick={isOn ? disable : isDenied ? undefined : enable}
      disabled={isLoading || isDenied}
      title={isDenied ? "Open browser settings to allow notifications" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 16px",
        borderRadius: 999,
        border: "1px solid var(--color-line)",
        background: bg,
        color: fg,
        fontSize: 13,
        fontWeight: 600,
        cursor: isLoading || isDenied ? "default" : "pointer",
        transition: "background 0.2s, color 0.2s",
        whiteSpace: "nowrap",
        opacity: isDenied ? 0.6 : 1,
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </button>
  );
}
