-- OpenBoard database schema
-- Supabase Dashboard -> SQL Editor -> New query -> paste this file -> Run.
-- This app intentionally permits anonymous public posting and public reading.
-- Do not put a service_role/secret key in the website.

create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  nickname text check (nickname is null or char_length(nickname) <= 40),
  content text not null check (char_length(trim(content)) between 1 and 1200),
  created_at timestamptz not null default now()
);

create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reason text not null default 'কারণ উল্লেখ করা হয়নি' check (char_length(reason) <= 300),
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists post_reports_post_id_idx on public.post_reports (post_id);

alter table public.posts enable row level security;
alter table public.post_reports enable row level security;

-- Public visitors can read all posts.
drop policy if exists "Anyone can read posts" on public.posts;
create policy "Anyone can read posts"
  on public.posts for select
  to anon, authenticated
  using (true);

-- Public visitors can submit a post without creating an account.
drop policy if exists "Anyone can publish a post" on public.posts;
create policy "Anyone can publish a post"
  on public.posts for insert
  to anon, authenticated
  with check (
    char_length(trim(content)) between 1 and 1200
    and (nickname is null or char_length(nickname) <= 40)
  );

-- Visitors can submit reports; public visitors cannot read reports or edit/delete posts.
drop policy if exists "Anyone can report a post" on public.post_reports;
create policy "Anyone can report a post"
  on public.post_reports for insert
  to anon, authenticated
  with check (
    char_length(reason) <= 300
    and exists (select 1 from public.posts where posts.id = post_id)
  );

grant usage on schema public to anon, authenticated;
grant select, insert on public.posts to anon, authenticated;
grant insert on public.post_reports to anon, authenticated;

-- Enable Realtime for new posts if it is not already enabled.
-- In Supabase Dashboard -> Database -> Publications, make sure `posts`
-- is included in the `supabase_realtime` publication. If not, add it there.
