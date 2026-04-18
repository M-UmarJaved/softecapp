# EVENT DAY GAMEPLAN (6-Hour Window)

This is the print-ready runbook for the final 6 hours before judging.

Use this in order. Do not skip steps.

## 0. Timebox (Recommended)

- 00:00-00:30 -> Setup + environment
- 00:30-01:15 -> Database + auth sanity checks
- 01:15-02:00 -> Theme + prompt tuning for your sector
- 02:00-03:00 -> Full feature QA (chat, waitlist, analytics)
- 03:00-04:00 -> Deploy + smoke test production URL
- 04:00-05:00 -> Demo rehearsal + backup setup
- 05:00-06:00 -> Final polish + QR + contingency checks

---

## Step 1: Clone Repo, Install, Or Use Pre-Zipped node_modules

If your team already has a zip that includes node_modules, unzip and continue.

If node_modules is missing or broken:

```bash
npm install
```

Then verify app starts:

```bash
npm run dev
```

---

## Step 2: Fill .env.local With Supabase And OpenAI Keys

Copy template:

```bash
cp .env.local.example .env.local
```

Set these values in .env.local:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL
- OPENAI_API_KEY (required by this step request)

For this starter's current AI route (Grok/xAI compatible), also set:

- GROK_API_KEY
- GROK_MODEL (optional)
- GROK_BASE_URL (optional)

Tip: You can keep both OPENAI_API_KEY and GROK_API_KEY defined. The route supports compatibility behavior.

---

## Step 3: Set Up Waitlist Table (CLI Or Manual SQL)

### Option A (Local Supabase):

```bash
npx supabase db push
```

### Option B (Manual SQL in Supabase SQL Editor):

```sql
create extension if not exists pgcrypto;

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'public-waitlist',
  city text,
  company_name text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

create policy "waitlist_insert_public"
on public.waitlist_signups
for insert
to anon, authenticated
with check (true);

create policy "waitlist_select_authenticated"
on public.waitlist_signups
for select
to authenticated
using (true);
```

---

## Step 4: Change Theme Class In layout.tsx By Problem Sector

Theme classes available:

- theme-health
- theme-fintech
- theme-agri

In app/layout.tsx, the theme init script sets a default fallback theme. Change fallback theme to match your domain story:

- Healthcare pitch -> theme-health
- Fintech pitch -> theme-fintech
- Agriculture/Education pitch -> theme-agri

Fast browser override during rehearsal:

```js
localStorage.setItem("softec-theme", "theme-fintech");
location.reload();
```

Replace theme-fintech with your target class.

---

## Step 5: Edit The AI Prompt

File to edit:

- lib/ai/prompts.ts

What to change:

- Update PROMPT_BY_THEME content for your final value proposition.
- Keep style concise, domain-specific, and judge-friendly.
- Do not change route logic unless required.

Optional fallback tone edits:

- lib/ai/demo-data.ts

---

## Step 6: Test The Chat UI End-To-End

Run:

```bash
npm run dev
```

Checklist:

1. Open /login and sign in.
2. Go to /dashboard/chat.
3. Send at least 3 prompts in Demo Mode ON.
4. Switch Demo Mode OFF and test live model response (if API key configured).
5. Verify no UI break on long prompts and quick repeated sends.

---

## Step 7: Deploy To Vercel

One-command production deploy:

```bash
vercel --prod
```

During prompt flow, ensure all environment variables are set in Vercel project settings.

After deploy, smoke test:

- /
- /login
- /dashboard/chat
- /dashboard/analytics
- /waitlist
- /robots.txt
- /sitemap.xml

---

## Step 8: Run The Pitch Demo (Use Demo Mode Toggle)

For reliability during judge walkthrough:

1. Keep Demo Mode ON for core scripted prompts.
2. Use one "live" query only if internet/API is stable.
3. Pre-open tabs: landing, dashboard chat, analytics, waitlist.
4. Use the floating theme toggle (dev/demo visibility) if you want to align visuals to question context.

---

## Step 9: QR Code Generation Tip

Generate a QR for your waitlist page (best conversion route):

```bash
npx qrcode-terminal "https://YOUR-DEPLOYED-URL.vercel.app/waitlist"
```

Tip:

- Put this QR on your final slide.
- Keep a short fallback URL printed below the QR in case projector quality is bad.

---

## Step 10: Backup Plan Commands (ngrok + Local Storage Fallback)

### A) Tunnel local app if production is down:

```bash
npm run dev
npx ngrok http 3000
```

Share ngrok URL instantly with judges.

### B) AI fallback if API fails:

- Keep Demo Mode ON in chat UI.
- If needed, temporarily clear live key and rely on built-in fallback stream behavior.

### C) Local storage fallback for emergency lead capture:

Use browser console on waitlist screen:

```js
const backup = JSON.parse(localStorage.getItem("waitlist_backup") ?? "[]");
backup.push({
  email: "lead@example.com",
  source: "manual-backup",
  capturedAt: new Date().toISOString(),
});
localStorage.setItem("waitlist_backup", JSON.stringify(backup));
```

Export backup JSON quickly (Chrome DevTools):

```js
copy(localStorage.getItem("waitlist_backup"));
```

Paste into a text file and upload to Supabase after judging.

---

## Final 2-Minute Pre-Stage Check

1. Laptop charging + hotspot ready.
2. Production URL open in two browser profiles.
3. Demo Mode ON.
4. QR visible and tested by one teammate.
5. One teammate assigned as backup operator (ngrok + local backup).

You are now stage-ready.