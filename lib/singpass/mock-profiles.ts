// Pretend MyInfo payloads keyed by NRIC for the demo.
// Only used to prefill the onboarding form so a demo reviewer
// sees realistic SG data without entering anything.

export interface MockMyInfo {
  full_name: string;
  handle_hint: string;
  headline: string;
  bio: string;
  suggested_role: "freelancer" | "employer" | "both";
  postal_sector?: string;
}

export const MOCK_MYINFO: Record<string, MockMyInfo> = {
  S1234567D: {
    full_name: "Arif Rahman",
    handle_hint: "arif_rahman",
    headline: "UX designer · WSQ-certified",
    bio: "Hybrid designer at a local fintech by day, side projects for F&B brands at night.",
    suggested_role: "freelancer",
  },
  S2345678H: {
    full_name: "Priya Krishnan",
    handle_hint: "priya_sg",
    headline: "Tuition teacher · A-level Maths & Physics",
    bio: "WSQ ACTA certified, 5 years with tuition centres in Tampines and Bukit Timah.",
    suggested_role: "freelancer",
  },
  S3456789A: {
    full_name: "Wei Jie Tan",
    handle_hint: "weijie",
    headline: "Full-stack dev · open to contract",
    bio: "Graduated NUS CS 2022, currently freelancing after returning from a stint in Tokyo.",
    suggested_role: "freelancer",
  },
  T0123456G: {
    full_name: "Siti Nurhaliza",
    handle_hint: "siti_mc",
    headline: "Emcee · Event host · Trilingual",
    bio: "English, Malay, Bahasa. Weddings, corporate D&Ds, product launches.",
    suggested_role: "freelancer",
  },
};
