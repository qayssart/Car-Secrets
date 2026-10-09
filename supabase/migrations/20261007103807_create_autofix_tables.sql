/*
# AutoFix AI - Create diagnostic logs, mechanic requests, and repair jobs tables

## Overview
Creates the core data tables for the AutoFix AI car diagnostics application.
This is a single-tenant app with no authentication — users pick a role
(Car Owner or Mechanic) in the UI. All data is shared (anon-accessible).

## New Tables

### 1. diagnostic_logs
Stores completed diagnostic sessions from the interactive wizard.
- id (uuid, PK)
- owner_name (text) — name of the car owner who ran the diagnosis
- car_make (text) — e.g. "Toyota"
- car_model (text) — e.g. "Camry"
- car_year (text) — e.g. "2019"
- system_name (text) — which of the 6 car systems was diagnosed
- symptoms (jsonb) — array of selected symptom names
- follow_up_answers (jsonb) — object mapping follow-up questions to selected answers
- causes (jsonb) — array of { cause, fix, severity } objects
- severity (text) — overall severity: low | medium | high | critical
- notes (text) — optional owner notes
- created_at (timestamptz)

### 2. mechanic_requests
Stores requests sent by car owners to nearby mechanics, referencing a diagnostic log.
- id (uuid, PK)
- diagnostic_log_id (uuid, FK -> diagnostic_logs.id, ON DELETE CASCADE)
- owner_name (text)
- owner_contact (text) — phone or email
- car_info (text) — formatted "2019 Toyota Camry"
- system_name (text)
- symptoms (jsonb)
- causes (jsonb)
- severity (text)
- location (text) — owner's location/area
- status (text) — pending | accepted | declined | completed
- mechanic_notes (text) — notes from the mechanic
- created_at (timestamptz)

### 3. repair_jobs
Jobs created by mechanics from accepted requests, for appointment/work tracking.
- id (uuid, PK)
- request_id (uuid, FK -> mechanic_requests.id, ON DELETE CASCADE)
- owner_name (text)
- car_info (text)
- system_name (text)
- status (text) — scheduled | in_progress | completed | cancelled
- scheduled_date (timestamptz)
- estimated_cost (numeric)
- actual_cost (numeric)
- notes (text)
- created_at (timestamptz)

## Security
- RLS enabled on all three tables.
- Policies allow anon + authenticated full CRUD (single-tenant, no-auth, shared data).
- USING (true) is intentional here — all data is public/shared by design.
*/

CREATE TABLE IF NOT EXISTS diagnostic_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text NOT NULL DEFAULT 'Anonymous',
  car_make text,
  car_model text,
  car_year text,
  system_name text NOT NULL,
  symptoms jsonb NOT NULL DEFAULT '[]',
  follow_up_answers jsonb DEFAULT '{}',
  causes jsonb NOT NULL DEFAULT '[]',
  severity text NOT NULL DEFAULT 'low',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE diagnostic_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_diagnostic_logs" ON diagnostic_logs;
CREATE POLICY "anon_select_diagnostic_logs" ON diagnostic_logs FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_diagnostic_logs" ON diagnostic_logs;
CREATE POLICY "anon_insert_diagnostic_logs" ON diagnostic_logs FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_diagnostic_logs" ON diagnostic_logs;
CREATE POLICY "anon_update_diagnostic_logs" ON diagnostic_logs FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_diagnostic_logs" ON diagnostic_logs;
CREATE POLICY "anon_delete_diagnostic_logs" ON diagnostic_logs FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS mechanic_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_log_id uuid REFERENCES diagnostic_logs(id) ON DELETE CASCADE,
  owner_name text NOT NULL DEFAULT 'Anonymous',
  owner_contact text,
  car_info text,
  system_name text NOT NULL,
  symptoms jsonb NOT NULL DEFAULT '[]',
  causes jsonb NOT NULL DEFAULT '[]',
  severity text NOT NULL DEFAULT 'low',
  location text,
  status text NOT NULL DEFAULT 'pending',
  mechanic_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mechanic_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_mechanic_requests" ON mechanic_requests;
CREATE POLICY "anon_select_mechanic_requests" ON mechanic_requests FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_mechanic_requests" ON mechanic_requests;
CREATE POLICY "anon_insert_mechanic_requests" ON mechanic_requests FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_mechanic_requests" ON mechanic_requests;
CREATE POLICY "anon_update_mechanic_requests" ON mechanic_requests FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_mechanic_requests" ON mechanic_requests;
CREATE POLICY "anon_delete_mechanic_requests" ON mechanic_requests FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS repair_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES mechanic_requests(id) ON DELETE CASCADE,
  owner_name text NOT NULL DEFAULT 'Anonymous',
  car_info text,
  system_name text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  scheduled_date timestamptz,
  estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE repair_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_repair_jobs" ON repair_jobs;
CREATE POLICY "anon_select_repair_jobs" ON repair_jobs FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_repair_jobs" ON repair_jobs;
CREATE POLICY "anon_insert_repair_jobs" ON repair_jobs FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_repair_jobs" ON repair_jobs;
CREATE POLICY "anon_update_repair_jobs" ON repair_jobs FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_repair_jobs" ON repair_jobs;
CREATE POLICY "anon_delete_repair_jobs" ON repair_jobs FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_diagnostic_logs_created_at ON diagnostic_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mechanic_requests_status ON mechanic_requests(status);
CREATE INDEX IF NOT EXISTS idx_mechanic_requests_created_at ON mechanic_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_status ON repair_jobs(status);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_scheduled_date ON repair_jobs(scheduled_date);
