import { postGig } from "./actions";

async function postGigAction(formData: FormData) {
  "use server";
  await postGig(formData);
}

export default function NewGigPage() {
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
          <input
            name="category"
            placeholder="Category (design, tuition, f&b…)"
            className="rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
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
          <input
            type="number"
            min={0}
            name="budget_cents"
            placeholder="Budget in SGD cents (e.g. 80000 = S$800)"
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

        <div className="rounded-xl border border-line bg-surface-raised p-5 space-y-4">
          <p className="text-xs uppercase tracking-widest text-ink-soft">Gig settings</p>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="requires_employer_approval"
              value="true"
              defaultChecked
              className="mt-0.5 accent-ink"
            />
            <span className="text-sm">
              <strong>Require employer approval</strong>
              <span className="block text-ink-soft text-xs mt-0.5">
                You manually hire or reject each applicant after reviewing their profile and interview.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_instant"
              value="true"
              className="mt-0.5 accent-ink"
            />
            <span className="text-sm">
              <strong>Instant gig</strong>
              <span className="block text-ink-soft text-xs mt-0.5">
                Freelancers can accept immediately with no application process.
              </span>
            </span>
          </label>

          <div>
            <label className="text-xs text-ink-soft">Instant urgency (if instant gig)</label>
            <select
              name="instant_urgency"
              className="mt-1 w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
            >
              <option value="">— None —</option>
              <option value="now">Now (within the hour)</option>
              <option value="today">Today</option>
              <option value="weekend">This weekend</option>
            </select>
          </div>
        </div>

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
