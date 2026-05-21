CREATE TABLE IF NOT EXISTS demo_sessions (
  id         text        PRIMARY KEY,
  state      jsonb       NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_anon_all" ON demo_sessions
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
