---
title: "feat: Claude Code Wrapped — Spotify Wrapped for AI Coding"
type: feat
status: active
date: 2026-02-24
---

## Enhancement Summary

**Deepened on:** 2026-02-24
**Research agents used:** Frontend Design, Best Practices, Framework Docs, TypeScript Review, Performance Oracle, Security Sentinel, Architecture Strategist, Code Simplicity, Frontend Races, Pattern Recognition

### Key Improvements
1. **Simplified architecture:** 6 files instead of 17 — data-driven slide renderer replaces 8 separate slide components
2. **Better image library:** `modern-screenshot` over html2canvas (15KB vs 40KB gzipped, better font rendering)
3. **Type safety:** Zod validation, discriminated union state machine, proper TypeScript contracts
4. **Security hardened:** Prototype pollution prevention, XSS sanitization, analytics privacy exclusion, file size limits
5. **Race condition proof:** Transition locks, rAF cleanup, double-click guards, font loading gates
6. **Viral mechanics:** Identity statements over data reporting, pre-composed sharing, "Coding Personality" archetype slide

### Critical Security Items (Pre-Implementation)
- Add `src/data/insights.json` to `.gitignore` (contains un-anonymized client names)
- Exclude `/wrapped` from Vercel Analytics via `beforeSend`
- Sanitize all user-supplied strings before DOM rendering

---

# Claude Code Wrapped — Spotify Wrapped for AI Coding

## Overview

Add an interactive "/wrapped" experience where anyone can upload their Claude Code `/insights` JSON and get taken through a beautiful, animated, story-style reveal of their AI coding stats — just like Spotify Wrapped. At the end, they download or share a branded card to social media, driving organic viral traffic back to the site.

## Problem Statement / Motivation

The site currently showcases **one person's** Claude Code journey. There's no interactive element that engages visitors or compels them to share. Spotify Wrapped is one of the most consistently viral features ever built because it gives users a personalized, shareable identity artifact. This is the same mechanic applied to AI coding stats — something the developer community would eat up.

**Why it will go viral:**
- Developers love stats about their own productivity
- Claude Code users already have `/insights` data at `~/.claude/usage-data/facets/insights_data.json`
- Shareable cards create FOMO — "I want mine too"
- The concept is immediately understood (everyone knows Spotify Wrapped)
- Tech Twitter / LinkedIn / Bluesky audiences are perfectly aligned

### Research Insights: Viral Mechanics

Spotify Wrapped reached **227 million** monthly active users and generated an estimated **2.3 billion** social media impressions annually. The mechanics break down into five psychological drivers:

1. **Identity signaling, not data reporting.** Transform metrics into identity statements: not "974 hours" but "You're in the top 1% of AI-powered developers." Spotify's "Listening Age" feature generated 116,000+ social mentions because it invited commentary.
2. **Pre-composed sharing.** Users should never have to write a caption. The shareable card IS the post.
3. **Design for screenshots.** Many users screenshot and crop rather than using share buttons. Bold, high-contrast colors that pop in feeds.
4. **FOMO and exclusivity.** Progressive reveal (story format) rather than dumping all stats at once.
5. **Comparative framing.** Before/after, superlatives ("Your most productive day was October 14"), personality archetypes.

## Proposed Solution

A fully client-side `/wrapped` page with three phases:

1. **Landing** — Hero CTA with file upload + "Try Demo" button
2. **Story** — Full-screen animated slides revealing stats one-by-one (tap/click to advance, Instagram Stories style)
3. **Card** — Downloadable/shareable 1080x1080 summary card

All processing happens in the browser. No data leaves the client.

## Technical Approach

### Architecture (Simplified)

Per simplicity review: **6 new files instead of 17.** Data-driven slide renderer replaces 8 separate slide components. Phase state lives in the page component. Upload UI is inline in landing.

