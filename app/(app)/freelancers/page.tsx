import { createClient } from "@/lib/supabase/server";
import { getBlockedCounterparties } from "@/lib/safety/blocks";
import { FreelancersClient } from "./FreelancersClient";

export default async function FreelancersPage({
  searchParams,
}: {
  searchParams: Promise<{ gig_id?: string; q?: string; verified?: string }>;
}) {
  const { gig_id, q, verified } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all freelancer profiles with cert counts for trust indicators
  const { data: rawFreelancers } = await supabase
    .from("profiles")
    .select(
      "id, handle, display_name, headline, singpass_verified_at, certifications(id, verified, extracted_skills, title)",
    )
    .or("role.eq.freelancer,role.eq.both")
    .order("created_at", { ascending: false })
    .limit(120);

  // User's open gigs for the "Match to gig" dropdown
  const myGigs = user
    ? ((
        await supabase
          .from("gigs")
          .select("id, title")
          .eq("employer_id", user.id)
          .eq("status", "open")
          .limit(20)
      ).data ?? [])
    : [];

  // If a gig is selected, run AI match RPC to get ranked scores
  const matchScores: Record<string, number> = {};
  if (gig_id) {
    const { data: matched } = await supabase.rpc("match_users_for_gig", {
      p_gig_id: gig_id,
      p_limit: 50,
    });
    if (matched) {
      for (const m of matched) {
        matchScores[m.user_id] = Math.round(m.score * 100);
      }
    }
  }

  // Blocked pairs don't see each other here either (matched surfaces already
  // exclude them in SQL; this directory is a plain list).
  const blocked = user ? await getBlockedCounterparties(user.id) : new Set<string>();

  // Flatten freelancers into a clean shape
  const freelancers = (rawFreelancers ?? [])
    .filter((p) => !blocked.has(p.id))
    .map((p) => {
    const certs = (p.certifications as any[]) ?? [];
    const verifiedCerts = certs.filter((c) => c.verified);
    const allSkills = Array.from(
      new Set(certs.flatMap((c) => c.extracted_skills ?? [])),
    ).slice(0, 8);
    return {
      id: p.id,
      handle: p.handle,
      displayName: p.display_name,
      headline: p.headline ?? null,
      singpassVerified: Boolean(p.singpass_verified_at),
      verifiedCertCount: verifiedCerts.length,
      skills: allSkills,
      matchScore: matchScores[p.id] ?? null,
    };
  });

  return (
    <FreelancersClient
      freelancers={freelancers}
      myGigs={myGigs}
      activeGigId={gig_id ?? null}
      initialQ={q ?? ""}
      initialVerified={verified === "true"}
    />
  );
}
