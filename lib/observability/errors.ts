import { createServiceClient } from "@/lib/supabase/server";

/**
 * First-party error store (no external DSN required): rows land in
 * public.app_errors (service-role only) and surface at /admin/errors.
 * Capture must never throw — an error logger that errors is worse than none.
 */
export async function captureServerError(
  scope: string,
  error: unknown,
  extra?: { userId?: string; url?: string },
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? (error.stack ?? null) : null;
  // Always mirror to the console so local dev still sees it immediately.
  console.error(`[${scope}]`, error);

  try {
    const service = createServiceClient();
    await service.from("app_errors").insert({
      source: "server",
      scope: scope.slice(0, 200),
      message: message.slice(0, 4000),
      stack: stack?.slice(0, 20000) ?? null,
      url: extra?.url?.slice(0, 2000) ?? null,
      user_id: extra?.userId ?? null,
    });
  } catch (captureErr) {
    console.error("[observability] captureServerError failed", captureErr);
  }
}
