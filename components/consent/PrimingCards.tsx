"use client";

import { useEffect, useState } from "react";
import { saveLocation } from "@/app/(app)/profile/edit/actions";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

const DISMISS_KEY = "hustle-priming-dismissed";

function loadDismissed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function dismiss(kind: string) {
  const next = loadDismissed();
  next.add(kind);
  localStorage.setItem(DISMISS_KEY, JSON.stringify([...next]));
}

interface PrimingCardsProps {
  hasLocation: boolean;
}

/**
 * Contextual consent priming (IMPROVEMENT_PLAN.md Phase 5.1). The OS
 * permission prompts for geolocation and push fire ONLY from these explicit,
 * user-tapped cards — never silently on page load. Each card explains what
 * the permission buys before asking, and is dismissible for good.
 */
export function PrimingCards({ hasLocation }: PrimingCardsProps) {
  const [showLocation, setShowLocation] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [busy, setBusy] = useState<"geo" | "push" | null>(null);

  useEffect(() => {
    const dismissed = loadDismissed();

    if (!hasLocation && !dismissed.has("geo") && navigator.geolocation && navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          // 'granted' is handled passively by GeolocationCapture; 'denied' is
          // the user's answer — don't nag. Only 'prompt' gets a card.
          if (status.state === "prompt") setShowLocation(true);
        })
        .catch(() => {});
    }

    if (
      VAPID_PUBLIC &&
      !dismissed.has("push") &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      Notification.permission === "default"
    ) {
      setShowPush(true);
    }
  }, [hasLocation]);

  const enableLocation = () => {
    setBusy("geo");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveLocation(pos.coords.latitude, pos.coords.longitude)
          .catch((err) => console.error("[consent] saveLocation", err))
          .finally(() => {
            setShowLocation(false);
            setBusy(null);
          });
      },
      () => {
        setShowLocation(false);
        setBusy(null);
      },
      { timeout: 15_000 },
    );
  };

  const enablePush = async () => {
    if (!VAPID_PUBLIC) return;
    setBusy("push");
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as unknown as ArrayBuffer,
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });
      }
    } catch (err) {
      console.error("[consent] enablePush", err);
    }
    setShowPush(false);
    setBusy(null);
  };

  if (!showLocation && !showPush) return null;

  return (
    <div
      style={{
        maxWidth: 1320,
        margin: "20px auto 0",
        padding: "0 28px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {showLocation && (
        <PrimingCard
          icon="📍"
          title="See gigs near you"
          body="Share your location once and nearby gigs rank higher in your matches. Stored as coordinates on your profile — you can clear it any time."
          cta={busy === "geo" ? "Requesting…" : "Enable location"}
          disabled={busy !== null}
          onAccept={enableLocation}
          onDismiss={() => {
            dismiss("geo");
            setShowLocation(false);
          }}
        />
      )}
      {showPush && (
        <PrimingCard
          icon="🔔"
          title="Get alerted when you're matched"
          body="Instant gigs go fast. Turn on notifications and we'll ping you when a gig matches your skills — even when the app is closed."
          cta={busy === "push" ? "Requesting…" : "Turn on alerts"}
          disabled={busy !== null}
          onAccept={enablePush}
          onDismiss={() => {
            dismiss("push");
            setShowPush(false);
          }}
        />
      )}
    </div>
  );
}

function PrimingCard({
  icon,
  title,
  body,
  cta,
  disabled,
  onAccept,
  onDismiss,
}: {
  icon: string;
  title: string;
  body: string;
  cta: string;
  disabled: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        borderRadius: 16,
        border: "1px solid var(--color-line)",
        background: "var(--color-surface-raised)",
        flexWrap: "wrap",
      }}
    >
      <span aria-hidden style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{title}</p>
        <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--color-ink-soft)", lineHeight: 1.5 }}>
          {body}
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          onClick={onAccept}
          disabled={disabled}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {cta}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Dismiss "${title}"`}
          style={{ background: "none", border: "none", fontSize: 12.5, color: "var(--color-ink-mute)", cursor: "pointer", fontWeight: 600 }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
