-- Resume Genie core tables (anonymous session-scoped)

CREATE TABLE IF NOT EXISTS documents (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS documents_session_id_idx ON documents (session_id);

CREATE TABLE IF NOT EXISTS jobs (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  url text NOT NULL,
  title text,
  company text,
  location text,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS jobs_session_id_idx ON jobs (session_id);

CREATE TABLE IF NOT EXISTS applications (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  job_id integer NOT NULL,
  job_title text,
  job_company text,
  resume text,
  cover_letter text,
  status text NOT NULL DEFAULT 'generating',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS applications_session_id_idx ON applications (session_id);

CREATE TABLE IF NOT EXISTS generation_usage (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  ip text NOT NULL,
  day text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS generation_usage_day_session_idx ON generation_usage (day, session_id);
CREATE INDEX IF NOT EXISTS generation_usage_day_ip_idx ON generation_usage (day, ip);
