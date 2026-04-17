import { cn } from "@/lib/utils";

export function VerifiedBadge({
  children,
  tone = "trust",
  className,
}: {
  children: React.ReactNode;
  tone?: "trust" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold",
        tone === "trust" ? "bg-trust-soft text-trust" : "bg-accent-soft text-accent-ink",
        className,
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 1l1.5 1.5L9.5 2l.5 2 1.5 1-1 1.5 1 1.5-1.5 1L9.5 10l-2-.5L6 11l-1.5-1.5L2.5 10l-.5-2L.5 7l1-1.5-1-1.5L2 2l.5-1.5L4.5 1 6 0z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M3 6l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </span>
  );
}
