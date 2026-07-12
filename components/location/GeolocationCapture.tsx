"use client";

import { useEffect } from "react";
import { saveLocation } from "@/app/(app)/profile/edit/actions";

interface Props {
  hasLocation: boolean;
}

export function GeolocationCapture({ hasLocation }: Props) {
  useEffect(() => {
    if (hasLocation) return;
    if (!navigator.geolocation || !navigator.permissions) return;

    // Consent best practice: only capture when the user has ALREADY granted
    // geolocation. We must not trigger the OS prompt silently on first feed load
    // with no context — that is the anti-pattern. First-time opt-in should come
    // from a contextual "find gigs near you" action (priming card: follow-up).
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (status.state !== "granted") return;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            saveLocation(pos.coords.latitude, pos.coords.longitude).catch((err) =>
              console.error("[geo] saveLocation", err),
            );
          },
          () => {},
          { maximumAge: 86_400_000, timeout: 10_000 },
        );
      })
      .catch(() => {});
  }, [hasLocation]);

  return null;
}
