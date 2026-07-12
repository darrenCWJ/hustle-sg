// App-level domain types layered over the GENERATED schema types.
//
// The source of truth for table shapes is lib/supabase/database.types.ts
// (regenerated from the live schema — see that file's header). The interfaces
// below narrow generated `string` columns to their domain unions (Role,
// GigStatus, …) for app code; keep them structurally compatible with the
// generated Row types.
export type { Database, Json, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

export type Role = "freelancer" | "employer" | "both";
export type CertKind = "wsq" | "university" | "accreditation" | "other";
export type VerificationStatus = "pending" | "verified" | "rejected" | "manual_review";
export type PortfolioKind = "video" | "website" | "image" | "writeup";
export type GigStatus = "open" | "closed" | "filled";
export type BudgetKind = "fixed" | "hourly";
export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "hired"
  | "rejected"
  | "withdrawn"
  | "offered";
export type EntityType = "sole_prop" | "pte_ltd";
export type RegistrationStage = "exploring" | "name_reserved" | "registered";

export interface Profile {
  id: string;
  handle: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: Role;
  nric_hash: string | null;
  singpass_verified_at: string | null;
  lat: number | null;
  lon: number | null;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  kind: CertKind;
  issuer: string;
  title: string;
  issued_at: string | null;
  doc_url: string | null;
  verified: boolean;
  verification_status: VerificationStatus;
  verification_method: string | null;
  verified_at: string | null;
  extracted_skills: string[];
  created_at: string;
}

export interface WorkHistory {
  id: string;
  user_id: string;
  company: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  kind: PortfolioKind;
  media_url: string | null;
  external_url: string | null;
  title: string;
  description: string | null;
  tags: string[];
  display_order: number;
  created_at: string;
}

export interface Gig {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  skills_required: string[];
  location: string | null;
  budget_cents: number | null;
  budget_kind: BudgetKind;
  category: string | null;
  status: GigStatus;
  requires_employer_approval: boolean;
  is_instant: boolean;
  instant_urgency: string | null;
  headcount: number;
  lat: number | null;
  lon: number | null;
  start_at: string | null;
  applications_close_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  duration_label: string | null;
  hours_required: number | null;
  recurrence_cadence: string | null;
  milestones: unknown[];
  start_time: string | null;
  end_time: string | null;
  days_of_week: number[];
  created_at: string;
}

export interface Application {
  id: string;
  gig_id: string;
  applicant_id: string;
  cover_note: string | null;
  status: ApplicationStatus;
  created_at: string;
}

export interface InterviewQuestion {
  id: string;
  gig_id: string;
  prompt: string;
  max_duration_sec: number;
  display_order: number;
}

export interface InterviewResponse {
  id: string;
  application_id: string;
  question_id: string;
  video_url: string;
  duration_sec: number | null;
  created_at: string;
}

export interface CompanyRegistration {
  id: string;
  user_id: string;
  entity_type: EntityType | null;
  proposed_name: string | null;
  business_activities: string[];
  stage: RegistrationStage;
  mock_acra_id: string | null;
  checklist_state: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MatchGigRow {
  gig_id: string;
  title: string;
  description: string;
  employer_id: string;
  skills_required: string[];
  budget_cents: number | null;
  budget_kind: string | null;
  category: string | null;
  location: string | null;
  score: number;
  applications_close_at: string | null;
  distance_km: number | null;
}

export interface MatchInstantGigRow {
  gig_id: string;
  title: string;
  description: string | null;
  employer_id: string;
  location: string | null;
  lat: number | null;
  lon: number | null;
  budget_cents: number;
  budget_kind: string;
  instant_urgency: string;
  skills_required: string[];
  score: number;
  distance_km: number | null;
}
