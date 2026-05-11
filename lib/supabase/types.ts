// Hand-written database types (keep in sync with supabase/migrations).
// For production, replace with `supabase gen types typescript`.

export type Role = "freelancer" | "employer" | "both";
export type CertKind = "wsq" | "university" | "accreditation" | "other";
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
  extracted_skills: string[];
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
  applications_close_at: string | null;
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
