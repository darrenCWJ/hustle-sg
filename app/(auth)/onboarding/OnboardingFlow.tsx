"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveRole } from "./actions";

const BOTH_STEPS = [
  {
    n: 1,
    title: "Finish your profile",
    body: "One profile covers both sides — employers and candidates will see it.",
    href: "/profile/edit",
  },
  {
    n: 2,
    title: "Post your first assignment",
    body: "Start hiring straight away — takes under 2 minutes.",
    href: "/gigs/new",
  },
  {
    n: 3,
    title: "Browse the gig feed",
    body: "See what's open and get AI-matched to assignments that fit you.",
    href: "/feed",
  },
];

const WORKER_STEPS = [
  {
    n: 1,
    title: "Finish your profile",
    body: "Headline, bio, and a real photo — employers screen fast.",
    href: "/profile/edit",
  },
  {
    n: 2,
    title: "Upload one portfolio video",
    body: "90 seconds showing what you actually do. Raw and real beats polished.",
    href: "/profile/edit#portfolio",
  },
  {
    n: 3,
    title: "Verify a certification",
    body: "WSQ, NUS, NTU, SMU, IES, and others get a verified badge instantly.",
    href: "/profile/edit#certifications",
  },
];

const EMPLOYER_STEPS = [
  {
    n: 1,
    title: "Post your first assignment",
    body: "Add a title, skills needed, and budget. Takes under 2 minutes.",
    href: "/gigs/new",
  },
  {
    n: 2,
    title: "Set up your profile",
    body: "Freelancers check who's hiring. A complete profile builds trust.",
    href: "/profile/edit",
  },
  {
    n: 3,
    title: "Review applicants",
    body: "Watch async video interviews and shortlist from your dashboard.",
    href: "/dashboard",
  },
];

interface Props {
  displayName: string;
  next: string;
}

export function OnboardingFlow({ displayName, next }: Props) {
  const [step, setStep] = useState<"role" | "steps">("role");
  const [role, setRole] = useState<"freelancer" | "employer" | "both" | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSelectRole = (selected: "freelancer" | "employer" | "both") => {
    setRole(selected);
    startTransition(async () => {
      await saveRole(selected);
      setStep("steps");
    });
  };

  if (step === "role") {
    return (
      <div className="w-full max-w-xl">
        <p className="text-xs uppercase tracking-widest text-trust font-semibold">
          ✓ Singpass verified
        </p>
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
  const skipHref = role === "freelancer" ? next || "/feed" : "/dashboard";
  const skipLabel = role === "freelancer" ? "Skip to AI-matched feed →" : "Go to dashboard →";

  return (
    <div className="w-full max-w-xl">
      <p className="text-xs uppercase tracking-widest text-trust font-semibold">
        ✓ Singpass verified
      </p>
      <h1 className="font-display text-display-md mt-3 mb-6">
        {role === "employer" ? "Let's get you hiring." : role === "both" ? "You're set up for both sides." : "Let's get you matched."}
      </h1>
      <p className="text-ink-soft mb-10">
        {role === "employer"
          ? "A few things to set up before your first applicant arrives:"
          : role === "both"
          ? "Your account works for hiring and finding work. Here's where to start:"
          : "We've pre-filled a profile using MyInfo mock data. Next steps:"}
      </p>

      <div className="space-y-3 mb-10">
        {steps.map((s) => (
          <OnboardingCard key={s.n} {...s} />
        ))}
      </div>

      <Link
        href={skipHref}
        className="inline-block rounded-xl bg-ink text-surface px-6 py-3 font-semibold hover:bg-accent-ink transition"
      >
        {skipLabel}
      </Link>
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
}: {
  n: number;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-4 p-5 rounded-card border border-line bg-surface-raised hover:border-accent hover:-translate-y-0.5 transition-all duration-normal ease-out-expo"
    >
      <div className="shrink-0 h-10 w-10 rounded-full bg-accent-soft text-accent-ink font-display grid place-items-center text-lg">
        {n}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-ink-soft">{body}</p>
      </div>
      <span className="ml-auto text-ink-soft group-hover:text-accent transition">→</span>
    </Link>
  );
}
