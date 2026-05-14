import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SF_CATALOG } from "@/lib/skillsfuture/catalog";
import { SkillsFutureClient } from "./SkillsFutureClient";

export const metadata = { title: "SkillsFuture MyCerts — Demo" };

export default async function SkillsFuturePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/singpass?next=/skillsfuture");

  const { data: certs } = await supabase
    .from("certifications")
    .select("title, issuer")
    .eq("user_id", user.id);

  const importedTitles = (certs ?? []).map((c) => c.title);

  return <SkillsFutureClient catalog={SF_CATALOG} importedTitles={importedTitles} />;
}
