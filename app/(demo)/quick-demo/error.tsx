"use client";

import { RouteError } from "@/components/feedback/RouteError";

export default function DemoError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} homeHref="/quick-demo" homeLabel="Restart demo" />;
}
