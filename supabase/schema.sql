create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'marital_status') then
    create type marital_status as enum ('single', 'married', 'engaged', 'divorced');
  end if;

  if not exists (select 1 from pg_type where typname = 'risk_appetite') then
    create type risk_appetite as enum ('conservative', 'balanced', 'growth', 'aggressive');
  end if;

  if not exists (select 1 from pg_type where typname = 'tax_regime_preference') then
    create type tax_regime_preference as enum ('old', 'new', 'unsure');
  end if;

  if not exists (select 1 from pg_type where typname = 'goal_priority') then
    create type goal_priority as enum ('high', 'medium', 'low');
  end if;
end $$;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references app_users(id) on delete cascade,
  city text not null,
  age integer not null check (age between 18 and 80),
  marital_status marital_status not null,
  dependents integer not null default 0,
  monthly_income numeric(14,2) not null default 0,
  monthly_expenses numeric(14,2) not null default 0,
  loan_emi numeric(14,2) not null default 0,
  current_savings numeric(14,2) not null default 0,
  emergency_fund numeric(14,2) not null default 0,
  risk_appetite risk_appetite not null,
  retirement_target_age integer not null,
  tax_regime_preference tax_regime_preference not null default 'unsure',
  onboarding_completed boolean not null default false,
  salary_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists insurance_coverages (
  profile_id uuid primary key references profiles(id) on delete cascade,
  life_cover numeric(14,2) not null default 0,
  health_cover numeric(14,2) not null default 0,
  disability_cover numeric(14,2) not null default 0,
  personal_accident_cover numeric(14,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists investment_snapshots (
  profile_id uuid primary key references profiles(id) on delete cascade,
  equity numeric(14,2) not null default 0,
  debt numeric(14,2) not null default 0,
  gold numeric(14,2) not null default 0,
  cash numeric(14,2) not null default 0,
  epf numeric(14,2) not null default 0,
  ppf numeric(14,2) not null default 0,
  nps numeric(14,2) not null default 0,
  international numeric(14,2) not null default 0,
  alternatives numeric(14,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists financial_goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  target_amount numeric(14,2) not null,
  target_year integer not null,
  priority goal_priority not null default 'medium',
  goal_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  fund_name text not null,
  category text not null,
  invested_amount numeric(14,2) not null,
  current_value numeric(14,2) not null,
  expense_ratio numeric(6,2) not null default 0,
  benchmark_return numeric(6,2) not null default 0,
  annualized_return numeric(6,2) not null default 0,
  style_tags text[] not null default '{}',
  top_holdings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_financial_goals_profile_id on financial_goals(profile_id);
create index if not exists idx_portfolio_holdings_profile_id on portfolio_holdings(profile_id);
create index if not exists idx_chat_messages_profile_id on chat_messages(profile_id);
