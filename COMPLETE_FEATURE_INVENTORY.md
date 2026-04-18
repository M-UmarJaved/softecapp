# Complete Feature Inventory - Opportunity Inbox Copilot

This document lists application features from big to small, including product flows, UI capabilities, backend behavior, data/security, and support utilities.

## 1. Product-Level Modules

1. Opportunity Analysis Engine
2. Results and Decision Dashboard
3. Student Profile and Personalization
4. Gmail Import Integration
5. AI Chat Coach
6. Authentication and Protected Dashboard
7. Waitlist and Growth Capture
8. Analytics and Reporting UI
9. Theme and Presentation System
10. Deployment and Demo Reliability Layer

## 2. Public Website Features

### 2.1 Landing Experience

1. Hero section with clear value proposition and CTA to analysis flow.
2. Animated visual presentation (background glow, staggered text, ticker effects).
3. Navigation links to home, features, about, pricing.
4. Demo deep-link entry using query mode.

### 2.2 Features Marketing Page

1. AI pipeline showcase section.
2. Deterministic scoring showcase section.
3. Action tools showcase section.
4. Export/share showcase section.

### 2.3 Pricing Page

1. Multi-tier plan cards (Free, Student, University).
2. Feature comparison highlights across plans.
3. FAQ block for buyer objections.
4. CTA to start analysis and join waitlist.

### 2.4 About Page

1. Team/person profile and role context.
2. Product principles and mission framing.
3. Hackathon build stats and execution narrative.

## 3. Core Analysis Flow Features (Analyze Page)

### 3.1 Email Input and Ingestion

1. Paste-mode email input with block separation.
2. Sample-mode loader for prebuilt test inbox.
3. File upload for .txt/.md/.eml style text files.
4. Parse action that converts free text into structured email objects.
5. Parsed email count and readiness indicator.
6. Inbox preview/simulator list of imported emails.
7. Clear/reset email workspace action.

### 3.2 Gmail Import UX

1. Connect Gmail button initiating OAuth.
2. Connected-state UI with import/disconnect controls.
3. Fetch settings panel with unread-only toggle.
4. Fetch count slider (up to API cap).
5. Import feedback states: loading, success, error, empty.
6. Imported Gmail messages mapped into analysis email format.

### 3.3 Student Profile Builder

1. Name, university, degree, program.
2. Semester input and CGPA input.
3. Skills tag input (add/remove chips).
4. Interests tag input.
5. Opportunity type preference multi-select.
6. Location preference selection.
7. Financial need selection.
8. Past experience list input.
9. Available-from date support in profile model.
10. Profile save action to backend.
11. Profile auto-load from backend when authenticated.

### 3.4 Validation and Readiness

1. Email count boundaries validation.
2. Required profile field validation.
3. CGPA range validation.
4. Inline error messaging.
5. Prevent submission when invalid.

### 3.5 Processing Experience

1. Full-screen processing overlay during analysis.
2. Multi-step progress animation.
3. Live hints shown during pipeline execution.
4. Automatic redirect to session results after completion.

## 4. Opportunity Analysis Backend Features

### 4.1 Main Analyze Endpoint

1. Accepts email array plus profile payload.
2. Request payload validation and normalization.
3. Email classification pass (opportunity vs skip).
4. Structured extraction per opportunity email.
5. Deterministic scoring per extracted opportunity.
6. Ranking and tie-break ordering.
7. AI explanations generated for top-ranked items.
8. Skipped email reasons included in response.
9. Session ID generation and response packaging.

### 4.2 Classification Logic

1. Trusted sender-domain allow logic.
2. Spam-signal keyword rules.
3. Opportunity-signal keyword rules.
4. Ambiguous mail default-to-keep behavior.
5. Separate classification endpoint available for classification-only use.

### 4.3 Extraction Logic

1. Model-first extraction path using OpenAI-compatible chat completion.
2. Strict JSON extraction prompt schema.
3. JSON sanitization/extraction from model output.
4. Normalization to typed opportunity schema.
5. Heuristic fallback extraction when model unavailable/fails.
6. Heuristic extraction of deadline, CGPA, link, contact, type, and location.

### 4.4 Deterministic Scoring Engine

1. Profile Fit score component.
2. Urgency score component.
3. Completeness score component.
4. Preference Match score component.
5. Total score clamped to 0-100.
6. Priority level generation (URGENT/HIGH/MEDIUM/LOW/SKIP).
7. Reason strings generated for explainability.
8. Matched/missing requirement tracking.
9. Action checklist generation from extracted opportunity details.

