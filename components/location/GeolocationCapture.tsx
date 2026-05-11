"use client";

import { useEffect } from "react";
import { saveLocation } from "@/app/(app)/profile/edit/actions";

interface Props {
  hasLocation: boolean;
}

export function GeolocationCapture({ hasLocation }: Props) {
  useEffect(() => {
    if (hasLocation) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
      },
      () => {},
      { maximumAge: 86_400_000, timeout: 10_000 },
    );
  }, [hasLocation]);

  return null;
}
