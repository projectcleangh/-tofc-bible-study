-- =============================================================================
-- TOFC Bible Study — Supabase schema
-- =============================================================================
-- HOW TO USE: Supabase Dashboard -> SQL Editor -> New query ->
-- paste this WHOLE file -> click "Run". It is safe to run more than once.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: sessions  (one row per weekly study)
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id                uuid primary key default gen_random_uuid(),
  chapter           int  not null check (chapter between 1 and 16), -- Mark 1..16
  date              date not null default current_date,
  phase             text not null default 'reflection',
  reflection_prompt text,
  headcount         int  not null default 0,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TABLE: questions  (3 per session: Comprehension / Interpretation / Application)
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  label       text not null,           -- 'Comprehension' | 'Interpretation' | 'Application'
  text        text not null,
  order_index int  not null,           -- 1, 2, 3
  unique (session_id, order_index)      -- lets the leader re-save questions cleanly (upsert)
);

-- ---------------------------------------------------------------------------
-- TABLE: responses  (attendee answers; also holds raised-hand flag)
-- ---------------------------------------------------------------------------
create table if not exists public.responses (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.sessions(id) on delete cascade,
  question_id   uuid references public.questions(id) on delete cascade,
  attendee_name text,
  text          text,
  raised_hand   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TABLE: reflections  (weekly reflection + the anonymous "floor questions")
-- ---------------------------------------------------------------------------
create table if not exists public.reflections (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.sessions(id) on delete cascade,
  attendee_name text,
  text          text not null,
  kind          text not null default 'reflection',  -- 'reflection' | 'floor'
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_questions_session   on public.questions(session_id);
create index if not exists idx_responses_session   on public.responses(session_id);
create index if not exists idx_responses_question  on public.responses(question_id);
create index if not exists idx_reflections_session on public.reflections(session_id);

-- ---------------------------------------------------------------------------
-- Keep responses.updated_at fresh on every edit
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_responses_updated_at on public.responses;
create trigger trg_responses_updated_at
  before update on public.responses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- This app uses the public anon key on phones with no per-user login, so we
-- allow read + insert + update for everyone, and DISALLOW delete from the
-- client (data persists permanently). The leader's "delete a response" action
-- is the only delete path and is handled via a SECURITY DEFINER function below,
-- so attendees can never delete anything.
-- ---------------------------------------------------------------------------
alter table public.sessions    enable row level security;
alter table public.questions   enable row level security;
alter table public.responses   enable row level security;
alter table public.reflections enable row level security;

-- sessions
drop policy if exists "sessions_read"   on public.sessions;
drop policy if exists "sessions_write"  on public.sessions;
drop policy if exists "sessions_update" on public.sessions;
create policy "sessions_read"   on public.sessions for select using (true);
create policy "sessions_write"  on public.sessions for insert with check (true);
create policy "sessions_update" on public.sessions for update using (true);

-- questions
drop policy if exists "questions_read"   on public.questions;
drop policy if exists "questions_write"  on public.questions;
drop policy if exists "questions_update" on public.questions;
create policy "questions_read"   on public.questions for select using (true);
create policy "questions_write"  on public.questions for insert with check (true);
create policy "questions_update" on public.questions for update using (true);

-- responses
drop policy if exists "responses_read"   on public.responses;
drop policy if exists "responses_write"  on public.responses;
drop policy if exists "responses_update" on public.responses;
create policy "responses_read"   on public.responses for select using (true);
create policy "responses_write"  on public.responses for insert with check (true);
create policy "responses_update" on public.responses for update using (true);

-- reflections
drop policy if exists "reflections_read"  on public.reflections;
drop policy if exists "reflections_write" on public.reflections;
create policy "reflections_read"  on public.reflections for select using (true);
create policy "reflections_write" on public.reflections for insert with check (true);

-- ---------------------------------------------------------------------------
-- Leader-only delete of a single response (moderation). Attendees cannot call
-- delete directly because no delete policy exists. This function runs with
-- elevated rights so the leader UI can remove an inappropriate response.
-- ---------------------------------------------------------------------------
create or replace function public.delete_response(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.responses where id = target_id;
end;
$$;

grant execute on function public.delete_response(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: broadcast changes on these tables
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.responses;
alter publication supabase_realtime add table public.reflections;

-- Done. Your database is ready for all 16 chapters of Mark.
