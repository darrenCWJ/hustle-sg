"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";
import { PROFILES, type DemoGig, type DemoProfile } from "../data";
import { suggestSkills } from "../../../(app)/gigs/new/actions";

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];
function avatarHue(name: string) {
  return AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_HUES.length];
}

function scoreMatch(profile: DemoProfile, skills: string[]): number {
  if (!profile.skills?.length || !skills.length) return 0;
  const profileLower = profile.skills.map((s) => s.toLowerCase());
  const gigLower = skills.map((s) => s.toLowerCase());
  const matches = profileLower.filter((ps) =>
    gigLower.some((gs) => gs.includes(ps) || ps.includes(gs))
  ).length;
  return matches / gigLower.length;
}

const COMMUNITY_TEMPLATES = [
  {
    emoji: "🐾",
    label: "Lost Pet",
    form: {
      title: "Help find my lost cat near Tampines",
      description: "My cat Mochi went missing near Block 123, Tampines Ave 5. He's an orange tabby, 3 years old, neutered, wearing a blue collar. Please help search the area or message me if spotted. Reward for anyone who helps find him.",
      category: "community",
      location: "Tampines Ave 5",
      skills: "",
      budget: "50",
      budgetKind: "fixed" as const,
      headcount: 3,
      questions: "",
    },
  },
  {
    emoji: "🛒",
    label: "Grocery Run",
    form: {
      title: "Grocery pickup & delivery — Bishan",
      description: "Need someone to pick up a small grocery list from NTUC FairPrice at Bishan Junction 8 and deliver to my home nearby. Should take about 45 minutes total. Will reimburse cost + tip.",
      category: "community",
      location: "Bishan",
      skills: "",
      budget: "15",
      budgetKind: "fixed" as const,
      headcount: 1,
      questions: "",
    },
  },
  {
    emoji: "📦",
    label: "Moving Help",
    form: {
      title: "Help moving furniture — Jurong East",
      description: "Moving a few pieces of furniture between two units in the same HDB block. Need 2–3 people for about 2 hours. No heavy lifting experience required, just willing hands. Drinks and snacks provided.",
      category: "community",
      location: "Jurong East",
      skills: "",
      budget: "80",
      budgetKind: "fixed" as const,
      headcount: 3,
      questions: "",
    },
  },
  {
    emoji: "🐕",
    label: "Dog Walk",
    form: {
      title: "Dog walker needed — Clementi, this week",
      description: "Looking for someone to walk my golden retriever Biscuit once a day (30 min) around Clementi Woods Park this week while I'm travelling. Dog is friendly and leash-trained.",
      category: "community",
      location: "Clementi",
      skills: "",
      budget: "20",
      budgetKind: "hourly" as const,
      headcount: 1,
      questions: "",
    },
  },
];

