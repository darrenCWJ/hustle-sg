import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postGig } from "./actions";
import { GigFormSettings } from "./GigFormSettings";
import { GigTimingFields } from "./GigTimingFields";
import { HeadcountStepper } from "./HeadcountStepper";
import { RehireSelector, type PreviousHire } from "./RehireSelector";

async function postGigAction(formData: FormData) {
  "use server";
  await postGig(formData);
}

export default async function NewGigPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/gigs/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "freelancer") redirect("/employer?upgrade=1");

  // Fetch all workers this employer has previously hired
  const { data: hiredApps } = await supabase
    .from("applications")
    .select("applicant_id, gigs!inner(id, title, category, employer_id), applicant:profiles!applications_applicant_id_fkey(handle, display_name)")
    .eq("status", "hired")
    .eq("gigs.employer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const previousHires: PreviousHire[] = (hiredApps ?? []).map((a: any) => ({
    workerId: a.applicant_id,
    displayName: a.applicant?.display_name ?? "Unknown",
    handle: a.applicant?.handle ?? "",
    category: a.gigs?.category ?? null,
    gigTitle: a.gigs?.title ?? "Previous gig",
  }));
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-widest text-ink-soft">Post a gig</p>
      <h1 className="font-display text-display-md mt-2 mb-10">Describe what you need done.</h1>

      <form action={postGigAction} className="space-y-4">
        <input
          required
          name="title"
          placeholder="Gig title"
          className="w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
        />
        <textarea
          required
          name="description"
          rows={6}
          placeholder="Describe scope, deliverables, timeline…"
          className="w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
        />
        <div className="grid md:grid-cols-2 gap-3">
          <select
            name="category"
            className="rounded-xl border border-line px-4 py-3 bg-surface-raised"
          >
            <option value="">Category</option>
            <option value="tech">Tech</option>
            <option value="design">Design</option>
            <option value="content">Content</option>
            <option value="marketing">Marketing</option>
            <option value="tuition">Tuition</option>
            <option value="events">Events</option>
            <option value="video">Video / Photography</option>
            <option value="f&b">F&amp;B</option>
            <option value="admin">Admin / Operations</option>
            <option value="logistics">Logistics / Delivery</option>
            <option value="beauty">Beauty / Wellness</option>
            <option value="other">Other</option>
          </select>
          <input
            name="location"
            placeholder="Location (e.g. Tanjong Pagar or Remote)"
            className="rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
          <input
            name="skills_required"
            placeholder="Skills required (comma separated)"
            className="md:col-span-2 rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
          <div className="md:col-span-2">
            <HeadcountStepper />
          </div>
          <input
            type="number"
            min={1}
            step="0.01"
            name="budget_sgd"
            placeholder="Budget in S$ (e.g. 800)"
            className="rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
          <select
            name="budget_kind"
            className="rounded-xl border border-line px-4 py-3 bg-surface-raised"
          >
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-ink-soft">
            Async interview questions (one per line, up to 3, 90s each)
          </label>
          <textarea
            name="questions"
            rows={4}
            placeholder={"Tell me about a tough client you unblocked.\nWalk me through your design process.\nShow a project you're proud of."}
            className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
        </div>

        <div className="rounded-xl border border-line bg-surface-raised p-5">
          <p className="text-xs uppercase tracking-widest text-ink-soft mb-4">Timing</p>
          <GigTimingFields />
        </div>

        <GigFormSettings />

        <RehireSelector previousHires={previousHires} />

        <button
          type="submit"
          className="rounded-pill bg-ink text-surface px-6 py-3 font-semibold"
        >
          Publish gig →
        </button>
      </form>
    </main>
  );
}
