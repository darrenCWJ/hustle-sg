"use client";

import { RouteError } from "@/components/feedback/RouteError";

export default function AppError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} homeHref="/feed" homeLabel="Back to feed" />;
}
