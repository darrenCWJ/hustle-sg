import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployerDashboard } from "./EmployerDashboard";
import { WorkerDashboard } from "./WorkerDashboard";
import { ViewToggle } from "./ViewToggle";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, handle")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "freelancer";
  const isEmployer = role === "employer" || role === "both";
  const isWorker   = role === "freelancer" || role === "both";
  const isBoth     = role === "both";

  const { view } = await searchParams;

  let activeView: "employer" | "worker";
  if (isBoth) {
    activeView = view === "worker" ? "worker" : "employer";
  } else {
    activeView = isEmployer ? "employer" : "worker";
  }

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      {isBoth && <ViewToggle active={activeView} />}
      {activeView === "employer" ? (
        <EmployerDashboard userId={user.id} />
      ) : (
        <WorkerDashboard userId={user.id} handle={profile?.handle ?? ""} />
      )}
    </main>
  );
}
