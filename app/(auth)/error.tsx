"use client";

import { RouteError } from "@/components/feedback/RouteError";

export default function AuthError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} homeHref="/singpass" homeLabel="Back to sign in" />;
}
