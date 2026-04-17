"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "./actions";
import type { Profile } from "@/lib/supabase/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [handle, setHandle] = useState(profile.handle);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [role, setRole] = useState(profile.role);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    setError(null);
    setFlash(null);
    const fd = new FormData();
    fd.set("handle", handle);
    fd.set("display_name", displayName);
    fd.set("headline", headline);
    fd.set("bio", bio);
    fd.set("role", role);

    startTransition(async () => {
      const res = await updateProfile(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setFlash("Saved. AI embedding re-generating in the background.");
    });
  };

  return (
    <div className="rounded-card bg-surface-raised border border-line p-6">
      <div className="grid md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Handle</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase())}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 bg-surface font-mono"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 bg-surface"
          />
        </label>
      </div>
      <label className="block mt-3">
        <span className="text-xs uppercase tracking-widest text-ink-soft">Headline</span>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="UX designer · WSQ-certified · ex-NUS"
          className="mt-1 w-full rounded-xl border border-line px-4 py-3 bg-surface"
        />
      </label>
      <label className="block mt-3">
        <span className="text-xs uppercase tracking-widest text-ink-soft">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-line px-4 py-3 bg-surface"
        />
      </label>
      <label className="block mt-3">
        <span className="text-xs uppercase tracking-widest text-ink-soft">Role</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="mt-1 w-full rounded-xl border border-line px-4 py-3 bg-surface"
        >
          <option value="freelancer">Freelancer (looking for gigs)</option>
          <option value="employer">Employer (posting gigs)</option>
          <option value="both">Both</option>
        </select>
      </label>

      {error && <p className="text-sm text-accent mt-3">{error}</p>}
      {flash && <p className="text-sm text-trust mt-3">{flash}</p>}

      <button
        type="button"
        onClick={save}
        disabled={isPending}
        className="mt-5 rounded-pill bg-ink text-surface px-5 py-2 font-semibold disabled:opacity-40"
      >
        {isPending ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
}
