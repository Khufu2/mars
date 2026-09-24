-- Optional: Supabase-native scheduled publishing for MARS.
-- Run after 20260922_init.sql and 20260924_publishing.sql.
-- This avoids Vercel Hobby cron limits.

create extension if not exists pg_cron;

create or replace function public.publish_due_articles()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  article record;
  count_published integer := 0;
  now_ts timestamptz := now();
begin
  for article in
    select id, slug, title, dek, social_copy, include_in_brief
    from public.articles
    where status = 'scheduled'
      and scheduled_at is not null
      and scheduled_at <= now_ts
    order by scheduled_at asc
    for update skip locked
  loop
    update public.articles
      set status = 'published',
          published_at = now_ts,
          updated_at = now_ts
      where id = article.id;

    insert into public.social_queue (article_id, platform, payload, status)
    values
      (article.id, 'instagram', jsonb_build_object('slug',article.slug,'title',article.title,'caption',coalesce(article.social_copy->>'caption',article.dek)), 'draft'),
      (article.id, 'linkedin',  jsonb_build_object('slug',article.slug,'title',article.title,'caption',coalesce(article.social_copy->>'caption',article.dek)), 'draft'),
      (article.id, 'x',         jsonb_build_object('slug',article.slug,'title',article.title,'caption',coalesce(article.social_copy->>'caption',article.dek)), 'draft');

    if article.include_in_brief then
      insert into public.newsletter_queue (article_id, briefing, subject, preview_text, status)
      values (article.id, 'flagship', article.title, article.dek, 'draft');
    end if;

    insert into public.publication_events (article_id, event_type, payload)
    values (article.id, 'scheduled_publish', jsonb_build_object('published_at',now_ts));

    count_published := count_published + 1;
  end loop;

  return count_published;
end;
$$;

do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname = 'mars-publish-scheduled' limit 1;
  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
  perform cron.schedule('mars-publish-scheduled', '*/5 * * * *', 'select public.publish_due_articles();');
end $$;
