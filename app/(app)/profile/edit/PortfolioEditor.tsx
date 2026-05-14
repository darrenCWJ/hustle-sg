"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { VideoUploader } from "@/components/video/VideoUploader";
import {
  addPortfolioItem,
  deletePortfolioItem,
} from "./actions";
import type { PortfolioItem } from "@/lib/supabase/types";

export function PortfolioEditor({ items }: { items: PortfolioItem[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"video" | "website" | "writeup">("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    const fd = new FormData();
    fd.set("kind", kind);
    fd.set("title", title);
    fd.set("description", description);
    fd.set("tags", tags);
    if (kind === "website") fd.set("external_url", externalUrl);
    if (kind === "video" && mediaUrl) fd.set("media_url", mediaUrl);

    startTransition(async () => {
      const res = await addPortfolioItem(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setTitle("");
      setDescription("");
      setTags("");
      setExternalUrl("");
      setMediaUrl(null);
      router.refresh();
    });
  };

  return (
    <div id="portfolio" className="scroll-mt-24">
      <h2 className="font-display text-display-md mb-6">Portfolio</h2>

      <div className="mb-8 rounded-card bg-surface-raised border border-line p-6">
        <div className="flex gap-2 mb-4">
          {(["video", "website", "writeup"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-pill px-3 py-1 text-sm ${
                kind === k
                  ? "bg-ink text-surface"
                  : "bg-surface border border-line"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {kind === "video" && (
          <VideoUploader
            bucket="portfolio-media"
            label="Upload a 90-second showreel"
            onUploaded={({ publicUrl }) => setMediaUrl(publicUrl)}
          />
        )}

        {kind === "website" && (
          <input
            type="url"
            placeholder="https://…"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="w-full rounded-xl border border-line px-4 py-3 bg-surface"
          />
        )}

        {mediaUrl && (
          <p className="text-xs text-trust mt-2">✓ Uploaded. Add a title below.</p>
        )}

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-line px-4 py-3 bg-surface"
          />
          <input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="rounded-xl border border-line px-4 py-3 bg-surface"
          />
        </div>
        <textarea
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-xl border border-line px-4 py-3 bg-surface"
        />

        {error && <p className="text-sm text-accent mt-2">{error}</p>}

        <button
          type="button"
          disabled={
            isPending || !title || (kind === "video" && !mediaUrl) || (kind === "website" && !externalUrl)
          }
          onClick={submit}
          className="mt-4 rounded-pill bg-ink text-surface px-5 py-2 font-semibold disabled:opacity-40"
        >
          {isPending ? "Adding…" : "Add to portfolio"}
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center gap-4 rounded-card border border-line p-4 bg-surface-raised"
          >
            <span className="text-[10px] uppercase tracking-widest text-ink-soft w-16">
              {it.kind}
            </span>
            <div className="flex-1">
              <p className="font-semibold">{it.title}</p>
              {it.description && (
                <p className="text-sm text-ink-soft line-clamp-1">{it.description}</p>
              )}
            </div>
            <button
              type="button"
              className="text-xs text-ink-soft hover:text-accent"
              onClick={() => {
                startTransition(async () => {
                  await deletePortfolioItem(it.id);
                  router.refresh();
                });
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