const DEMO_TEMPLATES = [
  {
    emoji: "⚛️",
    label: "React Dev",
    form: {
      title: "React Developer — B2B SaaS dashboard",
      description: "We need a React developer to build a reporting dashboard for our B2B SaaS product. The work includes data visualisation components, a filterable table, and integration with our REST API. Deliverable is a polished, responsive UI ready for handoff.",
      category: "tech",
      location: "Remote",
      skills: "React, TypeScript, REST API, Tailwind CSS",
      budget: "1200",
      budgetKind: "fixed" as const,
      headcount: 1,
      questions: "Walk me through the last React project you shipped.\nHow do you handle complex state across multiple components?",
    },
  },
  {
    emoji: "🎨",
    label: "UI Designer",
    form: {
      title: "UI/UX Designer — mobile app redesign",
      description: "Looking for a UI/UX designer to redesign our iOS app (12 screens). You'll own the visual language, component library in Figma, and handoff annotations. We want a modern, clean aesthetic suitable for a fintech audience.",
      category: "design",
      location: "Remote",
      skills: "Figma, UI Design, Prototyping, Design System",
      budget: "900",
      budgetKind: "fixed" as const,
      headcount: 1,
      questions: "Share a case study of a mobile redesign you led.\nHow do you balance aesthetics with usability?",
    },
  },
  {
    emoji: "📣",
    label: "Social Media",
    form: {
      title: "Social Media Manager — F&B brand",
      description: "We need a social media manager for our café brand across Instagram and TikTok. Responsibilities include content planning, caption writing, posting schedule, and monthly analytics reporting. 3 posts per week.",
      category: "marketing",
      location: "Tanjong Pagar",
      skills: "Instagram, TikTok, Content Writing, Canva, Analytics",
      budget: "55",
      budgetKind: "hourly" as const,
      headcount: 1,
      questions: "Show us a social campaign you ran and its results.\nHow do you come up with content ideas consistently?",
    },
  },
  {
    emoji: "📸",
    label: "Photographer",
    form: {
      title: "Event Photographer — product launch",
      description: "Product launch event at Marina Bay Sands, 3 hours. We need high-quality photos of the venue, speaker presentations, and networking moments. Final edited gallery (50+ shots) delivered within 48 hours.",
      category: "events",
      location: "Marina Bay Sands",
      skills: "Photography, Photo Editing, Lightroom, Event Coverage",
      budget: "350",
      budgetKind: "fixed" as const,
      headcount: 1,
      questions: "Share your event photography portfolio.\nHow do you handle low-light indoor venue shoots?",
    },
  },
  {
    emoji: "📐",
    label: "Maths Tutor",
    form: {
      title: "A-Level Maths Tutor (H2)",
      description: "Seeking an experienced A-Level H2 Mathematics tutor for weekly 1.5-hour sessions with a JC2 student. Focus on calculus, statistics, and exam technique. Must be familiar with the latest SEAB syllabus.",
      category: "tuition",
      location: "Tampines",
      skills: "H2 Mathematics, Calculus, Statistics, Exam Technique",
      budget: "65",
      budgetKind: "hourly" as const,
      headcount: 1,
      questions: "What's your track record with A-Level students?\nHow do you adapt your teaching to a struggling student?",
    },
  },
];

const CATEGORIES = [
  { value: "",           label: "Category" },
  { value: "community",  label: "Community Help" },
  { value: "tech",       label: "Tech" },
  { value: "design",     label: "Design" },
  { value: "marketing",  label: "Marketing" },
  { value: "tuition",    label: "Tuition" },
  { value: "events",     label: "Events" },
  { value: "video",      label: "Video / Photography" },
  { value: "admin",      label: "Admin / Operations" },
  { value: "logistics",  label: "Logistics / Delivery" },
  { value: "beauty",     label: "Beauty / Wellness" },
  { value: "other",      label: "Other" },
];

const DURATION_OPTIONS = [
  { value: "less_than_a_day", label: "Less than a day" },
  { value: "about_a_week",    label: "About a week" },
  { value: "2_weeks",         label: "2 weeks" },
  { value: "1_month",         label: "1 month" },
  { value: "2_3_months",      label: "2–3 months" },
  { value: "6_months_plus",   label: "6 months+" },
  { value: "ongoing",         label: "Ongoing / recurring" },
  { value: "project_based",   label: "Project-based (until done)" },
  { value: "specific_date",   label: "Until a specific date" },
];

const CADENCE_OPTIONS = ["Once a week", "Twice a week", "Once a fortnight", "Once a month", "As needed"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type GigMode = "approval" | "instant";
interface Milestone { name: string; due_date: string }

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid var(--color-line)",
  padding: "12px 16px",
  background: "var(--color-surface-raised)",
  fontSize: 14,
  color: "var(--color-ink)",
  boxSizing: "border-box",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid var(--color-line)",
  padding: "12px 16px",
  background: "var(--color-surface-raised)",
  fontSize: 14,
  color: "var(--color-ink)",
  width: "100%",
};

