-- MARS publishing layer: run after 20260922_init.sql

alter table public.authors add column if not exists user_id uuid references auth.users(id) on delete set null;\ncreate unique index if not exists authors_user_id_idx on public.authors(user_id) where user_id is not null;\n\ncreate table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'author' check (role in ('admin','editor','author')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), 'author')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.articles add column if not exists kicker text;
alter table public.articles add column if not exists story_type text not null default 'News';
alter table public.articles add column if not exists editorial_checks jsonb not null default '{}'::jsonb;
alter table public.articles add column if not exists scheduled_at timestamptz;
alter table public.articles add column if not exists include_in_brief boolean not null default true;
alter table public.articles add column if not exists sponsor_name text;
alter table public.articles add column if not exists sponsor_disclosure text;
alter table public.articles add column if not exists canonical_url text;
alter table public.articles add column if not exists correction_note text;
alter table public.articles add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table public.articles add column if not exists reviewed_at timestamptz;

alter table public.article_sources add column if not exists verified boolean not null default false;
alter table public.article_sources add column if not exists accessed_at timestamptz not null default now();

alter table public.newsletter_subscribers add column if not exists source text;
alter table public.newsletter_subscribers add column if not exists consented_at timestamptz;
alter table public.newsletter_subscribers add column if not exists last_subscribed_at timestamptz;

do $$
begin
  alter table public.articles drop constraint if exists articles_status_check;
  alter table public.articles add constraint articles_status_check check (status in ('draft','review','scheduled','published','archived'));
exception when duplicate_object then null;
end $$;

create table if not exists public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  snapshot jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  note text not null,
  published_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.newsletter_queue (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  briefing text not null default 'flagship',
  subject text,
  preview_text text,
  status text not null default 'draft' check (status in ('draft','queued','sent','cancelled')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.publication_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser text not null,
  name text not null,
  status text not null default 'draft' check (status in ('draft','active','paused','completed')),
  placement text,
  creative_url text,
  destination_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists articles_status_published_at_idx on public.articles(status, published_at desc);
create index if not exists articles_section_published_at_idx on public.articles(section, published_at desc);
create index if not exists articles_scheduled_at_idx on public.articles(status, scheduled_at);
create index if not exists market_prices_instrument_observed_idx on public.market_prices(instrument, observed_at desc);

alter table public.profiles enable row level security;
alter table public.article_revisions enable row level security;
alter table public.corrections enable row level security;
alter table public.newsletter_queue enable row level security;
alter table public.publication_events enable row level security;
alter table public.ad_campaigns enable row level security;

drop policy if exists "profiles read self" on public.profiles;
create policy "profiles read self" on public.profiles for select to authenticated using (id = auth.uid());

drop policy if exists "authenticated manage revisions" on public.article_revisions;
create policy "authenticated manage revisions" on public.article_revisions for all to authenticated using (true) with check (true);

drop policy if exists "public read corrections" on public.corrections;
create policy "public read corrections" on public.corrections for select using (true);

drop policy if exists "authenticated manage corrections" on public.corrections;
create policy "authenticated manage corrections" on public.corrections for all to authenticated using (true) with check (true);

drop policy if exists "authenticated manage newsletter queue" on public.newsletter_queue;
create policy "authenticated manage newsletter queue" on public.newsletter_queue for all to authenticated using (true) with check (true);

drop policy if exists "authenticated manage publication events" on public.publication_events;
create policy "authenticated manage publication events" on public.publication_events for all to authenticated using (true) with check (true);

drop policy if exists "authenticated manage campaigns" on public.ad_campaigns;
create policy "authenticated manage campaigns" on public.ad_campaigns for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-media','article-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true;


-- Tighten the broad starter policies now that roles exist.
drop policy if exists "authenticated manage articles" on public.articles;
drop policy if exists "authenticated manage authors" on public.authors;
drop policy if exists "authenticated manage sources" on public.sources;
drop policy if exists "authenticated manage article sources" on public.article_sources;
drop policy if exists "authenticated manage social queue" on public.social_queue;

create policy "newsroom read own or elevated articles" on public.articles
for select to authenticated using (
  created_by = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
  or status = 'published'
);

create policy "newsroom create own articles" on public.articles
for insert to authenticated with check (
  created_by = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor','author'))
);

create policy "newsroom update own or elevated articles" on public.articles
for update to authenticated using (
  created_by = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
) with check (
  created_by = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);

create policy "newsroom delete own or elevated articles" on public.articles
for delete to authenticated using (
  created_by = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);

create policy "newsroom manage authors" on public.authors
for all to authenticated using (
  user_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
) with check (
  user_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);

create policy "newsroom manage sources" on public.sources
for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor','author'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor','author'))
);

create policy "newsroom manage article sources" on public.article_sources
for all to authenticated using (
  exists (
    select 1 from public.articles a
    where a.id = article_id
      and (a.created_by = auth.uid() or exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor')
      ))
  )
) with check (
  exists (
    select 1 from public.articles a
    where a.id = article_id
      and (a.created_by = auth.uid() or exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor')
      ))
  )
);

create policy "editors manage social queue" on public.social_queue
for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);


-- Production hardening for newsroom-adjacent tables.
drop policy if exists "authenticated manage revisions" on public.article_revisions;
drop policy if exists "authenticated manage corrections" on public.corrections;
drop policy if exists "authenticated manage newsletter queue" on public.newsletter_queue;
drop policy if exists "authenticated manage publication events" on public.publication_events;
drop policy if exists "authenticated manage campaigns" on public.ad_campaigns;

create policy "newsroom read revisions" on public.article_revisions
for select to authenticated using (
  exists (
    select 1 from public.articles a
    where a.id = article_id
      and (a.created_by = auth.uid() or exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor')
      ))
  )
);

create policy "newsroom create revisions" on public.article_revisions
for insert to authenticated with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.articles a
    where a.id = article_id
      and (a.created_by = auth.uid() or exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor')
      ))
  )
);

create policy "editors manage corrections" on public.corrections
for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);

create policy "editors manage newsletter queue" on public.newsletter_queue
for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);

create policy "editors read publication events" on public.publication_events
for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);

create policy "editors manage campaigns" on public.ad_campaigns
for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);

drop policy if exists "profiles read self" on public.profiles;
create policy "profiles read newsroom" on public.profiles
for select to authenticated using (
  id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);
