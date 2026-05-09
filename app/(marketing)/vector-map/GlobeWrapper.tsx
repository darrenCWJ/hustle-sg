"use client";

import dynamic from "next/dynamic";
import type { VectorPoint } from "./types";

const VectorGlobe = dynamic(() => import("./VectorGlobe"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#050509",
        color: "#475569",
        fontFamily: "monospace",
        fontSize: 14,
      }}
    >
      Initialising vector space…
    </div>
  ),
});

export function GlobeWrapper({
  points,
  explained,
  profileCount,
  gigCount,
}: {
  points: VectorPoint[];
  explained: number[];
  profileCount: number;
  gigCount: number;
}) {
  return (
    <VectorGlobe
      points={points}
      explained={explained}
      profileCount={profileCount}
      gigCount={gigCount}
    />
  );
}