export default function DemoPostPage() {
  const router = useRouter();
  const { postGig, sendDirectOffer, activeAccount } = useDemo();
  const { viewMode } = useViewMode();

  const [isCommunity, setIsCommunity] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    skills: "",
    budget: "",
    budgetKind: "fixed" as "fixed" | "hourly",
    headcount: 1,
    questions: "",
  });
  const [postedGig, setPostedGig] = useState<{ id: string; title: string; skills: string[]; category: string } | null>(null);
  const [offerStatuses, setOfferStatuses] = useState<Record<string, "idle" | "sending" | "sent">>({});
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Timing state
  const [asap, setAsap] = useState(true);
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [hours, setHours] = useState("");
  const [cadence, setCadence] = useState(CADENCE_OPTIONS[3]);
  const [milestones, setMilestones] = useState<Milestone[]>([{ name: "", due_date: "" }]);

  // Gig mode state
  const [gigMode, setGigMode] = useState<GigMode>("approval");
  const [deadline, setDeadline] = useState("");

  async function applyTemplate(t: typeof DEMO_TEMPLATES[number], community = false) {
    setForm(t.form);
    setIsCommunity(community);
    setSkillSuggestions([]);
    if (!community) {
      setSuggestLoading(true);
      try {
        const result = await suggestSkills(t.form.title, t.form.description);
        setSkillSuggestions(result);
      } finally {
        setSuggestLoading(false);
      }
    }
  }

  function toggleDay(day: number) {
    setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  }

  async function handleSuggestSkills() {
    if (!form.title.trim() && !form.description.trim()) return;
    setSuggestLoading(true);
    try {
      const result = await suggestSkills(form.title, form.description);
      setSkillSuggestions(result);
    } finally {
      setSuggestLoading(false);
    }
  }

  function toggleSuggestedSkill(skill: string) {
    setForm(f => {
      const current = f.skills.split(",").map(s => s.trim()).filter(Boolean);
      const updated = current.includes(skill)
        ? current.filter(s => s !== skill)
        : [...current, skill];
      return { ...f, skills: updated.join(", ") };
    });
  }

  function addMilestone() {
    setMilestones(m => [...m, { name: "", due_date: "" }]);
  }
  function removeMilestone(i: number) {
    setMilestones(m => m.filter((_, idx) => idx !== i));
  }
  function updateMilestone(i: number, field: keyof Milestone, value: string) {
    setMilestones(m => m.map((ms, idx) => idx === i ? { ...ms, [field]: value } : ms));
  }

  if (activeAccount.role !== "employer") {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)", fontSize: 14 }}>
        Only employers can post gigs.
      </div>
    );
  }

  function deriveDuration(): string | undefined {
    if (!duration) return undefined;
    const map: Record<string, string> = {
      less_than_a_day: hours ? `${hours}h` : "Less than a day",
      about_a_week: "About a week",
      "2_weeks": "2 weeks",
      "1_month": "1 month",
      "2_3_months": "2–3 months",
      "6_months_plus": "6 months+",
      ongoing: `Ongoing · ${cadence}`,
      project_based: "Project-based",
      specific_date: endDate ? `Until ${endDate}` : "Until a specific date",
    };
    return map[duration];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const parsedQuestions = form.questions
      .split("\n")
      .map(q => q.trim())
      .filter(Boolean)
      .slice(0, 3);

    const gig: Omit<DemoGig, "id"> = {
      title: form.title,
      description: form.description,
      category: form.category || "other",
      location: form.location || "Remote",
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      budget: form.budget
        ? `S$${form.budget}${form.budgetKind === "hourly" ? "/hr" : " fixed"}`
        : "TBD",
      postedAgo: "just now",
      headcount: form.headcount > 1 ? form.headcount : undefined,
      duration: deriveDuration(),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      days: daysOfWeek.length > 0 ? daysOfWeek : undefined,
      questions: parsedQuestions.length > 0 ? parsedQuestions : undefined,
    };

    const gigId = postGig(gig);
    setPostedGig({ id: gigId, title: gig.title, skills: gig.skills ?? [], category: gig.category });
  }

  const innerPad: React.CSSProperties = viewMode === "desktop"
    ? { maxWidth: 768, margin: "0 auto", padding: "64px 24px 28px" }
    : { padding: "16px 16px 20px" };

  if (postedGig) {
    const scored = PROFILES
      .filter((p) => p.role === "freelancer")
      .map((p) => ({ profile: p, score: scoreMatch(p, postedGig.skills) }));
    const hasSkillMatch = scored.some((c) => c.score > 0);
    const recommended = (
      hasSkillMatch
        ? scored.filter((c) => c.score > 0).sort((a, b) => b.score - a.score)
        : scored
            .filter((c) => c.profile.categories?.includes(postedGig.category))
            .map((c) => ({ ...c, score: 0.1 }))
            .concat(scored.filter((c) => !c.profile.categories?.includes(postedGig.category)))
    ).slice(0, 6);

    function handleOffer(freelancerId: string) {
      if (offerStatuses[freelancerId]) return;
      setOfferStatuses((prev) => ({ ...prev, [freelancerId]: "sending" }));
      sendDirectOffer(freelancerId, postedGig!.id);
      setTimeout(() => setOfferStatuses((prev) => ({ ...prev, [freelancerId]: "sent" })), 400);
    }

    return (
      <div style={{ overflowY: "auto", height: "100%", ...innerPad }}>
        {/* Success header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: viewMode === "desktop" ? "flex-start" : "center", textAlign: viewMode === "desktop" ? "left" : "center", gap: 10, marginBottom: 36, paddingBottom: 32, borderBottom: "1px solid var(--color-line)" }}>
          <div style={{ fontSize: 40 }}>🎉</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: viewMode === "desktop" ? 32 : 26, margin: 0, letterSpacing: "-0.025em" }}>Gig posted!</h2>
          <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: 0, maxWidth: 420 }}>
            <strong>{postedGig.title}</strong> is now live. Workers can see it in their Feed.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            <button
              onClick={() => router.push(`/quick-demo/applicants?gig=${postedGig.id}`)}
              style={{ padding: "9px 20px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              View applicants →
            </button>
            <button
              onClick={() => { setPostedGig(null); setOfferStatuses({}); }}
              style={{ padding: "9px 20px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--color-ink-soft)" }}
            >
              Post another
            </button>
          </div>
        </div>

        {/* Recommended candidates */}
        {recommended.length > 0 && (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: viewMode === "desktop" ? 24 : 20, margin: 0, letterSpacing: "-0.02em" }}>
                Recommended candidates
              </h3>
              <span style={{ padding: "3px 9px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                AI matched
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 20px" }}>
              {hasSkillMatch
                ? <><strong>{postedGig.title}</strong> — freelancers whose skills match. Send a direct offer instantly.</>
                : <>Freelancers available in this category. Send a direct offer instantly.</>}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "desktop" ? "repeat(auto-fill, minmax(260px, 1fr))" : "1fr", gap: 12 }}>
              {recommended.map(({ profile, score }) => {
                const isSkillMatch = score > 0.1;
                const pct = isSkillMatch ? Math.round(score * 100) : 0;
                const highMatch = pct >= 70;
                const hue = avatarHue(profile.name);
                const initials = profile.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
                const status = offerStatuses[profile.id] ?? "idle";
                return (
                  <div key={profile.id} style={{ padding: 18, borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ width: 40, height: 40, borderRadius: "50%", background: `oklch(78% 0.08 ${hue})`, color: `oklch(22% 0.08 ${hue})`, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {initials}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: 16, margin: "0 0 2px", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {profile.name}
                        </p>
                        {profile.headline && (
                          <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {profile.headline}
                          </p>
                        )}
                      </div>
                      {isSkillMatch && (
                        <span style={{ flexShrink: 0, padding: "3px 8px", borderRadius: 999, background: highMatch ? "var(--color-jade-soft, #dcfce7)" : "var(--color-muted)", color: highMatch ? "#166534" : "var(--color-ink-soft)", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                          {pct}%
                        </span>
                      )}
                    </div>

                    {isSkillMatch && (
                      <div style={{ height: 3, borderRadius: 999, background: "var(--color-muted)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: highMatch ? "#16a34a" : "var(--color-accent)", transition: "width 0.4s ease" }} />
                      </div>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {profile.skills.slice(0, 4).map((s) => {
                          const matched = isSkillMatch && postedGig.skills.some((gs) => gs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(gs.toLowerCase()));
                          return (
                            <span key={s} style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 999, background: matched ? "var(--color-jade-soft, #dcfce7)" : "var(--color-muted)", color: matched ? "#166534" : "var(--color-ink-soft)", fontWeight: 600 }}>
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {profile.rating !== undefined && (
                      <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: 0 }}>
                        ★ {profile.rating} · {profile.completedGigs ?? 0} gigs · {profile.hourlyRate}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOffer(profile.id)}
                      disabled={status !== "idle"}
                      style={{
                        marginTop: "auto", padding: "7px 14px", borderRadius: 999, border: "none",
                        background: status === "sent" ? "var(--color-jade-soft, #dcfce7)" : status === "sending" ? "var(--color-muted)" : "var(--color-ink)",
                        color: status === "sent" ? "#166534" : status === "sending" ? "var(--color-ink-mute)" : "var(--color-surface)",
                        fontSize: 13, fontWeight: 700, cursor: status === "idle" ? "pointer" : "default", transition: "background 0.15s",
                      }}
                    >
                      {status === "sending" ? "Sending…" : status === "sent" ? "✓ Offer sent" : "Send offer →"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={innerPad}>
      <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
        Post a gig
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: viewMode === "desktop" ? "clamp(2rem, 3vw, 2.8rem)" : 24, margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1 }}>
        Describe what you need done.
      </h1>

      {/* Post type toggle + template strip */}
      <div style={{ marginBottom: 28 }}>
        {/* Type selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, padding: 4, borderRadius: 12, background: "var(--color-muted)", width: "fit-content" }}>
          <button
            type="button"
            onClick={() => { setIsCommunity(false); setForm(f => ({ ...f, category: "" })); }}
            style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: !isCommunity ? "var(--color-surface)" : "transparent", color: "var(--color-ink)", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: !isCommunity ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
          >
            💼 Gig / Job
          </button>
          <button
            type="button"
            onClick={() => { setIsCommunity(true); setForm(f => ({ ...f, category: "community", skills: "" })); setSkillSuggestions([]); }}
            style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: isCommunity ? "var(--color-surface)" : "transparent", color: "var(--color-ink)", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: isCommunity ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
          >
            🤝 Community Help
          </button>
        </div>

        {/* Description */}
        {isCommunity && (
          <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 10px", lineHeight: 1.5 }}>
            Post a help request that anyone nearby can respond to — no skills required. Great for lost pets, grocery runs, moving help, and neighbourhood favours.
          </p>
        )}

        {/* Templates */}
        <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-mute)", margin: "0 0 8px" }}>
          ✦ Quick-fill with a demo template
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(isCommunity ? COMMUNITY_TEMPLATES : DEMO_TEMPLATES).map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t as typeof DEMO_TEMPLATES[number], isCommunity)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid var(--color-line)",
                background: form.title === t.form.title ? (isCommunity ? "#f97316" : "var(--color-ink)") : "var(--color-surface-raised)",
                color: form.title === t.form.title ? "#fff" : "var(--color-ink)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <form id="post-gig-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Title */}
        <input
          required
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Gig title"
          style={inputStyle}
        />

        {/* Description */}
        <textarea
          required
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={6}
          placeholder="Describe scope, deliverables, timeline…"
          style={{ ...inputStyle, resize: "vertical" }}
        />

        {/* 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: viewMode === "desktop" ? "1fr 1fr" : "1fr", gap: 10 }}>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={selectStyle}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <input
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="Location (e.g. Tanjong Pagar or Remote)"
            style={inputStyle}
          />

          {/* Skills — full width, hidden for community posts */}
          <div style={{ gridColumn: viewMode === "desktop" ? "span 2" : undefined, display: isCommunity ? "none" : "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={form.skills}
                onChange={e => {
                  setForm(f => ({ ...f, skills: e.target.value }));
                  setSkillSuggestions([]);
                }}
                placeholder="Skills required (comma separated)"
                style={{ ...inputStyle, flex: 1, minWidth: 0 }}
              />
              <button
                type="button"
                onClick={handleSuggestSkills}
                disabled={suggestLoading}
                style={{
                  flexShrink: 0,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: "1px solid var(--color-line)",
                  background: suggestLoading ? "var(--color-muted)" : "var(--color-surface-raised)",
                  color: suggestLoading ? "var(--color-ink-mute)" : "var(--color-ink)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: suggestLoading ? "default" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {suggestLoading ? "…" : "✦ Suggest"}
              </button>
            </div>
            {skillSuggestions.length > 0 && (
              <div>
                <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 6px", fontWeight: 600 }}>
                  AI suggestions — tap to add
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {skillSuggestions.map(s => {
                    const current = form.skills.split(",").map(x => x.trim()).filter(Boolean);
                    const selected = current.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSuggestedSkill(s)}
                        style={{
                          padding: "5px 13px",
                          borderRadius: 999,
                          fontSize: 12.5,
                          fontWeight: 600,
                          border: "1px solid",
                          borderColor: selected ? "var(--color-ink)" : "var(--color-line)",
                          background: selected ? "var(--color-ink)" : "transparent",
                          color: selected ? "var(--color-surface)" : "var(--color-ink-soft)",
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        {selected ? "✓ " : "+ "}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Headcount stepper — full width */}
          <div style={{ gridColumn: viewMode === "desktop" ? "span 2" : undefined, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
            <span style={{ fontSize: 13, color: "var(--color-ink-soft)", flex: 1 }}>Freelancers needed</span>
            <button type="button" onClick={() => setForm(f => ({ ...f, headcount: Math.max(1, f.headcount - 1) }))} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center" }}>−</button>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, minWidth: 24, textAlign: "center", fontSize: 15 }}>{form.headcount}</span>
            <button type="button" onClick={() => setForm(f => ({ ...f, headcount: f.headcount + 1 }))} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center" }}>+</button>
          </div>

          {/* Budget */}
          <input
            type="number"
            min={1}
            step="0.01"
            value={form.budget}
            onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
            placeholder="Budget in S$ (e.g. 800)"
            style={inputStyle}
          />
          <select
            value={form.budgetKind}
            onChange={e => setForm(f => ({ ...f, budgetKind: e.target.value as "fixed" | "hourly" }))}
            style={selectStyle}
          >
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        {/* Interview questions — hidden for community posts */}
        <div style={{ display: isCommunity ? "none" : "block" }}>
          <label style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", display: "block", marginBottom: 8 }}>
            Async interview questions (one per line, up to 3, 90s each)
          </label>
          <textarea
            value={form.questions}
            onChange={e => setForm(f => ({ ...f, questions: e.target.value }))}
            rows={4}
            placeholder={"Tell me about a tough client you unblocked.\nWalk me through your design process.\nShow a project you're proud of."}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Timing section */}
        <div style={{ borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: 0 }}>Timing</p>

          {/* Duration selector — always first */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>How long will it take?</p>
            <select value={duration} onChange={e => { setDuration(e.target.value); setDaysOfWeek([]); setHours(""); }} style={selectStyle}>
              <option value="">Select duration…</option>
              {DURATION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Less than a day: hours → which day → time */}
          {duration === "less_than_a_day" && (
            <>
              <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--color-surface)", border: "1px solid var(--color-line)" }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-soft)", display: "block", marginBottom: 10 }}>
                  Estimated hours needed
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1,2,3,4,5,6,7,8].map(h => (
                    <button key={h} type="button" onClick={() => setHours(String(h))} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: `1.5px solid ${hours === String(h) ? "var(--color-ink)" : "var(--color-line)"}`, background: hours === String(h) ? "var(--color-ink)" : "transparent", color: hours === String(h) ? "var(--color-surface)" : "var(--color-ink-soft)", cursor: "pointer" }}>{h}h</button>
                  ))}
                  <input type="number" min={1} max={23} placeholder="Custom" value={![...Array(8)].map((_, i) => String(i + 1)).includes(hours) ? hours : ""} onChange={e => setHours(e.target.value)} style={{ width: 80, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", fontSize: 13 }} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>Which day?</p>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>
                  <input type="checkbox" checked={asap} onChange={e => setAsap(e.target.checked)} style={{ accentColor: "var(--color-ink)" }} />
                  ASAP
                </label>
                {!asap && <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setDeadline(`${e.target.value}T23:59`); }} style={{ ...inputStyle, width: "auto" }} />}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>What time?</p>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>Start time</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
                  </div>
                  <span style={{ paddingBottom: 14, color: "var(--color-ink-mute)", fontSize: 14 }}>→</span>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>End time</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* About a week: start → end date → days → time (if days selected) */}
          {duration === "about_a_week" && (
            <>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>Start date</label>
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setDeadline(`${e.target.value}T23:59`); }} style={{ ...inputStyle }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>End date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle }} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>Which days?</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAYS_SHORT.map((d, i) => (
                    <button key={d} type="button" onClick={() => toggleDay(i)} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1.5px solid ${daysOfWeek.includes(i) ? "var(--color-ink)" : "var(--color-line)"}`, background: daysOfWeek.includes(i) ? "var(--color-ink)" : "transparent", color: daysOfWeek.includes(i) ? "var(--color-surface)" : "var(--color-ink-soft)", cursor: "pointer" }}>{d}</button>
                  ))}
                </div>
              </div>
              {daysOfWeek.length > 0 && (
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>What time? <span style={{ fontSize: 12, color: "var(--color-ink-mute)", fontWeight: 400 }}>(optional)</span></p>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>Start time</label>
                      <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <span style={{ paddingBottom: 14, color: "var(--color-ink-mute)", fontSize: 14 }}>→</span>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>End time</label>
                      <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 2 weeks – 6 months+: start → end date → optional schedule */}
          {(duration === "2_weeks" || duration === "1_month" || duration === "2_3_months" || duration === "6_months_plus") && (
            <>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>Start date</label>
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setDeadline(`${e.target.value}T23:59`); }} style={{ ...inputStyle }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>End date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle }} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>Regular schedule? <span style={{ fontSize: 12, color: "var(--color-ink-mute)", fontWeight: 400 }}>(optional)</span></p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAYS_SHORT.map((d, i) => (
                    <button key={d} type="button" onClick={() => toggleDay(i)} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1.5px solid ${daysOfWeek.includes(i) ? "var(--color-ink)" : "var(--color-line)"}`, background: daysOfWeek.includes(i) ? "var(--color-ink)" : "transparent", color: daysOfWeek.includes(i) ? "var(--color-surface)" : "var(--color-ink-soft)", cursor: "pointer" }}>{d}</button>
                  ))}
                </div>
              </div>
              {daysOfWeek.length > 0 && (
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>What time?</p>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>Start time</label>
                      <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <span style={{ paddingBottom: 14, color: "var(--color-ink-mute)", fontSize: 14 }}>→</span>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>End time</label>
                      <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Ongoing: start → end date → cadence → days → time */}
          {duration === "ongoing" && (
            <>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>Start date</label>
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setDeadline(`${e.target.value}T23:59`); }} style={{ ...inputStyle }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>End date <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-soft)", display: "block", marginBottom: 8 }}>How often?</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CADENCE_OPTIONS.map(c => (
                    <button key={c} type="button" onClick={() => setCadence(c)} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1.5px solid ${cadence === c ? "var(--color-ink)" : "var(--color-line)"}`, background: cadence === c ? "var(--color-ink)" : "transparent", color: cadence === c ? "var(--color-surface)" : "var(--color-ink-soft)", cursor: "pointer" }}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>Which days?</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAYS_SHORT.map((d, i) => (
                    <button key={d} type="button" onClick={() => toggleDay(i)} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1.5px solid ${daysOfWeek.includes(i) ? "var(--color-ink)" : "var(--color-line)"}`, background: daysOfWeek.includes(i) ? "var(--color-ink)" : "transparent", color: daysOfWeek.includes(i) ? "var(--color-surface)" : "var(--color-ink-soft)", cursor: "pointer" }}>{d}</button>
                  ))}
                </div>
              </div>
              {daysOfWeek.length > 0 && (
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>What time?</p>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>Start time</label>
                      <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <span style={{ paddingBottom: 14, color: "var(--color-ink-mute)", fontSize: 14 }}>→</span>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>End time</label>
                      <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Project-based: start → end date → milestones */}
          {duration === "project_based" && (
            <>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>Start date</label>
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setDeadline(`${e.target.value}T23:59`); }} style={{ ...inputStyle }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 4 }}>End date <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle }} />
                </div>
              </div>
              <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--color-surface)", border: "1px solid var(--color-line)" }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-soft)", display: "block", marginBottom: 12 }}>Milestones</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {milestones.map((ms, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="text" placeholder={`Milestone ${i + 1} (e.g. First draft)`} value={ms.name} onChange={e => updateMilestone(i, "name", e.target.value)} style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", fontSize: 13, color: "var(--color-ink)" }} />
                        {milestones.length > 1 && (
                          <button type="button" onClick={() => removeMilestone(i)} style={{ flexShrink: 0, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-ink-mute)", cursor: "pointer", fontSize: 13 }}>✕</button>
                        )}
                      </div>
                      <input type="date" value={ms.due_date} onChange={e => updateMilestone(i, "due_date", e.target.value)} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", fontSize: 13, color: "var(--color-ink)", width: "100%", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addMilestone} style={{ marginTop: 10, padding: "6px 14px", borderRadius: 999, border: "1px dashed var(--color-line)", background: "transparent", fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)", cursor: "pointer" }}>+ Add milestone</button>
              </div>
            </>
          )}

          {/* Until a specific date: start date → end date */}
          {duration === "specific_date" && (
            <>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>Start date</p>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>
                  <input type="checkbox" checked={asap} onChange={e => setAsap(e.target.checked)} style={{ accentColor: "var(--color-ink)" }} />
                  ASAP
                </label>
                {!asap && <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, width: "auto" }} />}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>End date</p>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle, width: "auto" }} />
              </div>
            </>
          )}
        </div>

        {/* Gig mode section */}
        <div style={{ borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: 0 }}>Gig mode</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer",
              borderRadius: 12, border: `1px solid ${gigMode === "approval" ? "var(--color-ink)" : "var(--color-line)"}`,
              padding: 16, background: gigMode === "approval" ? "var(--color-surface)" : "transparent", transition: "all 0.15s",
            }}>
              <input
                type="radio"
                name="gig_mode"
                value="approval"
                checked={gigMode === "approval"}
                onChange={() => setGigMode("approval")}
                style={{ marginTop: 2, accentColor: "var(--color-ink)" }}
              />
              <span>
                <strong style={{ fontSize: 14 }}>Require employer approval</strong>
                <span style={{ display: "block", fontSize: 12, color: "var(--color-ink-soft)", marginTop: 3 }}>
                  You manually hire or reject each applicant after reviewing their profile and interview.
                </span>
              </span>
            </label>

            <label style={{
              display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer",
              borderRadius: 12, border: `1px solid ${gigMode === "instant" ? "var(--color-ink)" : "var(--color-line)"}`,
              padding: 16, background: gigMode === "instant" ? "var(--color-surface)" : "transparent", transition: "all 0.15s",
            }}>
              <input
                type="radio"
                name="gig_mode"
                value="instant"
                checked={gigMode === "instant"}
                onChange={() => setGigMode("instant")}
                style={{ marginTop: 2, accentColor: "var(--color-ink)" }}
              />
              <span>
                <strong style={{ fontSize: 14 }}>Instant gig</strong>
                <span style={{ display: "block", fontSize: 12, color: "var(--color-ink-soft)", marginTop: 3 }}>
                  Freelancers can accept immediately with no application process.
                </span>
              </span>
            </label>
          </div>

          {gigMode === "instant" && (
            <div>
              <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 6 }}>Urgency</label>
              <select style={selectStyle}>
                <option value="now">Now (within the hour)</option>
                <option value="today">Today</option>
                <option value="weekend">This weekend</option>
              </select>
            </div>
          )}

          {gigMode === "approval" && (
            <div>
              <label style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "block", marginBottom: 6 }}>
                Application deadline{" "}
                <span style={{ opacity: 0.5 }}>(optional — leave blank for no deadline)</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                style={{ ...inputStyle, width: "auto" }}
              />
              <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: "6px 0 0" }}>Time is in Singapore time (SGT, UTC+8). Defaults to job start date.</p>
            </div>
          )}
        </div>

      </form>
        </div>
      </div>

      {/* Persistent footer — always visible regardless of scroll position */}
      <div style={{ flexShrink: 0, borderTop: "1px solid var(--color-line)", background: "var(--color-surface)", padding: viewMode === "desktop" ? "14px 24px" : "12px 16px" }}>
        <div style={viewMode === "desktop" ? { maxWidth: 768, margin: "0 auto" } : {}}>
          <button
            type="submit"
            form="post-gig-form"
            disabled={!form.title.trim()}
            style={{
              padding: "13px 28px",
              borderRadius: 999,
              border: "none",
              background: form.title.trim() ? "var(--color-ink)" : "var(--color-muted)",
              color: form.title.trim() ? "var(--color-surface)" : "var(--color-ink-mute)",
              fontSize: 15,
              fontWeight: 700,
              cursor: form.title.trim() ? "pointer" : "default",
            }}
          >
            Publish gig →
          </button>
        </div>
      </div>
    </div>
  );
}
