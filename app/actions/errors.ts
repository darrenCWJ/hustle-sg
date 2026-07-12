"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

const clientErrorSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  digest: z.string().max(100).optional(),
  url: z.string().max(2000).optional(),
  scope: z.string().max(200).optional(),
});

/**
 * Client error boundaries report through this action into app_errors.
 * Heavily rate limited: an error loop or a hostile client must not be able to
 * flood the table (5 reports / 10 min per user or anonymous bucket).
 */
export async function reportClientError(input: {
  message: string;
  digest?: string;
  url?: string;
  scope?: string;
}): Promise<void> {
  const parsed = clientErrorSchema.safeParse(input);
  if (!parsed.success) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const allowed = await checkRateLimit(`client-error:${user?.id ?? "anon"}`, 5, 600);
  if (!allowed) return;

  try {
    const service = createServiceClient();
    await service.from("app_errors").insert({
      source: "client",
      scope: parsed.data.scope ?? "error-boundary",
      message: parsed.data.message,
      digest: parsed.data.digest ?? null,
      url: parsed.data.url ?? null,
      user_id: user?.id ?? null,
    });
  } catch (err) {
    console.error("[observability] reportClientError failed", err);
  }
}
