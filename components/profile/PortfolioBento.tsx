import type { PortfolioItem } from "@/lib/supabase/types";
import { VideoPlayer } from "./VideoPlayer";
import { safeHref } from "@/lib/security/url";

const CELL_ROTATION = ["cell-lg tall", "cell-md", "cell-md", "cell-lg", "cell-md tall", "cell-md"];

export function PortfolioBento({ items }: { items: PortfolioItem[] }) {
  if (!items.length) {
    return (
      <div className="rounded-card border border-dashed border-line p-10 text-center text-ink-soft">
        No portfolio items yet.
      </div>
    );
  }

  return (
    <div className="bento">
      {items.map((item, i) => {
        const cls = CELL_ROTATION[i % CELL_ROTATION.length];
        if (item.kind === "video" && item.media_url) {
          return (
            <div key={item.id} className={cls}>
              <VideoPlayer src={item.media_url} title={item.title} className="h-full min-h-[220px]" />
              {item.description && (
                <p className="text-sm text-ink-soft mt-2">{item.description}</p>
              )}
            </div>
          );
        }
        const websiteHref = item.kind === "website" ? safeHref(item.external_url) : null;
        if (websiteHref) {
          return (
            <a
              key={item.id}
              href={websiteHref}
              target="_blank"
              rel="noreferrer noopener"
              className={`${cls} rounded-card border border-line bg-surface-raised p-6 flex flex-col justify-between hover:border-ink transition group`}
            >
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink-soft">Website</p>
                <h4 className="font-display text-xl mt-2 group-hover:text-accent-ink transition">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-sm text-ink-soft mt-2 line-clamp-3">{item.description}</p>
                )}
              </div>
              <p className="text-xs text-ink-soft mt-4 truncate group-hover:text-ink">
                {new URL(websiteHref).hostname} →
              </p>
            </a>
          );
        }
        if (item.kind === "writeup") {
          return (
            <article
              key={item.id}
              className={`${cls} rounded-card bg-accent-soft p-6`}
            >
              <p className="text-[10px] uppercase tracking-widest text-accent-ink">Case study</p>
              <h4 className="font-display text-xl mt-2">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-accent-ink/80 mt-2 leading-relaxed">{item.description}</p>
              )}
            </article>
          );
        }
        if (item.kind === "image" && item.media_url) {
          return (
            <div key={item.id} className={`${cls} relative rounded-card overflow-hidden`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.media_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 text-surface text-sm font-medium drop-shadow">
                {item.title}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
