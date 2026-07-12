import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postGig } from "./actions";
import { GigFormSettings } from "./GigFormSettings";
import { GigTimingFields } from "./GigTimingFields";
import { HeadcountStepper } from "./HeadcountStepper";
import { RehireSelector, type PreviousHire } from "./RehireSelector";
import { SkillsSuggestor } from "./SkillsSuggestor";

async function postGigAction(formData: FormData) {
  "use server";
  await postGig(formData);
}

export default async function NewGigPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/gigs/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "freelancer") redirect("/employer?upgrade=1");

  // Repost: ?from=<gigId> prefills the form from one of the employer's own
  // past gigs (ownership enforced). Timing and deadline are deliberately not
  // copied — a repost is a new run of the job on new dates.
  const { from } = await searchParams;
  let source: {
    title: string;
    description: string;
    skills: string[];
    category: string | null;
    location: string | null;
    budgetSgd: number;
    budgetKind: string;
    headcount: number;
    questions: string;
  } | null = null;
  if (from && /^[0-9a-f-]{36}$/i.test(from)) {
    const { data: sourceGig } = await supabase
      .from("gigs")
      .select("employer_id, title, description, skills_required, category, location, budget_cents, budget_kind, headcount")
      .eq("id", from)
      .maybeSingle();
    if (sourceGig && sourceGig.employer_id === user.id) {
      const { data: qs } = await supabase
        .from("interview_questions")
        .select("prompt")
        .eq("gig_id", from)
        .order("display_order");
      source = {
        title: sourceGig.title,
        description: sourceGig.description,
        skills: sourceGig.skills_required ?? [],
        category: sourceGig.category,
        location: sourceGig.location,
        budgetSgd: Math.round((sourceGig.budget_cents ?? 0) / 100),
        budgetKind: sourceGig.budget_kind,
        headcount: sourceGig.headcount ?? 1,
        questions: (qs ?? []).map((q) => q.prompt).join("\n"),
      };
    }
  }

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
      <h1 className="font-display text-display-md mt-2 mb-6">Describe what you need done.</h1>

      {source && (
        <div className="mb-8 rounded-xl border border-line bg-surface-raised px-5 py-4">
          <p className="text-sm font-semibold m-0">
            Reposting &ldquo;{source.title}&rdquo;
          </p>
          <p className="text-xs text-ink-soft mt-1 m-0">
            Details copied from your previous gig. Set fresh timing and an
            application deadline below — those aren&apos;t carried over.
          </p>
        </div>
      )}

      <form action={postGigAction} className="space-y-4">
        {/* Real labels, not placeholder-only fields (Phase 5.2): placeholders
            vanish on input and screen readers can't rely on them. */}
        <div>
          <label htmlFor="gig-title" className="text-xs uppercase tracking-widest text-ink-soft">
            Gig title
          </label>
          <input
            required
            id="gig-title"
            name="title"
            defaultValue={source?.title ?? ""}
            placeholder="e.g. Weekend barista for pop-up café"
            className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
        </div>
        <div>
          <label htmlFor="gig-description" className="text-xs uppercase tracking-widest text-ink-soft">
            Description
          </label>
          <textarea
            required
            id="gig-description"
            name="description"
            defaultValue={source?.description ?? ""}
            rows={6}
            placeholder="Describe scope, deliverables, timeline…"
            className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="gig-category" className="text-xs uppercase tracking-widest text-ink-soft">
              Category
            </label>
            <select
              id="gig-category"
              name="category"
              defaultValue={source?.category ?? ""}
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
            >
              <option value="">Choose a category</option>
              <option value="tech">Tech</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="tuition">Tuition</option>
              <option value="events">Events</option>
              <option value="video">Video / Photography</option>
              <option value="admin">Admin / Operations</option>
              <option value="logistics">Logistics / Delivery</option>
              <option value="beauty">Beauty / Wellness</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="gig-location" className="text-xs uppercase tracking-widest text-ink-soft">
              Location
            </label>
            <input
              id="gig-location"
              name="location"
              defaultValue={source?.location ?? ""}
              placeholder="e.g. Tanjong Pagar or Remote"
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
            />
          </div>
          <SkillsSuggestor initialSkills={source?.skills ?? []} />
          <div className="md:col-span-2">
            <HeadcountStepper initial={source?.headcount ?? 1} />
          </div>
          <div>
            <label htmlFor="gig-budget" className="text-xs uppercase tracking-widest text-ink-soft">
              Budget (S$)
            </label>
            <input
              type="number"
              min={1}
              step="0.01"
              id="gig-budget"
              name="budget_sgd"
              defaultValue={source?.budgetSgd || undefined}
              placeholder="e.g. 800"
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
            />
          </div>
          <div>
            <label htmlFor="gig-budget-kind" className="text-xs uppercase tracking-widest text-ink-soft">
              Budget type
            </label>
            <select
              id="gig-budget-kind"
              name="budget_kind"
              defaultValue={source?.budgetKind ?? "fixed"}
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
            >
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-ink-soft">
            Async interview questions (one per line, up to 3, 90s each)
          </label>
          <textarea
            name="questions"
            defaultValue={source?.questions ?? ""}
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
