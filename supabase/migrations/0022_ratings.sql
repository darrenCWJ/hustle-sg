-- Add 'completed' status to applications check constraint
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('applied','interviewing','shortlisted','hired','rejected','withdrawn','completed','offered'));

-- Ratings table: one rating per direction per application (employer→worker + worker→employer)
CREATE TABLE IF NOT EXISTS ratings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  gig_id       uuid NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  from_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stars        int  NOT NULL CHECK (stars BETWEEN 1 AND 5),
  review       text NOT NULL CHECK (char_length(review) BETWEEN 1 AND 300),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, from_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read ratings
CREATE POLICY "ratings_select" ON ratings
  FOR SELECT TO authenticated USING (true);

-- Only the rater (from_id = current user) can insert their own rating
CREATE POLICY "ratings_insert" ON ratings
  FOR INSERT TO authenticated WITH CHECK (from_id = auth.uid());
