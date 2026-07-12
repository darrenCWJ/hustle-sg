"use client";

import { RouteError } from "@/components/feedback/RouteError";

export default function MobileError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} homeHref="/m/feed" homeLabel="Back to feed" />;
}
