"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveRole } from "./actions";

export interface OnboardingCompleted {
  profile: boolean;
  portfolio: boolean;
  cert: boolean;
  gig: boolean;
}

type StepDef = {
  n: number;
  title: string;
  body: string;
  href: string;
  doneKey: keyof OnboardingCompleted | null;
};

const BOTH_STEPS: StepDef[] = [
  {
    n: 1,
    title: "Finish your profile",
    body: "One profile covers both sides — employers and candidates will see it.",
    href: "/profile/edit",
    doneKey: "profile",
  },
  {
    n: 2,
    title: "Post your first assignment",
    body: "Start hiring straight away — takes under 2 minutes.",
    href: "/gigs/new",
    doneKey: "gig",
  },
  {
    n: 3,
    title: "Browse the gig feed",
    body: "See what's open and get AI-matched to assignments that fit you.",
    href: "/feed",
    doneKey: null,
  },
];

const WORKER_STEPS: StepDef[] = [
  {
    n: 1,
    title: "Finish your profile",
    body: "Headline, bio, and a real photo — employers screen fast.",
    href: "/profile/edit",
    doneKey: "profile",
  },
  {
    n: 2,
    title: "Upload one portfolio video",
    body: "90 seconds showing what you actually do. Raw and real beats polished.",
    href: "/profile/edit#portfolio",
    doneKey: "portfolio",
  },
  {
    n: 3,
    title: "Add a certification",
    body: "WSQ, university and accreditation certs are reviewed by our team before the verified badge shows.",
    href: "/profile/edit#certifications",
    doneKey: "cert",
  },
];

const EMPLOYER_STEPS: StepDef[] = [
  {
    n: 1,
    title: "Post your first assignment",
    body: "Add a title, skills needed, and budget. Takes under 2 minutes.",
    href: "/gigs/new",
    doneKey: "gig",
  },
  {
    n: 2,
    title: "Set up your profile",
    body: "Freelancers check who's hiring. A complete profile builds trust.",
    href: "/profile/edit",
    doneKey: "profile",
  },
  {
    n: 3,
    title: "Review applicants",
    body: "Watch async video interviews and shortlist from your dashboard.",
    href: "/dashboard",
    doneKey: null,
  },
];

interface Props {
  displayName: string;
  next: string;
  singpassVerified: boolean;
  completed: OnboardingCompleted;
}

export function OnboardingFlow({ displayName, next, singpassVerified, completed }: Props) {
  const [step, setStep] = useState<"role" | "steps">("role");
  const [role, setRole] = useState<"freelancer" | "employer" | "both" | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSelectRole = (selected: "freelancer" | "employer" | "both") => {
    setRole(selected);
    setStep("steps");
    startTransition(async () => {
      await saveRole(selected);
    });
  };

  if (step === "role") {
    return (
      <div className="w-full max-w-xl">
        {/* Only claim verification when it's true (Phase 5.3) — email-OTP
            accounts are not identity-verified. */}
        {singpassVerified ? (
          <p className="text-xs uppercase tracking-widest text-trust font-semibold">
            ✓ Singpass verified
          </p>
        ) : (
          <p className="text-xs uppercase tracking-widest text-ink-soft font-semibold">
            Signed in
          </p>
        )}
        <h1 className="font-display text-display-md mt-3 mb-3">
          Welcome, {displayName}.
        </h1>
        <p className="text-ink-soft mb-10">What brings you to HustleSG?</p>

        <div className="space-y-4">
          <RoleCard
            icon="💼"
            title="I'm looking for work"
            body="Browse gigs, get AI-matched to assignments, and build your freelance profile."
            onClick={() => onSelectRole("freelancer")}
            disabled={isPending}
          />
          <RoleCard
            icon="🔍"
            title="I'm looking to hire"
            body="Post assignments, review async video interviews, and shortlist candidates."
            onClick={() => onSelectRole("employer")}
            disabled={isPending}
          />
          <RoleCard
            icon="⚡"
            title="I do both"
            body="Hire for your projects and take on gigs yourself — same account, both sides."
            onClick={() => onSelectRole("both")}
            disabled={isPending}
          />
        </div>
      </div>
    );
  }

  const steps = role === "employer" ? EMPLOYER_STEPS : role === "both" ? BOTH_STEPS : WORKER_STEPS;
  const doneCount = steps.filter((s) => s.doneKey && completed[s.doneKey]).length;
  const trackable = steps.filter((s) => s.doneKey).length;
  const continueHref = role === "freelancer" ? next || "/feed" : "/dashboard";
  const continueLabel = role === "freelancer" ? "Continue to your matched feed →" : "Continue to dashboard →";

  return (
    <div className="w-full max-w-xl">
      {singpassVerified ? (
        <p className="text-xs uppercase tracking-widest text-trust font-semibold">
          ✓ Singpass verified
        </p>
      ) : (
        <p className="text-xs uppercase tracking-widest text-ink-soft font-semibold">
          Signed in
        </p>
      )}
      <h1 className="font-display text-display-md mt-3 mb-6">
        {role === "employer" ? "Let's get you hiring." : role === "both" ? "You're set up for both sides." : "Let's get you matched."}
      </h1>
      <p className="text-ink-soft mb-4">
        {role === "employer"
          ? "A few things to set up before your first applicant arrives:"
          : role === "both"
          ? "Your account works for hiring and finding work. Here's where to start:"
          : "Next steps to start getting matched:"}
      </p>
      {/* Live progress, not a static to-do list (Phase 5.3). */}
      <p className="text-xs font-semibold text-ink-mute mb-6">
        {doneCount} of {trackable} done
      </p>

      <div className="space-y-3 mb-10">
        {steps.map((s) => (
          <OnboardingCard
            key={s.n}
            {...s}
            done={Boolean(s.doneKey && completed[s.doneKey])}
          />
        ))}
      </div>

      <Link
        href={continueHref}
        className="inline-block rounded-xl bg-ink text-surface px-6 py-3 font-semibold hover:bg-accent-ink transition"
      >
        {continueLabel}
      </Link>
      <p className="text-xs text-ink-mute mt-3">
        You can finish these steps any time from your profile.
      </p>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  body,
  onClick,
  disabled,
}: {
  icon: string;
  title: string;
  body: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group w-full text-left flex gap-4 p-5 rounded-card border border-line bg-surface-raised hover:border-accent hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-normal ease-out-expo"
    >
      <span className="shrink-0 text-2xl">{icon}</span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-ink-soft mt-1">{body}</p>
      </div>
      <span className="ml-auto text-ink-soft group-hover:text-accent transition self-center">→</span>
    </button>
  );
}

function OnboardingCard({
  n,
  title,
  body,
  href,
  done,
}: {
  n: number;
  title: string;
  body: string;
  href: string;
  done: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-4 p-5 rounded-card border border-line bg-surface-raised hover:border-accent hover:-translate-y-0.5 transition-all duration-normal ease-out-expo"
      aria-label={done ? `${title} (done)` : title}
    >
      <div
        className={`shrink-0 h-10 w-10 rounded-full font-display grid place-items-center text-lg ${
          done ? "bg-jade-soft text-jade-ink" : "bg-accent-soft text-accent-ink"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <div>
        <h3 className={`font-semibold ${done ? "line-through opacity-60" : ""}`}>{title}</h3>
        <p className="text-sm text-ink-soft">{body}</p>
      </div>
      <span className="ml-auto text-ink-soft group-hover:text-accent transition">→</span>
    </Link>
  );
}