### 4.5 Ranking and Sorting

1. Sort by total score descending.
2. Tie-break by nearer deadline first.
3. Secondary confidence ordering in scoring module variants.

### 4.6 API Reliability Controls

1. Safe fallback mode for extraction pipeline.
2. Structured error responses for invalid JSON and processing failures.
3. Separate opportunities analysis endpoint with in-memory rate limiting.

## 5. Results Experience Features

### 5.1 Session Retrieval

1. Primary session read from in-memory store.
2. Fallback retrieval from Supabase if memory entry missing.
3. Not-found handling for invalid/expired sessions.

### 5.2 Results Header and Summary

1. Opportunity count summary.
2. Processed email count summary.
3. Priority-level counters (urgent/high/medium).
4. Provider indicator (model vs fallback).
5. Generated timestamp display.

### 5.3 Opportunity Listing and Navigation

1. Ranked list rendering by score.
2. Desktop sidebar quick-jump navigation by rank.
3. Active selection highlighting.
4. Scroll-to-opportunity behavior.

### 5.4 Opportunity Card Details

1. Rank badge, score badge, and priority badge.
2. Organization/type metadata.
3. AI explanation text (when available).
4. Detailed score bars by component.
5. Extracted details: deadline, eligibility, docs, benefits.
6. Apply-now outbound link button.
7. Deadline urgency visual handling (urgent/past/normal).

### 5.5 Checklist and Execution Tools

1. Per-opportunity interactive checklist.
2. Checklist item local check/uncheck state.
3. Copy checklist text to clipboard.

### 5.6 Applied Tracking

1. Mark-as-applied action per opportunity.
2. Undo applied status.
3. Local persistence of applied IDs in browser storage.

### 5.7 Export and Share

1. ICS calendar download for deadlines.
2. PDF-ready print report generation via print window.
3. WhatsApp-friendly summary text builder.
4. Clipboard copy of WhatsApp summary with success feedback.

### 5.8 Skipped Email Transparency

1. Collapsible section listing filtered/skipped emails.
2. Reason and confidence display for each skipped email.

### 5.9 Live Urgency Signal

1. Top-opportunity countdown timer with periodic updates.
2. Deadline-passed state messaging.

## 6. Dashboard Features (Authenticated Area)

### 6.1 Dashboard Access and Shell

1. Auth-protected dashboard route group.
2. Redirect to login when unauthenticated.
3. Optional auth bypass mode for demo/development.
4. Persistent sidebar navigation.
5. Header with user identity context.

### 6.2 Dashboard Home

1. Session-level stats cards.
2. Opportunity total aggregation.
3. Urgent deadline aggregation.
4. Recent analyses table with quick result links.

### 6.3 Dashboard Opportunities Analyzer

1. Alternate analyzer page under dashboard.
2. Uses /api/opportunities/analyze route.
3. Supports sample data load and parsing.
4. Redirect-to-results when sessionId returned.

### 6.4 Dashboard Results History

1. Historical session browsing entry point.
2. Results deep-linking by session id.

### 6.5 Dashboard Analytics

1. Line chart widget.
2. Bar chart widget.
3. Pie chart widget.
4. Data mode toggle (sample vs real preset arrays).

### 6.6 Dashboard Chat

1. Streaming chat messages from backend.
2. Typing indicator and streaming cursor UX.
3. Suggested prompt chips for first interaction.
4. Shift+Enter/new-line and Enter/send handling.
5. Error fallback message rendering.

### 6.7 Dashboard Profile

1. Profile page route for persistent user profile management.
2. Integration with profile API and database storage.

### 6.8 Dashboard Waitlist

1. Waitlist management view route in authenticated area.

## 7. AI Chat Backend Features

1. Streaming text response endpoint.
2. Theme-aware system prompt selection.
3. OpenAI-compatible model client wiring.
4. Model override support in payload.
5. Per-client in-memory rate limiting.
6. Demo fallback stream when key missing.
7. Request message normalization and filtering.
8. Abort handling for canceled client requests.

## 8. Gmail Integration Features

### 8.1 OAuth Setup and Redirects

1. Auth URL generation with required scopes.
2. Return path carried through OAuth state.
3. Callback code exchange for access/refresh tokens.
4. Error redirect path when consent or exchange fails.

### 8.2 Token and Session Handling

