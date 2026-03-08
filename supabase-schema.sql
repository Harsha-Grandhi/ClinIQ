-- ============================================
-- ClinIQ Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  year_of_study text not null,
  specialty_preferences text[] not null default '{}',
  elo_rating integer not null default 1000,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_played_date text,
  total_cases_played integer not null default 0,
  total_correct_first integer not null default 0,
  badges text[] not null default '{}',
  weekly_score integer not null default 0,
  week_start text,
  created_at timestamptz not null default now()
);

-- 2. Case results table
create table public.case_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id text not null,
  case_title text not null,
  specialty text not null,
  difficulty text not null,
  correct_diagnosis text not null,
  student_diagnosis text not null,
  was_correct boolean not null,
  attempts_used integer not null,
  final_score integer not null,
  grade text not null,
  elo_change integer not null,
  investigations_used jsonb not null default '{}',
  played_at timestamptz not null default now()
);

-- 3. Indexes
create index idx_case_results_user_id on public.case_results(user_id);
create index idx_case_results_played_at on public.case_results(played_at desc);
create index idx_profiles_elo on public.profiles(elo_rating desc);

-- 4. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.case_results enable row level security;

-- 5. RLS Policies for profiles
-- Users can read all profiles (needed for leaderboard)
create policy "Anyone can view profiles"
  on public.profiles for select
  using (true);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 6. RLS Policies for case_results
-- Users can view only their own results
create policy "Users can view own results"
  on public.case_results for select
  using (auth.uid() = user_id);

-- Users can insert their own results
create policy "Users can insert own results"
  on public.case_results for insert
  with check (auth.uid() = user_id);
