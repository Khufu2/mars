create extension if not exists "pgcrypto";

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  dek text,
  body jsonb not null default '[]'::jsonb,
  section text not null,
  region text,
  country text,
  commodity text,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  author_id uuid references public.authors(id) on delete set null,
  featured_image_url text,
  image_credit text,
  meta_title text,
  meta_description text,
  social_copy jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  source_type text not null default 'web',
  created_at timestamptz not null default now()
);

create table if not exists public.article_sources (
  article_id uuid references public.articles(id) on delete cascade,
  source_id uuid references public.sources(id) on delete cascade,
  source_url text,
  note text,
  primary key (article_id, source_id)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  briefing text not null default 'flagship',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique(email, briefing)
);

create table if not exists public.market_prices (
  id uuid primary key default gen_random_uuid(),
  instrument text not null,
  market text,
  value numeric,
  unit text,
  currency text,
  observed_at timestamptz not null,
  source_name text,
  source_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.social_queue (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  platform text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.authors enable row level security;
alter table public.articles enable row level security;
alter table public.sources enable row level security;
alter table public.article_sources enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.market_prices enable row level security;
alter table public.social_queue enable row level security;

create policy "public read authors" on public.authors for select using (true);
create policy "public read published articles" on public.articles for select using (status = 'published');
create policy "public read sources" on public.sources for select using (true);
create policy "public read article sources" on public.article_sources for select using (
  exists (select 1 from public.articles a where a.id = article_id and a.status = 'published')
);
create policy "public read prices" on public.market_prices for select using (true);
create policy "authenticated manage articles" on public.articles for all to authenticated using (true) with check (true);
create policy "authenticated manage authors" on public.authors for all to authenticated using (true) with check (true);
create policy "authenticated manage sources" on public.sources for all to authenticated using (true) with check (true);
create policy "authenticated manage article sources" on public.article_sources for all to authenticated using (true) with check (true);
create policy "authenticated manage social queue" on public.social_queue for all to authenticated using (true) with check (true);
