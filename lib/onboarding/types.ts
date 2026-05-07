import type { Role } from "@/lib/supabase/types";

export const ONBOARDING_STEPS = [
  "welcome",
  "role",
  "profile",
  "skills",
  "portfolio",
  "certification",
  "review",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface WizardState {
  currentStep: number;
  role: Role | null;
  displayName: string;
  handle: string;
  headline: string;
  bio: string;
  avatarUrl: string | null;
  skills: string[];
  portfolioUrl: string | null;
  portfolioTitle: string;
  certFile: string | null;
  certTitle: string;
}

export const INITIAL_WIZARD_STATE: WizardState = {
  currentStep: 0,
  role: null,
  displayName: "",
  handle: "",
  headline: "",
  bio: "",
  avatarUrl: null,
  skills: [],
  portfolioUrl: null,
  portfolioTitle: "",
  certFile: null,
  certTitle: "",
};

export const SKILL_CATEGORIES = [
  "Graphic Design",
  "UI/UX Design",
  "Web Development",
  "Mobile Development",
  "Video Editing",
  "Photography",
  "Tuition & Teaching",
  "Translation",
  "Events & Emcee",
  "F&B Service",
  "Music & Audio",
  "Writing & Copywriting",
  "Social Media",
  "Data Entry",
  "Admin & Ops",
  "Engineering",
] as const;
