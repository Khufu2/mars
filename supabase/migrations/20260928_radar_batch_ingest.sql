create or replace function public.ingest_mars_radar_batch(
  p_items jsonb,
  p_author_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_candidate_id uuid;
  v_existing_article_id uuid;
  v_article_id uuid;
  v_source_id uuid;
  v_published integer := 0;
  v_duplicates integer := 0;
  v_failed integer := 0;
  v_external_id text;
  v_url text;
  v_source_name text;
begin
  for item in
    select value from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    begin
      v_external_id := item #>> '{candidate,external_id}';
      v_url := item #>> '{candidate,url}';
      v_source_name := coalesce(item #>> '{candidate,source_name}', 'News source');

      select id, article_id
        into v_candidate_id, v_existing_article_id
      from public.news_candidates
      where provider = 'newsapi.ai'
        and external_id = v_external_id
      limit 1;

      if v_existing_article_id is not null then
        v_duplicates := v_duplicates + 1;
        continue;
      end if;

      if v_candidate_id is null then
        insert into public.news_candidates (
          provider, external_id, pipeline, title, url, source_name, source_uri,
          published_at, image_url, language, body_excerpt, categories, concepts,
          locations, provider_payload, region, desk, commodity, status, updated_at
        )
        values (
          'newsapi.ai',
          v_external_id,
          coalesce(item #>> '{candidate,pipeline}', 'radar-daily-business'),
          item #>> '{candidate,title}',
          v_url,
          v_source_name,
          nullif(item #>> '{candidate,source_uri}', ''),
          nullif(item #>> '{candidate,published_at}', '')::timestamptz,
          nullif(item #>> '{candidate,image_url}', ''),
          nullif(item #>> '{candidate,language}', ''),
          nullif(item #>> '{candidate,body_excerpt}', ''),
          coalesce(item #> '{candidate,categories}', '[]'::jsonb),
          coalesce(item #> '{candidate,concepts}', '[]'::jsonb),
          coalesce(item #> '{candidate,locations}', '[]'::jsonb),
          coalesce(item #> '{candidate,provider_payload}', '{}'::jsonb),
          nullif(item #>> '{candidate,region}', ''),
          nullif(item #>> '{candidate,desk}', ''),
          nullif(item #>> '{candidate,commodity}', ''),
          'used',
          now()
        )
        returning id into v_candidate_id;
      else
        update public.news_candidates
        set
          pipeline = coalesce(item #>> '{candidate,pipeline}', pipeline),
          title = coalesce(item #>> '{candidate,title}', title),
          url = coalesce(v_url, url),
          source_name = coalesce(v_source_name, source_name),
          source_uri = nullif(item #>> '{candidate,source_uri}', ''),
          published_at = nullif(item #>> '{candidate,published_at}', '')::timestamptz,
          image_url = nullif(item #>> '{candidate,image_url}', ''),
          language = nullif(item #>> '{candidate,language}', ''),
          body_excerpt = nullif(item #>> '{candidate,body_excerpt}', ''),
          categories = coalesce(item #> '{candidate,categories}', categories),
          concepts = coalesce(item #> '{candidate,concepts}', concepts),
          locations = coalesce(item #> '{candidate,locations}', locations),
          provider_payload = coalesce(item #> '{candidate,provider_payload}', provider_payload),
          region = nullif(item #>> '{candidate,region}', ''),
          desk = nullif(item #>> '{candidate,desk}', ''),
          commodity = nullif(item #>> '{candidate,commodity}', ''),
          status = 'used',
          updated_at = now()
        where id = v_candidate_id;
      end if;

      select id into v_source_id
      from public.sources
      where url = v_url
      order by created_at asc
      limit 1;

      if v_source_id is null then
        insert into public.sources(name, url, source_type)
        values (v_source_name, v_url, 'news')
        returning id into v_source_id;
      end if;

      insert into public.articles (
        slug, title, dek, kicker, body, section, region, country, commodity,
        story_type, status, featured_image_url, image_credit, meta_title,
        meta_description, social_copy, editorial_checks, include_in_brief,
        canonical_url, author_id, published_at, updated_at
      )
      values (
        item #>> '{article,slug}',
        item #>> '{article,title}',
        nullif(item #>> '{article,dek}', ''),
        'MARS RADAR',
        coalesce(item #> '{article,body}', '[]'::jsonb),
        coalesce(item #>> '{article,section}', 'Companies'),
        coalesce(item #>> '{article,region}', 'Global'),
        coalesce(item #>> '{article,country}', 'Global'),
        nullif(item #>> '{article,commodity}', ''),
        'Radar',
        'published',
        nullif(item #>> '{article,featured_image_url}', ''),
        nullif(item #>> '{article,image_credit}', ''),
        nullif(item #>> '{article,meta_title}', ''),
        nullif(item #>> '{article,meta_description}', ''),
        '{}'::jsonb,
        '{"automatedRadar":true}'::jsonb,
        false,
        v_url,
        p_author_id,
        now(),
        now()
      )
      returning id into v_article_id;

      insert into public.article_sources (
        article_id, source_id, source_url, note, verified
      )
      values (
        v_article_id,
        v_source_id,
        v_url,
        'Original reporting surfaced by MARS Radar. The source extract is limited; open the publisher for the complete article.',
        false
      )
      on conflict do nothing;

      update public.news_candidates
      set article_id = v_article_id, status = 'used', updated_at = now()
      where id = v_candidate_id;

      insert into public.publication_events(article_id, event_type, payload)
      values (
        v_article_id,
        'radar_autopublished',
        jsonb_build_object(
          'candidate_id', v_candidate_id,
          'provider', 'newsapi.ai',
          'pipeline', 'daily-business',
          'source_url', v_url
        )
      );

      v_published := v_published + 1;
    exception
      when unique_violation then
        v_duplicates := v_duplicates + 1;
      when others then
        v_failed := v_failed + 1;
    end;
  end loop;

  return jsonb_build_object(
    'published', v_published,
    'duplicates', v_duplicates,
    'failed', v_failed
  );
end;
$$;

revoke all on function public.ingest_mars_radar_batch(jsonb, uuid) from public;
revoke all on function public.ingest_mars_radar_batch(jsonb, uuid) from anon;
revoke all on function public.ingest_mars_radar_batch(jsonb, uuid) from authenticated;
grant execute on function public.ingest_mars_radar_batch(jsonb, uuid) to service_role;
