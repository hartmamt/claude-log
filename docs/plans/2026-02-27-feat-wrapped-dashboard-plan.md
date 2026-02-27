---
title: "feat: Add Wrapped-Style Interactive Dashboard"
type: feat
status: active
date: 2026-02-27
---

# feat: Add Wrapped-Style Interactive Dashboard

## Overview

Add a `/wrapped` page that presents Claude Code usage data as a Spotify Wrapped-style scrollable experience — full-viewport animated cards, each revealing one key insight with animated numbers and charts. Designed to be screenshot-friendly and shareable.

## Motivation

The site has incredibly rich behavioral data (multi-clauding events, time-of-day patterns, response time distributions, language ratios, goal breakdowns) but it's all buried in static blog posts. A Wrapped-style experience transforms these numbers into a viral, shareable format — the exact format that's proven to generate massive social sharing (Spotify Wrapped, GitHub Skyline, Strava Year in Review).

## Proposed Solution

A new page at `/wrapped` with:

- **Full-viewport cards** that snap-scroll vertically, each presenting one data story
- **Animated counters** that count up when the card scrolls into view
- **CSS-driven bar charts** that animate their fills on scroll
- **Shareable design** — dark backgrounds, high-contrast typography, looks great as screenshots
- **No external dependencies** — pure CSS animations + Intersection Observer API
- **Mobile responsive** — cards work at any viewport size

### Cards (in order):

1. **Hero** — "338 sessions. 924 hours. 256 commits." animated counter reveal
2. **The Clock** — Time-of-day visualization showing evening peak (1,140 messages)
3. **Multi-Clauding** — "I run multiple Claudes at once" with 81 overlap events
4. **The Loop** — 72-second median response time with the three modes breakdown
5. **What I Actually Do** — Bug Fix #1 goal ranking with animated bars
6. **The Language** — TypeScript 38:1 ratio visualization
7. **The Toolkit** — Top tools (Bash 4,135 / Read 3,412 / Edit 2,682) animated bars
8. **The Errors** — 323 failures across 338 sessions — "that's a feature"
9. **The Punchline** — Fun ending story (built a feature around a nonexistent file)
10. **Share Card** — Summary card with CTA to share + link to full blog

### Technical Approach

**New files:**
- `src/app/wrapped/page.tsx` — Server component shell, data loading
- `src/components/wrapped/WrappedCard.tsx` — Full-viewport card wrapper with scroll-snap
- `src/components/wrapped/AnimatedCounter.tsx` — Client component, count-up animation with IntersectionObserver
- `src/components/wrapped/AnimatedBar.tsx` — Client component, bar chart that fills on scroll
- `src/components/wrapped/WrappedShell.tsx` — Client component, scroll container with snap behavior
- `src/data/wrapped-data.json` — Static data file with all the behavioral numbers from the report

**Data source:** The behavioral data (time-of-day, multi-clauding, response times, tool errors, session types, goals) isn't in the insights JSON — it's only in the HTML report. We'll create a static `wrapped-data.json` with these numbers, updatable on future `/insights` runs.

**Styling:**
- CSS scroll-snap for card-to-card navigation
- CSS `@keyframes` for counter and bar animations
- Intersection Observer to trigger animations only when visible
- Existing design tokens (--color-accent, --color-secondary, etc.)
- Full-viewport height cards with flexbox centering

**No external deps.** Everything built with React 19 + CSS.

## Acceptance Criteria

- [ ] `/wrapped` page renders with 10 scrollable full-viewport cards
- [ ] Numbers animate (count up) when scrolled into view
- [ ] Bar charts animate their fill widths on scroll
- [ ] Each card is visually distinct and shareable as a screenshot
- [ ] Mobile responsive (works on phone screens)
- [ ] Navigation: link from header + standalone URL
- [ ] Static export works (`output: "export"`)
- [ ] Page builds and type-checks cleanly
- [ ] Dark theme consistent with rest of site

## References

- Site design system: `src/app/globals.css`
- Existing components: `src/components/blog/`
- Data loading: `src/lib/data.ts`
- Theme maps: `src/lib/theme.ts`
- Report HTML (source for numbers): `~/.claude/usage-data/report.html`
