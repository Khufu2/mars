create table if not exists public.news_candidates (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  pipeline text not null,
  title text not null,
  url text not null,
  source_name text,
  source_uri text,
  published_at timestamptz,
  image_url text,
  language text,
  body_excerpt text,
  categories jsonb not null default '[]'::jsonb,
  concepts jsonb not null default '[]'::jsonb,
  locations jsonb not null default '[]'::jsonb,
  provider_payload jsonb not null default '{}'::jsonb,
  region text,
  desk text,
  commodity text,
  relevance_score numeric check (relevance_score is null or (relevance_score >= 0 and relevance_score <= 100)),
  ai_summary text,
  ai_angle text,
  ai_headline text,
  ai_verification_notes jsonb not null default '[]'::jsonb,
  status text not null default 'new' check (status in ('new','shortlisted','dismissed','drafted','used')),
  article_id uuid references public.articles(id) on delete set null,
  fetched_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, external_id)
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  pipeline text not null,
  query jsonb not null default '{}'::jsonb,
  status text not null default 'running' check (status in ('running','completed','failed')),
  items_fetched integer not null default 0,
  items_upserted integer not null default 0,
  estimated_searches integer not null default 1,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists news_candidates_status_score_idx on public.news_candidates(status, relevance_score desc nulls last);
create index if not exists news_candidates_pipeline_published_idx on public.news_candidates(pipeline, published_at desc);
create index if not exists news_candidates_article_id_idx on public.news_candidates(article_id);
create index if not exists ingestion_runs_started_at_idx on public.ingestion_runs(started_at desc);

alter table public.news_candidates enable row level security;
alter table public.ingestion_runs enable row level security;

drop policy if exists "newsroom read news candidates" on public.news_candidates;
create policy "newsroom read news candidates" on public.news_candidates
for select to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('admin','editor','author')
  )
);

drop policy if exists "editors manage news candidates" on public.news_candidates;
create policy "editors manage news candidates" on public.news_candidates
for update to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('admin','editor')
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('admin','editor')
  )
);

drop policy if exists "editors read ingestion runs" on public.ingestion_runs;
create policy "editors read ingestion runs" on public.ingestion_runs
for select to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('admin','editor')
  )
);