```
src/app/
  (main)/                    # Route group for existing pages
    layout.tsx              # Header + Footer + Analytics
    page.tsx                # Homepage
    about/page.tsx
    changelog/page.tsx
    setup/page.tsx
    posts/[slug]/page.tsx
  wrapped/
    layout.tsx              # Minimal layout: NO Header/Footer
    page.tsx                # Server shell (metadata only)
  layout.tsx                # Root: <html><body>{children}</body></html>

src/components/wrapped/
  WrappedLanding.tsx        # Hero + file input + demo button
  WrappedStory.tsx          # Slide container + data-driven renderer + progress bar
  WrappedCard.tsx           # 1080x1080 card + download/share buttons

src/data/
  demo-insights.json        # Hand-curated, pre-anonymized (committed)

public/
  og-wrapped.png            # OG image for /wrapped
```

### Research Insight: Route Groups

The root layout unconditionally renders `<Header />` and `<Footer />`. Rather than fighting z-index with a fixed overlay, use **Next.js route groups** to give `/wrapped` its own layout. Move existing pages under a `(main)/` route group. This eliminates scroll bleed, focus trap issues, and z-index conflicts.

### Data Flow

```
User uploads JSON  OR  clicks "Try Demo"
         |                        |
         v                        v
  JSON.parse + Zod         fetch("/demo-insights.json")
  validation                      |
         |                        |
         └────────┬───────────────┘
                  v
         extractWrappedData()
         → WrappedData interface
                  |
                  v
         WrappedStory (data-driven slides)
                  |
                  v
         WrappedCard (summary)
                  |
                  v
    await document.fonts.ready
    modern-screenshot → PNG blob
                  |
            ┌─────┴──────┐
            v             v
       Download      Web Share API
        as PNG       → intent URL fallback
```

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Card generation | **modern-screenshot** | 15KB gzipped (vs html2canvas 40KB), better font rendering, uses browser's native SVG foreignObject pipeline, actively maintained |
| Card size | **1080x1080** square | Works on Twitter, LinkedIn, Instagram. Universal. |
| Slide navigation | **Pointer events (tap/click)** | Unified mouse+touch via Pointer Events API, no double-fire issue. No swipe for v1 (YAGNI). |
| Slide rendering | **Data-driven renderer** | Single `SlideRenderer` component with config array, not 8 separate files |
| Slide layout | **Full-viewport** | Immersive. Own layout via route group (no Header/Footer). |
| Demo data | **Hand-curated JSON in `public/`** | No build-time script needed. `fetch("/demo-insights.json")` keeps it out of JS bundle. |
| Data source | `~/.claude/usage-data/facets/insights_data.json` | Claude Code already writes this file. |
| JSON validation | **Zod** | Runtime type safety, 13KB gzipped, returns discriminated union result. No hand-rolled validation. |
| Animation | **CSS transitions + refs with direct DOM mutation** | No React re-renders during counter animation. Zero dependencies. |
| State management | **useReducer with discriminated union** | 4 phases with non-linear transitions (watch again, try own). Makes impossible states unrepresentable. |
| Sharing | **Download + Copy Link** | Simple, universal. Web Share API as progressive enhancement. No separate share.ts file needed. |

### Research Insight: modern-screenshot vs html2canvas

| Feature | html2canvas | modern-screenshot |
|---------|-------------|-------------------|
| Bundle size (gzipped) | ~40KB | ~15KB |
| Font rendering | Reimplements CSS rendering | Uses browser's native engine via SVG foreignObject |
| CSS support | No filters, blend modes, object-fit | Better — relies on browser's renderer |
| Maintenance | Last published Jan 2023 | Actively maintained |
| Custom font handling | Requires `document.fonts.ready` + `useCORS` | Same, but more reliable output |

Also consider `snapdom` (newest, fastest) as a drop-in alternative.

### Type System

