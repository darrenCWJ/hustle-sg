import type { Certification } from "@/lib/supabase/types";
import { VerifiedBadge } from "./VerifiedBadge";

export function CertificationBadge({ cert }: { cert: Certification }) {
  const kindLabel = {
    wsq: "WSQ",
    university: "University",
    accreditation: "Accreditation",
    other: "Cert",
  }[cert.kind];

  return (
    <div className="rounded-card border border-line bg-surface-raised p-5 hover:border-ink transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-ink-soft">
            {kindLabel} · {cert.issuer}
          </p>
          <h4 className="mt-1 font-semibold text-sm leading-snug">{cert.title}</h4>
        </div>
        {cert.verified && <VerifiedBadge>Verified</VerifiedBadge>}
      </div>
      {cert.extracted_skills.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5 text-xs">
          {cert.extracted_skills.slice(0, 5).map((s) => (
            <li
              key={s}
              className="rounded-pill border border-line px-2.5 py-0.5 text-ink-soft"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
