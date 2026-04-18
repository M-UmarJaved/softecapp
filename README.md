# Softec AI Hackathon Starter

Production-ready Next.js 16 starter for hackathon demos with:

- Supabase authentication and protected dashboard routes
- Recharts analytics widgets (line, bar, pie)
- Grok-ready streaming API route with demo fallback
- Waitlist capture flow and admin waitlist dashboard
- Theme engine with three visual modes (health, fintech, agri)
- Vercel-ready deployment configuration

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/base-ui components
- Supabase Auth + DB
- Recharts
- Grok API (xAI) via OpenAI-compatible client

## 1) Quick Start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000.

Useful commands:

```bash
npm run dev      # local development
npm run lint     # lint checks
npm run build    # production build validation
npm run start    # run production build locally
```

## 2) Environment Variables

Set these in `.env.local` for local development and in Vercel Project Settings for deployment.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public app URL (used by robots/sitemap and auth redirects) |
| `GROK_API_KEY` | Optional in demo mode | Grok API key for live model calls |
| `GROK_MODEL` | Optional | Override model (default: `grok-3-mini-fast`) |
| `GROK_BASE_URL` | Optional | Grok base URL (default: `https://api.x.ai/v1`) |
| `NEXT_PUBLIC_DEMO_MODE` | Optional | Set `true` to force demo-only UI hints (including floating theme toggle in production demos) |

## 3) Event-Day Edit Points

### Change AI prompt behavior

- Core system prompts by theme: `lib/ai/prompts.ts`
- Demo fallback tone/content: `lib/ai/demo-data.ts`

### Change AI provider wiring (Grok)

- Streaming endpoint and request handling: `app/api/ai/generate/route.ts`

### Change dashboard analytics visuals

- Line widget: `components/charts/line-chart.tsx`
- Bar widget: `components/charts/bar-chart.tsx`
- Pie widget: `components/charts/pie-chart.tsx`
- Demo analytics page: `app/dashboard/analytics/page.tsx`

### Change waitlist logic

- DB access and data validation: `lib/db/waitlist.ts`
- Public API endpoint: `app/api/waitlist/route.ts`
- Public waitlist page: `app/waitlist/page.tsx`
- Admin table page: `app/dashboard/waitlist/page.tsx`

## 4) Theme System

- Theme tokens and palettes: `app/globals.css`
- Theme context/provider: `components/theme-provider.tsx`
- Floating development/demo toggle: `components/theme-toggle.tsx`
- Root setup + font loading + pre-hydration theme script: `app/layout.tsx`

Available body classes:

- `theme-health`
- `theme-fintech`
- `theme-agri`

Default theme is `theme-health`.
Persisted key in localStorage: `softec-theme`.

## 5) SEO and Metadata Routes

- Robots file generator: `app/robots.ts`
- Sitemap generator: `app/sitemap.ts`

These use `NEXT_PUBLIC_SITE_URL` to create deploy-correct absolute URLs.

## 6) Deployment to Vercel

This project is deployment-ready for Vercel with:

- `vercel.json` for explicit install/build/dev commands
- `next.config.mjs` baseline production config
- `proxy.ts` for Next.js 16 request interception (replaces deprecated middleware convention)

Deployment steps:

1. Push this repository to GitHub.
2. Import project in Vercel.
3. Add all required environment variables in Vercel Project Settings.
4. Deploy.
5. Validate:
	 - `/` loads
	 - `/login` auth flows work
	 - `/dashboard` redirects correctly by auth state
	 - `/dashboard/analytics` renders charts
	 - `/robots.txt` and `/sitemap.xml` are accessible

## 7) Pre-Demo Checklist

Run this before presenting:

1. `npm run lint`
2. `npm run build`
3. Confirm Supabase keys are present.
4. Confirm `GROK_API_KEY` is present if using live model calls.
5. Test chat in both Demo Mode and API Mode.
6. Test waitlist form submission and dashboard waitlist table.
7. Test theme switching and visual consistency.
8. Confirm deployment URL is set in `NEXT_PUBLIC_SITE_URL`.

## 8) Troubleshooting

- Build fails due to missing env vars:
	- Ensure `.env.local` exists and values are set.
- Auth redirects fail:
	- Verify Supabase URL/key and callback URL config.
- Charts appear empty:
	- Check `data` props passed into chart components.
- Theme not persisting:
	- Verify browser allows localStorage and key `softec-theme` is present.

## License

Use this starter freely for hackathon and prototype projects.