```typescript
// src/types/index.ts

/** Core usage statistics shared across site stats and wrapped data */
export interface UsageStats {
  totalSessions: number;
  totalMessages: number;
  totalHours: number;
  totalCommits: number;
}

/** A project extracted from insights data */
export interface WrappedProject {
  name: string;
  sessions: number;
  description: string;
}

export interface WrappedData extends UsageStats {
  year: number;
  dateRange: { start: string; end: string };
  projects: WrappedProject[];
  topWorkflow: string | null;
  topStrength: string | null;
  personality: string;
}

// Derived — computed, never stored
export function deriveWrappedMeta(data: WrappedData) {
  return {
    projectCount: data.projects.length,
    topProject: data.projects.length > 1
      ? data.projects.reduce((a, b) => (a.sessions > b.sessions ? a : b))
      : null,
    hasCommits: data.totalCommits > 0,
    hasTopWorkflow: data.topWorkflow !== null,
    workWeeks: Math.round((data.totalHours / 40) * 10) / 10,
  } as const;
}
```

**Key changes from original plan:**
- Removed `projectCount` (derivable from `projects.length`)
- Removed `topProject` as stored field (derivable from `projects` array)
- Added `year` field for future multi-year support
- Extracted `UsageStats` base interface shared with existing `SiteStats`
- Used `WrappedProject` named type instead of inline anonymous objects

### State Machine

```typescript
// In src/app/wrapped/page.tsx (or colocated types file)

type WrappedState =
  | { phase: "landing" }
  | { phase: "story"; data: WrappedData; isDemo: boolean }
  | { phase: "card"; data: WrappedData; isDemo: boolean };

type WrappedAction =
  | { type: "START_DEMO"; data: WrappedData }
  | { type: "DATA_LOADED"; data: WrappedData }
  | { type: "STORY_COMPLETE" }
  | { type: "WATCH_AGAIN" }
  | { type: "TRY_OWN" }
  | { type: "RESET" };
```

### JSON Validation with Zod

```typescript
// In src/app/wrapped/page.tsx or a small wrapped-utils.ts

import { z } from "zod";

const InsightsSchema = z.object({
  project_areas: z.object({
    areas: z.array(z.object({
      name: z.string(),
      session_count: z.number().int().nonnegative(),
      description: z.string(),
    })).min(1),
  }),
  interaction_style: z.object({
    narrative: z.string(),
    key_pattern: z.string(),
  }),
  what_works: z.object({
    impressive_workflows: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
  }),
});

export function parseInsights(raw: string):
  | { success: true; data: WrappedData }
  | { success: false; error: string } {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch { return { success: false, error: "Invalid JSON syntax." }; }

  const result = InsightsSchema.safeParse(parsed);
  if (!result.success) {
    return { success: false, error: `Missing field: ${result.error.issues[0].path.join(".")}` };
  }

  return { success: true, data: extractWrappedData(result.data) };
}
```

### Implementation Phases

#### Phase 1: Layout Restructure + Data Layer

**Tasks:**

- [ ] Restructure layouts using route groups:
  - Create `src/app/(main)/layout.tsx` with Header + Footer + Analytics
  - Move existing pages under `(main)/`: `page.tsx`, `about/`, `changelog/`, `setup/`, `posts/`
  - Simplify root `src/app/layout.tsx` to just `<html><body>{children}</body></html>`
  - Create `src/app/wrapped/layout.tsx` as minimal pass-through (no Header/Footer)
- [ ] Add `WrappedData`, `WrappedProject`, `UsageStats` interfaces to `src/types/index.ts`
- [ ] Update `SiteStats` to extend `UsageStats`
- [ ] Install Zod: `npm i zod`
- [ ] Create `parseInsights()` function with Zod validation
- [ ] Create `extractWrappedData()` function mapping validated JSON to `WrappedData`
- [ ] Hand-curate `public/demo-insights.json` from existing site stats (anonymized)
- [ ] Create `src/app/wrapped/page.tsx` server shell with metadata:
  - Title: `"Claude Code Wrapped - /insights"` (dash separator, matching existing convention)
  - OG image, description
