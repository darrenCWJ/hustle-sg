import type { Certification, Profile } from "@/lib/supabase/types";
import { VerifiedBadge } from "./VerifiedBadge";

export function TrustPanel({
  profile,
  certs,
}: {
  profile: Profile;
  certs: Certification[];
}) {
  const verifiedCount = certs.filter((c) => c.verified).length;
  const singpassOk = Boolean(profile.singpass_verified_at);

  return (
    <aside className="rounded-card bg-ink text-surface p-6 sticky top-24">
      <p className="text-[10px] uppercase tracking-widest text-accent">Trust panel</p>
      <h3 className="font-display text-2xl mt-2">Verified on Hustle</h3>

      <ul className="mt-6 space-y-3 text-sm">
        <li className="flex items-center justify-between">
          <span>Mock Singpass</span>
          {singpassOk ? (
            <VerifiedBadge>Verified</VerifiedBadge>
          ) : (
            <span className="text-xs text-surface/60">Pending</span>
          )}
        </li>
        <li className="flex items-center justify-between">
          <span>Verified credentials</span>
          <span className="text-surface/80 font-mono">{verifiedCount} / {certs.length}</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Joined</span>
          <span className="text-surface/80 font-mono text-xs">
            {new Date(profile.created_at).toLocaleDateString("en-SG", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </li>
      </ul>

      <p className="mt-6 text-xs text-surface/60 leading-relaxed">
        Employers see this panel before contacting. Verified trust signals move
        applications to the top of the stack.
      </p>
    </aside>
  );
}
