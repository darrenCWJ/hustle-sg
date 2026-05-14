import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";
import { PortfolioEditor } from "./PortfolioEditor";
import { CertificationsEditor } from "./CertificationsEditor";
import { WorkHistoryEditor } from "./WorkHistoryEditor";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/profile/edit");

  const [{ data: profile }, { data: items }, { data: certs }, { data: workHistory }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("portfolio_items").select("*").eq("user_id", user.id).order("display_order"),
    supabase.from("certifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("work_history").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
  ]);

  if (!profile) redirect("/singpass");

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-soft">Edit profile</p>
          <h1 className="font-display text-display-md mt-2">@{profile.handle}</h1>
        </div>
        <Link
          href={`/profile/${profile.handle}`}
          className="rounded-pill border border-line px-5 py-2 text-sm font-semibold hover:border-ink"
        >
          View public profile →
        </Link>
      </div>

      <section className="mb-14">
        <h2 className="font-display text-display-md mb-6">Details</h2>
        <ProfileForm profile={profile as any} />
      </section>

      <section className="mb-14">
        <PortfolioEditor items={(items ?? []) as any} />
      </section>

      <section className="mb-14">
        <CertificationsEditor certs={(certs ?? []) as any} />
      </section>

      <section>
        <WorkHistoryEditor items={(workHistory ?? []) as any} />
      </section>
    </main>
  );
}
