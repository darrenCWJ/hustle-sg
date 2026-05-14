import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobilePostGigForm } from "./MobilePostGigForm";

export default async function MobilePostGigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/m/singpass?next=/m/employer/post");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "freelancer") redirect("/m/feed");

  return <MobilePostGigForm />;
}
