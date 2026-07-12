"use client";

import { RouteError } from "@/components/feedback/RouteError";

export default function MarketingError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} homeHref="/" homeLabel="Go home" />;
}