1. Access token stored in httpOnly cookie.
2. Refresh token stored when available.
3. Cookie security flags based on environment.
4. Disconnect endpoint clears Gmail cookies.

### 8.3 Gmail Message Fetching

1. Inbox listing endpoint support.
2. Max result cap handling.
3. Unread-only query support.
4. Full message fetch and header extraction.
5. Plain-text and HTML body extraction.
6. Base64url decoding for Gmail payload data.
7. Token-expiry error mapping to reconnect signal.

## 9. User Profile and Personalization Features

1. Save profile API for authenticated users.
2. Load profile API for authenticated users.
3. Supabase upsert by user_id.
4. Expanded profile attributes persisted:
   - academic identity fields
   - skills/interests arrays
   - opportunity type preferences
   - financial and location preferences
   - experience fields and available date

## 10. Waitlist Features

1. Public waitlist submission endpoint.
2. Email normalization and regex validation.
3. Duplicate email detection and conflict response.
4. Optional metadata capture (source/city/company).
5. Auth-aware created_by attachment when logged in.
6. Admin-side list retrieval support in DB utility.

## 11. Data, Persistence, and Storage Features

### 11.1 In-Memory Session Store

1. Global process-level map for session data.
2. Session TTL expiry (30 minutes).
3. Auto-purge expired records on access/save.

### 11.2 Supabase Persistence

1. Analysis sessions table persistence.
2. User profile table persistence.
3. Waitlist table persistence.
4. Session list query support.
5. Session-by-id fetch support.
6. Mark opportunity applied helper function.

### 11.3 Supabase Schema and Policies

1. Migration scripts for table creation.
2. Index creation for session and waitlist performance.
3. Row-level security enabling.
4. Policies for insert/select/update patterns by table.
5. Auth trigger for auto profile bootstrapping.

## 12. Security and Access Control Features

1. Supabase auth session check in protected layout.
2. Proxy/middleware update-session integration.
3. Route-level redirect logic for auth-required paths.
4. Login-route redirect away for authenticated users.
5. HttpOnly cookie use for Gmail tokens.
6. Input validation across main APIs.
7. In-memory rate limits for high-cost endpoints.

## 13. UI Component-Level Features

### 13.1 Opportunity and Result Components

1. PriorityBadge component with urgency-aware display.
2. OpportunityCard compact display component.
3. ResultsDashboard summary/filter component.
4. ScoreBreakdown animated bars component.
5. ActionChecklist list/check component.
6. ProcessingOverlay animated pipeline component.
7. InboxSimulator email preview component.

### 13.2 Chat Components

1. Chat window with message rendering.
2. Chat input with send controls.
3. Message bubble style differentiation by role.

### 13.3 Dashboard Layout Components

1. Sidebar navigation component.
2. Header with user/nav context.
3. User nav dropdown integration.

### 13.4 Shared UI Library Components

1. Avatar, Badge, Button, Card, Dialog.
2. Dropdown, Input, Label, Progress.
3. Table, Tabs, Textarea and utility wrappers.

## 14. Utility and Helper Features

1. ICS file generation and download helper.
2. Sample email datasets for demos.
3. Theme provider and persistent theme toggle.
4. Utility hooks:
   - use-applied tracking hook
   - use-profile/use-is-client helpers
5. Generic utility functions for class merging and formatting.

## 15. SEO and Discoverability Features

1. robots route generation.
2. sitemap route generation.
3. Site URL-aware metadata generation based on env.

## 16. Deployment and Environment Features

1. Vercel deployment config present.
2. Production build/start scripts.
3. Lint and build readiness commands.
4. Environment-driven provider/model configuration.
5. Demo mode/environment flags for stable presentations.
6. Auth bypass flags for controlled demos.

## 17. Demo Reliability and Fallback Features

1. Heuristic extraction fallback when model unavailable.
2. Demo fallback responses for AI chat endpoint.
3. Provider labeling in response for transparency.
4. Session dual-storage strategy (memory first, DB fallback).
5. User-visible status and error messaging across key flows.

## 18. Notes on Feature Maturity

1. Core opportunity analysis path is fully implemented and production-demo ready.
2. Export/share tools (print-to-PDF, WhatsApp copy, ICS) are implemented in results flow.
3. Analytics page currently uses prepared datasets instead of fully live aggregate calculations.
4. Some marketing page claims represent product direction, but this inventory prioritizes features backed by implemented code paths.
