"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Admin management without SQL: an existing admin can promote or revoke by
 * handle. The FIRST admin is still promoted via SQL (someone must bootstrap),
 * and you cannot revoke yourself — that path leads to a locked-out surface.
 */
export async function setAdminByHandle(
  handle: string,
  makeAdmin: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorised" };

  const parsed = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,32}$/, "That doesn't look like a handle")
    .safeParse(handle);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid handle" };
  }

  const service = createServiceClient();
  const { data: target } = await service
    .from("profiles")
    .select("id, handle, is_admin")
    .eq("handle", parsed.data)
    .maybeSingle();
  if (!target) return { ok: false, error: `No user with handle @${parsed.data}` };
  if (!makeAdmin && target.id === admin.id) {
    return { ok: false, error: "You can't revoke your own admin access." };
  }
  if (target.is_admin === makeAdmin) {
    return { ok: false, error: `@${target.handle} is ${makeAdmin ? "already" : "not"} an admin.` };
  }

  const { error } = await service
    .from("profiles")
    .update({ is_admin: makeAdmin })
    .eq("id", target.id);
  if (error) {
    console.error("[admin] setAdminByHandle", error);
    return { ok: false, error: "Update failed" };
  }

  revalidatePath("/admin/settings");
  return { ok: true };
}
