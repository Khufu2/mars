# MARS

**Africa's food economy, decoded.**

Mars is a Next.js publication and intelligence shell for African agriculture, commodities, climate, trade, logistics, policy and finance. The public experience uses a bold editorial system inspired by modern global news products while keeping its own visual identity.

## What works in this branch

- Responsive editorial homepage
- Story pages with structured analysis blocks
- Desk/section pages
- Search across prototype content
- Demo market board
- Newsletter API with Supabase persistence when credentials are present
- Local newsroom draft cockpit at `/studio`
- Supabase schema for articles, authors, sources, newsletter, prices and social queue
- SEO metadata, sitemap and robots
- Grain X contextual action layer
- GitHub Actions build verification

All seed stories and market figures are explicitly prototype/demo content. They are not represented as live news.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Supabase

Create a Supabase project, then run:

```
supabase/migrations/20260922_init.sql
```

Set:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

The newsletter endpoint switches from demo mode to persistent mode automatically once the Supabase URL and service-role key are configured.

## Next implementation layer

1. Replace prototype `lib/data.ts` with published articles queried from Supabase.
2. Add Supabase Auth + newsroom roles around `/studio`.
3. Bring in the full TipTap editor/draft workflow patterns from the reviewed MIT CMS.
4. Add source ingestion (official notices, RSS, licensed APIs), deduplication and verification.
5. Add live commodity/weather/logistics feeds.
6. Generate social packages and queue approved posts through platform APIs.
7. Add ad/sponsor inventory and analytics.

See `THIRD_PARTY_NOTICES.md` for open-source and design references.
