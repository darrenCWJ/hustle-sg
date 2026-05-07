-- Add onboarding wizard and app tour completion tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz;
