# MARS

**Africa's food economy, decoded.**

MARS is an African agriculture, commodities, climate, trade and logistics publication with a newsroom workflow built around source-first reporting and structured intelligence.

## Production status

The public publication, live discovery, market/commodity/region pages, social carousel renderer and local newsroom work without Supabase.

Once Supabase is connected, MARS automatically activates:

- email/password newsroom accounts
- first-admin bootstrap
- persistent drafts
- article revisions and publication events
- source/evidence relationships
- public article media uploads
- publish-now and scheduled publishing
- public pages backed by published Supabase stories
- social distribution queue
- MARS Brief newsletter queue
- sponsor/disclosure fields
- newsroom story queue and statuses

## Connect Supabase

Run these migrations in order:

```
supabase/migrations/20260922_init.sql
supabase/migrations/20260924_publishing.sql
```

Add these Vercel environment variables:

```
NEXT_PUBLIC_SITE_URL=https://your-domain
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

Optional email delivery later:

```
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Redeploy after setting env vars.

Then open:

```
/studio/login
```

The first authenticated newsroom user is promoted to admin if no admin exists yet. From there open `/studio/articles/new`, complete the editorial readiness checks, and publish. Published stories appear on the public site automatically.

## Editorial workflow

1. **Discover** — `/studio/discover`
2. **Verify** — primary sources and source registry at `/sources`
3. **Write** — `/studio/articles/new`
4. **Publish or schedule** — readiness-gated publishing API
5. **Package** — `/studio/social` renders 1080 × 1350 social slides
6. **Distribute** — social and newsletter queues are created on publication

## Scheduling

`vercel.json` registers an hourly cron for `/api/cron/publish-scheduled`. Set `CRON_SECRET` in Vercel so scheduled stories can be promoted to published status safely.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Prototype data

Until live market feeds are connected, market figures are clearly labelled prototype data. Static prototype stories remain as a fallback only when no published Supabase content exists.

See `THIRD_PARTY_NOTICES.md` for open-source and design references.
