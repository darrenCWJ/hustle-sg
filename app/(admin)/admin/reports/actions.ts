"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

const statusSchema = z.enum(["open", "under_review", "resolved", "dismissed"]);

export async function updateReportStatus(
  reportId: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorised" };

  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedStatus.success || !z.string().uuid().safeParse(reportId).success) {
    return { ok: false, error: "Invalid input" };
  }

  const service = createServiceClient();
  const { error } = await service
    .from("reports")
    .update({ status: parsedStatus.data })
    .eq("id", reportId);

  if (error) {
    console.error("[admin] updateReportStatus", error);
    return { ok: false, error: "Update failed" };
  }
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return { ok: true };
}
