import { NRICForm } from "@/components/singpass/NRICForm";
import Link from "next/link";

export default async function SingpassPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      <section className="relative bg-ink text-surface p-10 lg:p-16 flex flex-col justify-between overflow-hidden grain">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest opacity-70 hover:opacity-100">
            ← Hustle SG
          </Link>
          <div className="mt-16">
            <p className="text-xs uppercase tracking-widest text-accent-soft">For trust</p>
            <h1 className="font-display text-display-lg mt-3 leading-[0.95]">
              Verified<br />
              hustlers<br />
              only.
            </h1>
            <p className="mt-6 text-surface/70 text-body-lg max-w-sm">
              Singpass verification is how employers know you&apos;re you — not a stock
              photo with a fake WSQ cert. Takes 20 seconds.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-12 text-xs text-surface/60 leading-relaxed">
          <p className="mb-3 font-semibold text-surface/80">What we actually keep</p>
          <ul className="space-y-1.5">
            <li>• SHA-256 hash of your NRIC (not the NRIC itself)</li>
            <li>• Timestamp of your last verification</li>
            <li>• No ID scans, no facial images, no birthdate</li>
          </ul>
        </div>
      </section>

      <section className="p-10 lg:p-16 flex items-center justify-center">
        <NRICForm next={next} />
      </section>
    </main>
  );
}
