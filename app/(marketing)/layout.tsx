import { SiteNav } from "@/components/nav/SiteNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      {children}
      <footer className="mt-32 border-t border-line py-10 text-sm text-ink-soft">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap gap-6 items-center justify-between">
          <p>© {new Date().getFullYear()} Hustle SG · Built in Singapore.</p>
          <div className="flex gap-5">
            <span>Mock Singpass</span>
            <span>WSQ-aware</span>
            <span>Pre-ACRA</span>
          </div>
        </div>
      </footer>
    </>
  );
}
