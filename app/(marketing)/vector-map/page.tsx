import { createServiceClient } from "@/lib/supabase/server";
import { pca3, normaliseCoords } from "@/lib/ai/pca";
import { GlobeWrapper } from "./GlobeWrapper";
import type { VectorPoint } from "./types";

// Revalidate every 30 s so new users/gigs appear without a manual refresh.
export const revalidate = 30;

export default async function VectorMapPage() {
  const service = createServiceClient();

  const [{ data: profiles }, { data: gigs }] = await Promise.all([
    service
      .from("profiles")
      .select("id, display_name, headline, embedding")
      .or("role.eq.freelancer,role.eq.both")
      .not("embedding", "is", null)
      .limit(80),
    service
      .from("gigs")
      .select("id, title, category, embedding")
      .eq("status", "open")
      .not("embedding", "is", null)
      .limit(80),
  ]);

  const profileRows = profiles ?? [];
  const gigRows = gigs ?? [];

  const allRows = [
    ...profileRows.map((p) => ({ ...p, kind: "profile" as const })),
    ...gigRows.map((g) => ({ ...g, kind: "gig" as const })),
  ];

  // PCA runs server-side — raw 1536-dim vectors never reach the browser.
  // PostgREST returns pgvector as a JSON string "[0.1,...]" — parse it.
  const parseVec = (v: unknown): number[] => {
    if (Array.isArray(v)) return v as number[];
    if (typeof v === "string") return JSON.parse(v) as number[];
    return [];
  };
  const vectors = allRows.map((r) => parseVec(r.embedding));
  const { coords, explained } = pca3(vectors);
  const normalised = normaliseCoords(coords);

  const points: VectorPoint[] = allRows.map((r, i) => ({
    id: r.id,
    kind: r.kind,
    label: r.kind === "profile" ? (r as any).display_name : (r as any).title,
    sublabel:
      r.kind === "profile"
        ? (r as any).headline ?? null
        : (r as any).category ?? null,
    x: normalised[i]?.[0] ?? 0,
    y: normalised[i]?.[1] ?? 0,
    z: normalised[i]?.[2] ?? 0,
  }));

  return (
    <GlobeWrapper
      points={points}
      explained={explained}
      profileCount={profileRows.length}
      gigCount={gigRows.length}
    />
  );
}
