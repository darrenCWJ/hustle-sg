"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { looksReserved, mockAcraUEN } from "@/lib/entrepreneur/entities";

export async function saveChecklistStep({
  entity_type,
  proposed_name,
  business_activities,
  stage,
  checklist_state,
}: {
  entity_type?: "sole_prop" | "pte_ltd";
  proposed_name?: string;
  business_activities?: string[];
  stage?: "exploring" | "name_reserved" | "registered";
  checklist_state?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Log in first" };

  const patch: Record<string, unknown> = { user_id: user.id };
  if (entity_type !== undefined) patch.entity_type = entity_type;
  if (proposed_name !== undefined) patch.proposed_name = proposed_name;
  if (business_activities !== undefined) patch.business_activities = business_activities;
  if (stage !== undefined) patch.stage = stage;
  if (checklist_state !== undefined) patch.checklist_state = checklist_state;

  const { error } = await supabase
    .from("company_registrations")
    .upsert(patch, { onConflict: "user_id" });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/start-a-business");
  return { ok: true as const };
}

export async function checkNameAvailability(name: string) {
  const reserved = looksReserved(name);
  if (reserved) {
    return { ok: false as const, reason: `Name contains restricted term: "${reserved}"` };
  }
  if (name.trim().length < 3) return { ok: false as const, reason: "Too short" };
  return { ok: true as const };
}

export async function mockRegister() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Log in first" };

  const uen = mockAcraUEN();
  const { error } = await supabase
    .from("company_registrations")
    .upsert(
      {
        user_id: user.id,
        stage: "registered",
        mock_acra_id: uen,
      },
      { onConflict: "user_id" },
    );
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/start-a-business");
  return { ok: true as const, uen };
}
