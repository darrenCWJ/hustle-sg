"use client";

import { useEffect } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

export function PushAutoSubscribe() {
  useEffect(() => {
    if (!VAPID_PUBLIC) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    // Consent best practice: NEVER call Notification.requestPermission() without
    // a user gesture — an un-primed prompt trains users to hit "Block" and
    // permanently loses the channel (and silently no-ops on iOS Safari). We only
    // re-sync a subscription for users who ALREADY opted in via the explicit
    // notification toggle; first-time opt-in happens there, in context.
    if (Notification.permission !== "granted") return;

    async function subscribe() {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) return; // already subscribed

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!) as unknown as ArrayBuffer,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    }

    subscribe().catch(() => {});
  }, []);

  return null;
}
