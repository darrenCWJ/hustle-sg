import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSgd(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

/**
 * Human label for a gig's budget basis. Gigs aren't only hourly: they can be
 * a lump sum, priced for the whole project, or paid out per milestone.
 */
export function budgetKindLabel(kind: string | null | undefined): string {
  switch (kind) {
    case "hourly":
      return "/hr";
    case "project":
      return "project";
    case "milestone":
      return "per milestone";
    default:
      return "fixed";
  }
}
