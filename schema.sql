-- Create Courts Table
create table if not exists courts (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  name text not null,
  power text,
  sphere text,
  visible boolean default false,
  parent_id uuid references courts(id),
  config jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Basic Policies (Enable RLS but allow read/write for now given Anon Key usage in dev)
alter table courts enable row level security;

-- For local dev with Anon Key, we might need permissive policies or Service Role.
-- Since we are using this for a public simulator, Read should be public.
create policy "Public Read" on courts
  for select using (true);

-- For Seed/Admin dashboard (Write), we ideally want authenticated users or service role.
-- But for this setup step, allow Anon insert/update if needed, or user runs this as Admin SQL.
-- Let's assume the user runs this in SQL Editor which is Admin.

-- To allow our seed script (Anon Key) to insert, we need a permissive policy for now.
-- WARNING: This is for Development only.
create policy "Dev Anon Insert" on courts
  for insert with check (true);

create policy "Dev Anon Update" on courts
  for update using (true);