- [ ] Build landing page (`WrappedLanding.tsx`) with:
  - Hero: "Your Year in Code" with "in Code" in `text-accent`
  - Pre-heading: `CLAUDE CODE // 2026 RECAP` in `font-mono tracking-[0.3em]`
  - File input (styled native `<input type="file" accept=".json">`)
  - "Try Demo" button
  - Helper text with JSON file path
  - Breadcrumb matching existing pattern
  - Staggered entrance animations (CSS keyframes, 200ms delays)
- [ ] Wire up `useReducer` state machine for phase transitions
- [ ] Add security measures:
  - File size limit: 1MB max before reading
  - Prototype pollution key stripping after JSON.parse
  - String sanitization (HTML tag stripping, 500 char max per field)

**Security requirement:** Add `src/data/insights.json` and `src/data/insights-archive/` to `.gitignore`. The raw insights file contains un-anonymized client names (ActionTree, Anchor Fitness, StreamFit).

**Success criteria:**
- User can upload valid JSON and see parsed WrappedData
- Demo button loads anonymized data via fetch
- Invalid JSON shows clear Zod error message
- File over 1MB rejected with message
- Route groups working: `/wrapped` has no Header/Footer, other pages unchanged

#### Phase 2: Story Slides (Data-Driven)

**Files to create:**

- `src/components/wrapped/WrappedStory.tsx` — Slide container + data-driven renderer + progress bar

**Tasks:**

