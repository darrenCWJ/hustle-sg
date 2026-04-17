"use client";

import { useRef, useState } from "react";

export function VideoPlayer({
  src,
  poster,
  title,
  className,
}: {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={`relative group overflow-hidden rounded-card bg-ink ${className ?? ""}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        onEnded={() => setPlaying(false)}
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute inset-0 grid place-items-center bg-ink/40 text-surface opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
        aria-label={playing ? "Pause" : "Play"}
      >
        <span className="h-14 w-14 rounded-full bg-accent text-ink grid place-items-center shadow-lift">
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 18 18"><rect x="3" y="2" width="4" height="14" rx="1" fill="currentColor" /><rect x="11" y="2" width="4" height="14" rx="1" fill="currentColor" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 2 L15 9 L4 16 Z" fill="currentColor" /></svg>
          )}
        </span>
      </button>
      {title && (
        <div className="absolute left-3 bottom-3 right-3 text-surface text-sm font-medium drop-shadow">
          {title}
        </div>
      )}
      {playing && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-pill bg-accent text-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
          Live
        </div>
      )}
    </div>
  );
}
