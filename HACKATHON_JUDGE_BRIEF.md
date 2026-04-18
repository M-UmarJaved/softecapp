# Opportunity Inbox Copilot - Hackathon Judge Brief

## 1) Executive Summary

Opportunity Inbox Copilot solves a real student pain point: important scholarships, internships, fellowships, and competitions are buried inside noisy inboxes.

This prototype takes raw emails (paste, sample set, or Gmail import), extracts structured opportunity data, applies a transparent deterministic scoring engine, ranks results by priority, and gives action checklists so students can apply before deadlines.

Core strength for judges: this is not just a UI mock. It has working ingestion, analysis APIs, scoring logic, persistence, auth, and fallback paths for reliability during live demos.

## 2) Problem Statement and Why It Matters

Students miss opportunities because:
- Opportunity emails are mixed with noise/spam/promotions.
- Deadlines are easy to miss.
- Eligibility requirements are scattered in unstructured text.
- Students do not know what to apply to first.

Our solution turns unstructured inbox text into ranked, explainable, actionable opportunities within seconds.

## 3) End-to-End Product Flow

### Flow A: Analyze from pasted emails (core flow)
1. User opens Analyze page.
2. User pastes emails or uploads .txt/.md/.eml text blocks.
3. User fills student profile (CGPA, degree, skills, interests, preferences).
4. Frontend calls POST /api/analyze.
5. Backend:
   - classifies spam/opportunity
   - extracts structured fields via model or fallback heuristics
   - computes deterministic score
   - ranks and adds action checklist
   - stores session in memory and persists to DB asynchronously
6. User is redirected to results page with ranked cards and score evidence.

### Flow B: Gmail import
1. User clicks connect Gmail.
2. OAuth redirect to Google.
3. Callback stores tokens in secure httpOnly cookies.
4. User fetches inbox emails (max 15, optional unread filter).
5. Imported emails feed directly into analysis flow.

### Flow C: Dashboard and history
1. Authenticated users access dashboard.
2. Dashboard reads past analysis sessions from database.
3. Users can revisit previous result sessions.

### Flow D: AI coach chat
1. User opens chat in dashboard.
2. Frontend streams response from /api/ai/generate.
3. If API key unavailable, route streams deterministic demo fallback text for stable demo continuity.

## 4) Technical Architecture

### Frontend
- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS v4 + component library
- Recharts for analytics UI widgets
- Framer Motion and custom UI states

### Backend
- Next.js route handlers (serverless compatible)
- OpenAI-compatible client to call model endpoint
- Dual reliability strategy:
  - live model extraction/chat when key is present
  - heuristic/demo fallback when key is missing/fails

### Data and Auth
- Supabase Auth for login/session gating
- Supabase Postgres for analysis sessions, user profiles, waitlist
- In-memory 30-minute session store for fast immediate retrieval

### Integrations
- Gmail OAuth2 + Gmail API read integration
- ICS generation utility for deadline calendar export

## 5) Core Feature Inventory (with implementation status)

### 5.1 Opportunity Analysis Pipeline
Status: FULLY FUNCTIONAL

What it does:
- Accepts up to 15 emails per request.
- Filters obvious spam/noise.
- Extracts opportunity metadata.
- Scores and ranks opportunities.
- Returns session ID + ranked results + skipped email reasons.

Why this matters:
- This is the core judge-critical feature proving technical viability.

### 5.2 Deterministic Scoring Engine
Status: FULLY FUNCTIONAL

Scoring formula:
- Profile Fit: 0-40
- Urgency: 0-30
- Completeness: 0-20
- Preference Match: 0-10
- Total: 0-100

Why this matters:
- Transparent, explainable, reproducible ranking.
- Strong for judges who care about logic quality and not black-box hype.

### 5.3 Results Dashboard and Explainability
Status: FULLY FUNCTIONAL

Provides:
- Ranked opportunity cards
- Priority badges
- Score breakdown visualization
- Evidence/reasons list
- Action checklist per opportunity

### 5.4 Gmail Import
Status: FUNCTIONAL (depends on valid Google credentials)

Provides:
- OAuth connect flow
- Secure token cookies
- Fetch recent inbox emails
- Optional unread-only filter

### 5.5 Supabase Persistence
Status: FUNCTIONAL

Provides:
- Analysis session persistence
- User profile load/save
- Waitlist storage
- Dashboard history retrieval

### 5.6 AI Chat Coach
Status: FUNCTIONAL with robust fallback

Provides:
- Streaming responses
- Rate limiting
- Demo-safe fallback if key/network unavailable

### 5.7 Waitlist Capture
Status: FULLY FUNCTIONAL

Provides:
- API validation
- Duplicate email handling
- DB insertion with proper error mapping

### 5.8 Analytics Page
Status: PARTIALLY REAL / DEMO-ORIENTED

Current behavior:
- Visual analytics widgets are working.
- Data toggle currently uses embedded data arrays (sample/real presets), not computed live pipeline metrics.

### 5.9 ICS Calendar Utility
Status: IMPLEMENTED UTILITY (UI wiring is limited)

What exists:
- .ics generation and browser download helper