- [ ] Build data-driven slide manifest:
  ```typescript
  interface SlideConfig {
    id: string;
    type: "hero" | "stat" | "bar-chart" | "quote" | "summary";
    shouldShow: (data: WrappedData) => boolean;
    gradient: string; // CSS class
    extract: (data: WrappedData) => SlideContent;
  }

  const SLIDES: SlideConfig[] = [
    { id: "intro", type: "hero", shouldShow: () => true,
      gradient: "wrapped-bg-emerald",
      extract: (d) => ({ title: `Your ${d.year} with Claude Code`, subtitle: d.personality }) },
    { id: "sessions", type: "stat", shouldShow: () => true,
      gradient: "wrapped-bg-indigo",
      extract: (d) => ({ label: "CODING SESSIONS", value: d.totalSessions }) },
    { id: "hours", type: "stat", shouldShow: () => true,
      gradient: "wrapped-bg-amber",
      extract: (d) => ({ label: "HOURS WITH AI", value: d.totalHours,
        subtitle: `That's ${deriveWrappedMeta(d).workWeeks} work weeks` }) },
    { id: "commits", type: "stat",
      shouldShow: (d) => d.totalCommits > 0,
      gradient: "wrapped-bg-emerald",
      extract: (d) => ({ label: "COMMITS SHIPPED", value: d.totalCommits }) },
    { id: "personality", type: "hero", shouldShow: () => true,
      gradient: "wrapped-bg-mesh",
      extract: (d) => ({ title: getCodingArchetype(d), subtitle: getArchetypeDescription(d) }) },
    { id: "projects", type: "bar-chart", shouldShow: () => true,
      gradient: "wrapped-bg-indigo",
      extract: (d) => ({ label: "YOUR PROJECTS", items: d.projects }) },
    { id: "top-workflow", type: "quote",
      shouldShow: (d) => d.topWorkflow !== null,
      gradient: "wrapped-bg-emerald",
      extract: (d) => ({ label: "TOP WORKFLOW", quote: d.topWorkflow! }) },
    { id: "summary", type: "summary", shouldShow: () => true,
      gradient: "wrapped-bg-spectrum",
      extract: (d) => ({ ...d }) },
  ];
  ```
- [ ] Build `WrappedStory` container:
  - Full-viewport (100dvh, position fixed, z-50)
  - Progress bars at top (thin segments, active fills with `linear-gradient(90deg, #10b981, #6366f1)`)
  - **Pointer events** for navigation (not separate click + touch): `onPointerUp` on container
  - Left 33% = go back, right 67% = advance (Instagram convention)
  - Keyboard: ArrowRight/Space = advance, ArrowLeft = back, Escape = exit
  - **Transition lock:** state machine refuses input during CSS transition, unlocks on `onTransitionEnd`
  - Slide transition: vertical wipe via `clip-path: inset()` animation, 300ms with `cubic-bezier(0.16, 1, 0.3, 1)`
- [ ] Build `SlideRenderer` (single component handling all slide types):
  - `"hero"`: Large font-mono title + subtitle
  - `"stat"`: Label (xs, tracking-wide, muted) + animated number (7xl-9xl, font-mono, tabular-nums) + context line
  - `"bar-chart"`: Horizontal bars showing projects by session count
  - `"quote"`: Quote-style display with large quotation marks
  - `"summary"`: Grid of all stats + "Share Your Wrapped" CTA
- [ ] Build animated number counter using **refs + direct DOM mutation** (no React re-renders):
  ```typescript
  useEffect(() => {
    const el = spanRef.current;
    if (!el || reducedMotion) { el!.textContent = target.toLocaleString(); return; }
    let start: number | null = null;
    let rafId: number;
    const canceled = { current: false };
    function animate(ts: number) {
      if (canceled.current) return;
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 1200, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress); // easeOutExpo
      el!.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);
    return () => { canceled.current = true; cancelAnimationFrame(rafId); };
  }, [target, reducedMotion]);
  ```
- [ ] Add "Coding Personality" archetype logic:
  - High sessions + short duration = "The Sprinter"
  - Few sessions + long duration = "The Deep Diver"
  - High commit count = "The Shipper"
  - Many projects = "The Polyglot"
- [ ] Add `prefers-reduced-motion` support:
  - Query `window.matchMedia('(prefers-reduced-motion: reduce)')`
  - Skip counter animations (show final value immediately)
  - Instant slide transitions (no clip-path animation)
  - Manual navigation only (no auto-advance)
  - Listen for changes (user might toggle mid-session)
- [ ] Add gradient CSS classes to `globals.css`:
  ```css
  .wrapped-bg-emerald { background: linear-gradient(160deg, #09090b 0%, #064e3b 50%, #09090b 100%); }
  .wrapped-bg-indigo { background: linear-gradient(160deg, #09090b 0%, #1e1b4b 50%, #09090b 100%); }
  .wrapped-bg-amber { background: linear-gradient(160deg, #09090b 0%, #451a03 50%, #09090b 100%); }
  .wrapped-bg-mesh { background: radial-gradient(circle at 20% 30%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.15) 0%, transparent 50%), #09090b; }
  .wrapped-bg-spectrum { background: linear-gradient(160deg, #064e3b 0%, #1e1b4b 33%, #3b0764 66%, #451a03 100%); }
  ```
- [ ] Add subtle decorative elements per slide (CSS `::after` pseudo-elements, 2-3% opacity):
  - Pulsing terminal cursor `_` on intro slide
  - Faint `{ }` pattern at massive scale on stat slides

**Performance requirements:**
- Use `will-change: clip-path` on slide container
- Counter duration: 800-1200ms (not 1500ms — the tail gets boring)
- Only `transform` and `opacity` for GPU-accelerated transitions
- Preload `modern-screenshot` on penultimate slide: `import("modern-screenshot")`

**Success criteria:**
- Smooth slide transitions with progress indication
- Numbers animate satisfyingly via direct DOM mutation
- Transition lock prevents rapid-click bugs
- Works on mobile and desktop with pointer events
- Keyboard accessible
- Reduced motion fully respected
- "Coding Personality" slide adds fun/shareable element

#### Phase 3: Shareable Card + Sharing

**Files to create/modify:**

- `src/components/wrapped/WrappedCard.tsx` — Card component + download/share buttons
- `src/components/layout/Header.tsx` — Add "Wrapped" nav link
- `public/og-wrapped.png` — OG image for /wrapped page

**Tasks:**

- [ ] Install modern-screenshot: `npm i modern-screenshot`
- [ ] Design the shareable card component (1080x1080):
  ```
  +--------------------------------------------------+
  |                                                  |
  |  CLAUDE CODE // 2026 WRAPPED                     |  mono, xs, white/50
  |                                                  |
  |           1,247                                  |  hero stat, 160px+
  |           sessions                               |  label
  |                                                  |
  |  +----------+  +----------+  +----------+        |
  |  |  42,891  |  |   974    |  |     5    |        |  secondary stats
  |  | messages |  |   hours  |  | projects |        |
  |  +----------+  +----------+  +----------+        |
  |                                                  |
  |  "The Shipper"                                   |  personality, accent
  |                                                  |
  |  /insights                slashinsights.codes    |  bottom bar, branding
  +--------------------------------------------------+
  ```
  - Dark background (#09090b) — NO complex gradients (image capture compatibility)
  - Hero stat in white with emerald `text-shadow: 0 0 40px`
  - Secondary stats: emerald for sessions, indigo for messages, amber for hours
  - JetBrains Mono throughout (verify with `document.fonts.check('16px "JetBrains Mono"')`)
  - Bottom bar: thin `border-t border-white/10` with brand marks
- [ ] Implement card-to-PNG pipeline:
  ```typescript
  async function generateCard(element: HTMLElement): Promise<Blob> {
    await document.fonts.ready; // CRITICAL: wait for fonts
    const { domToPng } = await import("modern-screenshot");
    const dataUrl = await domToPng(element, { width: 1080, height: 1080, quality: 1 });
    const response = await fetch(dataUrl);
    return response.blob();
  }
  ```
  - Render card in off-screen container (`position: absolute; left: -9999px; width: 1080px; height: 1080px`)
  - NOT `display: none` (no computed layout = capture fails)
  - **Double-click guard:** state machine (`ready | generating | done | error`), refuse during `generating`
  - Revoke blob URLs after download to prevent memory leaks
- [ ] Implement download:
  ```typescript
  function downloadCard(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claude-code-wrapped.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  ```
- [ ] Implement share (progressive enhancement):
  ```typescript
  async function shareCard(blob: Blob, stats: WrappedData) {
    const text = `I coded with Claude for ${stats.totalHours} hours across ${stats.totalSessions} sessions. Get your Wrapped: slashinsights.codes/wrapped`;
    const file = new File([blob], "claude-code-wrapped.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], text }); return; }
      catch (e) { if ((e as Error).name === "AbortError") return; }
    }
    // Fallback: copy link + show toast
    await navigator.clipboard.writeText("https://slashinsights.codes/wrapped");
  }
  ```
  - Show "Share" on supported browsers, "Save Image" on others
  - Twitter intent link: `<a>` with `href="https://twitter.com/intent/tweet?text=...&url=..."` (no utility file needed)
- [ ] Add "Wrapped" link to Header nav (in `(main)/layout.tsx` Header)
- [ ] Add "Watch Again" button on card screen
- [ ] Add "Upload Your Own" CTA after demo mode completes
- [ ] Exclude `/wrapped` from Vercel Analytics:
  ```typescript
  <Analytics beforeSend={(event) => {
    if (event.url.includes('/wrapped')) return null;
    return event;
  }} />
  ```

**Success criteria:**
- Card downloads as clean 1080x1080 PNG with correct fonts
- `document.fonts.ready` prevents fallback font rendering
- Double-click on download is safely handled
- Share works on mobile (native), falls back to copy-link on desktop
- "Wrapped" appears in site navigation
- No user data captured by analytics

## Slide Deck Specification

| # | Slide | Type | Gradient | Content | Conditional |
|---|-------|------|----------|---------|-------------|
| 1 | Intro | hero | `.wrapped-bg-emerald` | "Your {year} with Claude Code" + personality | Always |
| 2 | Sessions | stat | `.wrapped-bg-indigo` | Animated counter + "coding sessions" | Always |
| 3 | Hours | stat | `.wrapped-bg-amber` | Animated counter + "That's {W} work weeks" | Always |
| 4 | Commits | stat | `.wrapped-bg-emerald` | Animated counter + "commits shipped" | Skip if 0 |
| 5 | Personality | hero | `.wrapped-bg-mesh` | Coding archetype title + description | Always |
| 6 | Projects | bar-chart | `.wrapped-bg-indigo` | Horizontal bars showing project breakdown | Always |
| 7 | Top Workflow | quote | `.wrapped-bg-emerald` | Quote-style: best workflow description | Skip if missing |
| 8 | Summary | summary | `.wrapped-bg-spectrum` | All stats grid + "Share Your Wrapped" CTA | Always |

### Slide Typography System

Every slide follows a consistent typographic hierarchy:
- **Label**: `font-mono text-xs tracking-[0.25em] uppercase text-white/50`
- **Number**: `font-mono text-7xl md:text-9xl font-bold tabular-nums` in the slide's accent color
- **Context**: `font-sans text-base text-white/60`
- Text shadow on numbers: `text-shadow: 0 0 40px currentColor` (subtle glow, intensifies during counter animation)

### Coding Personality Archetypes

| Pattern | Title | Description |
|---------|-------|-------------|
| High sessions + short avg duration | "The Sprinter" | Rapid-fire micro-sessions, fast iteration |
| Few sessions + long avg duration | "The Deep Diver" | Marathon coding blocks, deep focus |
| High commit count relative to sessions | "The Shipper" | Ships fast, commits often |
| Many projects (4+) | "The Polyglot" | Working across many codebases |
| Default | "The Builder" | Consistent, steady progress |

## Acceptance Criteria

### Functional Requirements

- [ ] User can upload a JSON file via file picker
- [ ] Invalid JSON shows a clear, helpful Zod error message with the failing field path
- [ ] Files over 1MB are rejected before parsing
- [ ] "Try Demo" loads pre-anonymized data via `fetch("/demo-insights.json")`
- [ ] Story slides advance on click/tap (right 67%), go back on left 33% click
- [ ] Keyboard navigation works (ArrowRight/Space = advance, ArrowLeft = back, Escape = exit)
- [ ] Numbers animate with easeOutExpo counting effect (refs, not React state)
- [ ] Slides with zero/missing data are automatically skipped via `shouldShow` predicates
- [ ] "Coding Personality" archetype is derived and displayed
- [ ] Shareable card renders as 1080x1080 PNG with correct fonts
- [ ] Download button saves PNG (with double-click protection)
- [ ] Share button uses Web Share API where available, falls back to copy-link
- [ ] "Watch Again" replays the story
- [ ] "Upload Your Own" appears after demo mode
- [ ] No user data is sent to any server or captured by analytics

### Non-Functional Requirements

- [ ] `prefers-reduced-motion` disables all animations, shows values immediately
- [ ] Card text has sufficient contrast at thumbnail sizes (300x300)
- [ ] Page loads quickly (modern-screenshot lazy-loaded via dynamic import)
- [ ] Works in Chrome, Safari, Firefox, Edge
- [ ] Responsive: works on mobile (360px) through desktop (1440px+)
- [ ] All user strings rendered as React text children only (never `dangerouslySetInnerHTML`)
- [ ] Named exports on all components (`export function`, matching existing convention)

### Security Requirements

- [ ] File size limit enforced before FileReader reads
- [ ] Prototype pollution keys stripped after JSON.parse (`__proto__`, `constructor`, `prototype`)
- [ ] All user string fields sanitized (HTML tags stripped, length truncated to 500 chars)
- [ ] `/wrapped` route excluded from Vercel Analytics via `beforeSend`
- [ ] `src/data/insights.json` added to `.gitignore`
- [ ] modern-screenshot configured with no cross-origin requests

## Dependencies & Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Users can't find their insights JSON | Medium | Clear instructions with file path + terminal `cp` command |
| modern-screenshot renders card incorrectly | Low | Keep card CSS simple — solid background, no filters/blend-modes. Test across browsers. |
| Font not loaded when card captured | Medium | `await document.fonts.ready` + `document.fonts.check()` verification |
| Rapid clicking breaks slide transitions | High | Transition lock via state machine + `onTransitionEnd` |
| Double-click on download creates duplicate PNGs | Medium | State guard: refuse during "generating" state |
| InsightsData schema changes across versions | Low | Zod schema with `.optional()` on non-critical fields, graceful fallbacks |
| Un-anonymized data shipped to production | Medium | Hand-curate demo JSON, verify no ANONYMIZE_RULES matches |
| @vercel/analytics captures /wrapped traffic | High | `beforeSend` filter returning null for /wrapped URLs |

## File Manifest

### New Files
```
src/app/(main)/layout.tsx                    # Header + Footer + Analytics (moved from root)
src/app/wrapped/layout.tsx                   # Minimal layout (no Header/Footer)
src/app/wrapped/page.tsx                     # Server shell (metadata) + "use client" interactive flow
src/components/wrapped/WrappedLanding.tsx     # Hero + file input + demo button
src/components/wrapped/WrappedStory.tsx       # Slide container + data-driven renderer + progress bar
src/components/wrapped/WrappedCard.tsx        # 1080x1080 card + download/share
public/demo-insights.json                    # Hand-curated, anonymized demo data
public/og-wrapped.png                        # OG image for /wrapped
```

### Modified Files
```
src/app/layout.tsx                           # Simplified to root shell (html/body only)
src/types/index.ts                           # Add WrappedData, WrappedProject, UsageStats; update SiteStats
src/components/layout/Header.tsx             # Add "Wrapped" nav link
src/app/globals.css                          # Add .wrapped-bg-* gradient classes
package.json                                 # Add modern-screenshot, zod
.gitignore                                   # Add src/data/insights.json, src/data/insights-archive/
```

### Files Moved (Route Group Restructure)
```
src/app/page.tsx             → src/app/(main)/page.tsx
src/app/about/page.tsx       → src/app/(main)/about/page.tsx
src/app/changelog/page.tsx   → src/app/(main)/changelog/page.tsx
src/app/setup/page.tsx       → src/app/(main)/setup/page.tsx
src/app/posts/[slug]/page.tsx → src/app/(main)/posts/[slug]/page.tsx
```

## References

- [Spotify Wrapped UX analysis](https://www.icypluto.com/blog/spotify-wrapped-the-viral-marketing-campaign-that-turned-your-music-taste-into-brand-gold) — 227M users, 2.3B impressions
- [DOM-to-image best practices (monday.com)](https://engineering.monday.com/capturing-dom-as-image-is-harder-than-you-think-how-we-solved-it-at-monday-com/) — font loading, CORS, performance
- [modern-screenshot](https://github.com/nicoth-in/modern-screenshot) — monday.com's chosen library
- [Web Share API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) — ~92% global coverage, Firefox desktop excluded
- [Easing functions](https://easings.net/) — easeOutExpo for premium counter feel
- [prefers-reduced-motion MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — ~35% of adults 40+ have vestibular sensitivity
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports) — "use client" + dynamic import patterns
- [Tailwind CSS 4 animations](https://tailwindcss.com/docs/animation) — @theme for custom keyframes
- Existing stat extraction: `scripts/generate-posts.ts:146-168`
- Existing anonymization: `scripts/generate-posts.ts:64-73`
- Existing theme: `src/app/globals.css`
- InsightsData source: `~/.claude/usage-data/facets/insights_data.json`
