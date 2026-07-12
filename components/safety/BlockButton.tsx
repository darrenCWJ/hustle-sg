"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { blockUser, unblockUser } from "@/app/actions/safety";

interface BlockButtonProps {
  userId: string;
  displayName: string;
  initiallyBlocked: boolean;
}

export function BlockButton({ userId, displayName, initiallyBlocked }: BlockButtonProps) {
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    setError(null);
    startTransition(async () => {
      const res = blocked ? await unblockUser(userId) : await blockUser(userId);
      if (!res.ok) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setBlocked(!blocked);
      router.refresh();
    });
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={blocked}
        aria-label={blocked ? `Unblock ${displayName}` : `Block ${displayName}`}
        className="text-xs px-2.5 py-1 rounded-pill border border-line text-ink-soft hover:border-ink hover:text-ink transition disabled:opacity-60"
      >
        {pending ? "…" : blocked ? "Unblock" : "Block"}
      </button>
      {error && <span style={{ fontSize: 11, color: "#b91c1c" }}>{error}</span>}
    </span>
  );
}
