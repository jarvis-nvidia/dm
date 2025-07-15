-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create users table with GitHub integration
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  github_id text unique,
  email text unique,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create projects table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  github_repo text,
  status text default 'active',
  created_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create tasks table
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  project_id uuid references public.projects(id) on delete cascade,
  assigned_to uuid references public.users(id),
  created_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create analytics table
create table public.analytics (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  metric_name text not null,
  metric_value jsonb not null,
  recorded_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS) Policies
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.analytics enable row level security;

-- Users RLS
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

-- Projects RLS
create policy "Project members can view projects"
  on public.projects for select
  using (auth.uid() = created_by);

create policy "Project owners can update projects"
  on public.projects for update
  using (auth.uid() = created_by);

-- Tasks RLS
create policy "Task members can view tasks"
  on public.tasks for select
  using (
    auth.uid() = created_by or
    auth.uid() = assigned_to or
    auth.uid() in (
      select created_by from public.projects where id = project_id
    )
  );

-- Analytics RLS
create policy "Project members can view analytics"
  on public.analytics for select
  using (
    auth.uid() in (
      select created_by from public.projects where id = project_id
    )
  );
