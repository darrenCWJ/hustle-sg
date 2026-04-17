import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortfolioBento } from "@/components/profile/PortfolioBento";
import { CertificationBadge } from "@/components/profile/CertificationBadge";
import { TrustPanel } from "@/components/profile/TrustPanel";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import Link from "next/link";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();
  if (!profile) notFound();

  const [{ data: certs }, { data: items }] = await Promise.all([
    supabase
      .from("certifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", profile.id)
      .order("display_order"),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      {/* Hero */}
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-end mb-16">
        <div>
          <div className="flex items-center gap-3 mb-5">
            {profile.singpass_verified_at && <VerifiedBadge>Singpass verified</VerifiedBadge>}
            <span className="text-xs uppercase tracking-widest text-ink-soft">
              @{profile.handle}
            </span>
          </div>
          <h1 className="font-display text-display-lg leading-[0.95] tracking-tight">
            {profile.display_name}
          </h1>
          {profile.headline && (
            <p className="mt-4 font-display italic text-2xl text-ink-soft">
              {profile.headline}
            </p>
          )}
          {profile.bio && (
            <p className="mt-6 max-w-xl text-ink-soft">{profile.bio}</p>
          )}
          {isOwner && (
            <Link
              href="/profile/edit"
              className="mt-8 inline-block rounded-pill border border-line px-5 py-2 text-sm font-semibold hover:border-ink"
            >
              Edit profile
            </Link>
          )}
        </div>

        <div className="hidden md:block">
          <TrustPanel profile={profile as any} certs={(certs ?? []) as any} />
        </div>
      </div>

      {/* Portfolio */}
      <section className="mb-20">
        <h2 className="font-display text-display-md mb-8">Portfolio</h2>
        <PortfolioBento items={(items ?? []) as any} />
      </section>

      {/* Certifications */}
      <section className="mb-20">
        <h2 className="font-display text-display-md mb-8">Credentials</h2>
        {certs && certs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certs.map((c) => (
              <CertificationBadge key={c.id} cert={c as any} />
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">No credentials added yet.</p>
        )}
      </section>

      <div className="md:hidden">
        <TrustPanel profile={profile as any} certs={(certs ?? []) as any} />
      </div>
    </main>
  );
}