## 6) Exact Logic Details (Judge-facing)

### 6.1 Classification logic
Primary analysis endpoint currently uses deterministic heuristic classification rules:
- trusted sender domains are treated as opportunity-positive
- obvious spam signals can mark email as skip
- opportunity keywords keep candidate emails
- ambiguous emails default to keep (minimize false negatives)

### 6.2 Extraction logic
For each opportunity email:
- model extraction path returns structured JSON fields
- fallback heuristic extraction uses regex/keyword parsing for deadline, CGPA, links, contact, type, location

This design ensures system availability even without model responses.

### 6.3 Ranking logic
After scoring:
- sort by total score descending
- tie-break with urgency (nearer deadline first)

### 6.4 Session strategy
- immediate in-memory save for fast results rendering
- non-blocking async DB persistence for durability

This improves response speed and resilience.

## 7) Differentiators vs Typical Hackathon Projects

1. Deterministic explainable ranking instead of pure LLM guesswork
- Every score is auditable by component.

2. Resilience-first architecture
- Fallbacks for extraction and chat reduce demo failure risk.

3. Real integration depth
- Gmail OAuth + Supabase Auth + DB + App Router APIs are actually wired.

4. Actionability, not just classification
- Users get ranked priorities and concrete checklist steps.

5. Pakistan student context built into defaults and UX narrative
- University/CGPA/opportunity framing is localized.

## 8) 5-Minute Presentation Script (Judge-Optimized)

### Minute 0:00-0:40 - Problem and thesis
"Students lose scholarships and internships because inboxes are noisy and deadlines are hidden. We built Opportunity Inbox Copilot to convert unstructured email chaos into ranked, explainable action in seconds."

### Minute 0:40-1:30 - Live input and profile
- Show Analyze page.
- Use sample dataset or Gmail import.
- Show profile fields (degree, CGPA, skills, preferences).

### Minute 1:30-2:30 - Run analysis live
- Trigger analysis.
- Mention backend stages clearly:
  1) classify
  2) extract
  3) deterministic score
  4) rank
- Emphasize fallback reliability if model/network fails.

### Minute 2:30-3:30 - Show ranked output and explainability
- Open result cards.
- Highlight score breakdown and reasons.
- Show urgency and action checklist.

### Minute 3:30-4:20 - Technical execution proof
- Mention working APIs, DB persistence, auth-protected dashboard, and Gmail OAuth.
- Open dashboard history quickly to prove persisted sessions.

### Minute 4:20-5:00 - Differentiation and close
- Deterministic explainable ranking.
- Stable fallback architecture.
- Real product path: student subscription + university dashboard.

## 9) Demo Stability Plan (Aligned with Hackathon Instructions)

The hackathon team prioritizes working prototype stability over slides. Our demo strategy:

1. Keep primary demo on analysis + ranking flow (most complete and judge-relevant).
2. Prepare two safe input modes:
- sample emails (fully local and deterministic)
- Gmail import (optional if network stable)
3. Keep AI fallback enabled so chat and extraction remain responsive if external API has issues.
4. Pre-validate env variables and run build/lint before stage.
5. Keep one backup path ready:
- if OAuth/network fails, demonstrate with sample emails and stored session history.

## 10) Likely Judge Questions and Strong Answers

Q1: "How do we know this is not just frontend mock data?"
A: Analysis is performed by API routes, sessions are created with IDs, stored in memory, and persisted to Supabase. Dashboard reads real saved sessions.

Q2: "Why deterministic scoring instead of fully AI ranking?"
A: Deterministic scoring is transparent and explainable for users and judges. It avoids opaque decisions while still using AI where it adds value: extraction from unstructured text.

Q3: "What happens if model API fails during demo?"
A: We implemented heuristic fallback extraction and demo-safe chat fallback. Core flow remains operational.

Q4: "How is data privacy handled?"
A: Auth routes are protected, profile/session storage is in Supabase with RLS policies, and Gmail tokens are stored in secure httpOnly cookies.

Q5: "What is currently less mature?"
A: Analytics page currently uses prepared arrays for presentation visuals; ICS utility exists but is not deeply surfaced in main results UI.

## 11) Honest Limitations and Next Steps

Current limitations:
- Main /api/analyze classification is heuristic-first; the separate AI classify route is present but not central in main flow.
- Analytics widgets are not yet fully bound to live aggregate metrics.
- Some marketing claims (for example strict privacy wording) should be aligned with actual persistence behavior.

Immediate post-hackathon improvements:
1. Connect analytics page to real aggregated session metrics.
2. Unify extraction/classification pipelines into one shared module to reduce duplication.
3. Add automated tests for scoring and parsing edge-cases.
4. Expand ICS export into visible results-card action.

## 12) Why This Meets the Hackathon Evaluation Focus

Hackathon requirement: functional prototype, strong technical execution, and quality logic.

How this project aligns:
- Fully functional core user journey: email input -> analysis -> ranked actionable output.
- Clear backend logic with robust fallbacks.
- Real integrations (Gmail, Supabase) and persistent state.
- Explainable scoring design that judges can inspect and challenge.

This is a viable product prototype, not a concept demo.
