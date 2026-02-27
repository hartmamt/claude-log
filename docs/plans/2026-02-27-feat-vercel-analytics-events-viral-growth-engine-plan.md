---
title: "Vercel Analytics Events + Viral Growth Engine"
type: feat
status: completed
date: 2026-02-27
deepened: 2026-02-27
---

# Vercel Analytics Events + Viral Growth Engine

## Enhancement Summary

**Deepened on:** 2026-02-27
**Agents used:** TypeScript Reviewer, Pattern Recognition, Performance Oracle, Security Sentinel, Code Simplicity, Frontend Races, Architecture Strategist, Framework Docs Researcher, Frontend Design, SEO Best Practices

### Key Changes from Original Plan
1. **Dropped mid-article content split** — All 7 reviewers flagged it as fragile (breaks callouts, code blocks, tables). Footer-only CTA instead.
2. **Deferred "already subscribed" UX** — Not MVP; current silent-success is harmless.
3. **Fixed RSS XML injection vulnerability** — Added proper XML escaping.
4. **Added RSS caching headers** — `s-maxage=3600` prevents per-request serverless invocations.
5. **Fixed `filter(Boolean)` type error** — Won't compile under strict mode without type predicate.
6. **Extracted shared `SITE_URL` constant** — Was hardcoded 9+ times.
7. **Corrected `track()` import path** — Must be `@vercel/analytics/react`, not `@vercel/analytics`.
8. **Enhanced Subscribe Confirmed guard** — `sessionStorage` + `useRef` to survive Suspense re-mounts.
9. **Removed `priority`/`changeFrequency` from sitemap** — Google ignores both. Added `lastModified`.
10. **Added `force-static` to sitemap** — Build-time generation, not per-request.

---

## Overview

insights.codes has @vercel/analytics installed but fires zero custom events and is missing critical SEO/traffic infrastructure. This plan adds high-signal analytics tracking, a complete SEO foundation (sitemap, RSS, robots.txt, enhanced metadata), social sharing on every post, and a post-footer subscribe CTA — a full growth engine.

## Problem Statement

1. **No analytics visibility**: The Vercel Analytics dashboard shows "No custom events" and "No flags". We have no data on subscribe conversions, share behavior, or engagement.
2. **No SEO infrastructure**: No sitemap.xml, no RSS feed, no robots.txt. Search engines and RSS readers cannot discover content.
3. **No social sharing**: Posts have no share buttons. Readers who want to share must manually copy URLs.
4. **No subscribe touchpoints on posts**: The subscribe form only appears on the homepage and /subscribe page. The 12 individual post pages — where engaged readers are — have zero subscribe CTAs.
5. **Incomplete OG metadata**: Per-post pages are missing `openGraph.type`, `openGraph.url`, `images[].alt`, and `twitter.site`.

## Proposed Solution

Five focused additions, each independently valuable:

1. **Vercel Analytics Custom Events** — Track 3 high-signal events (subscribe submitted, confirmed, share clicked)
2. **SEO Foundation** — sitemap.ts, RSS feed at /feed.xml, robots.ts, RSS autodiscovery
3. **Social Share Buttons** — Text-based X/LinkedIn/HN links on every post (bottom placement)
4. **Post-Footer Subscribe CTA** — Subscribe form after article content on every post page
5. **Enhanced SEO Metadata** — Fix missing OG tags on post pages

## Prerequisites

### Extract shared `SITE_URL` constant

**File:** `src/lib/constants.ts` (new)

The base URL is currently hardcoded in `src/app/api/subscribe/route.ts` and will be needed in 5+ new files. Extract once:

```tsx
export const SITE_URL = process.env.SITE_URL ?? "https://insights.codes";
```

Then import everywhere. This ensures preview deploys and staging environments work correctly.

### Add slug validation to `getPost()` (security hardening)

**File:** `src/lib/data.ts` (edit)

Pre-existing path traversal risk — `getPost()` builds file paths directly from slug. Add guard:

```tsx
export function getPost(slug: string): BlogPost | null {
  if (!slug || slug.includes("/") || slug.includes("\\") || slug.includes("..")) {
    return null;
  }
  // ... rest unchanged
}
```

## Technical Approach

### Event Budget Strategy (CRITICAL)

Vercel Analytics Hobby tier allows 2,500 custom events/month. Built-in pageviews do NOT count against this. Strategy:

- **Track only 3 high-signal events**: `Subscribe Submitted`, `Subscribe Confirmed`, `Share Clicked`
- **Do NOT track**: page views (already covered by built-in analytics) or generic "CTA clicked" (undefined, low-signal)
- **Worst-case math**: 500 share clicks + 200 subscribe attempts + 50 confirmations = 750 events/month — well within budget

### Phase 1: Analytics Events

#### 1a. `Subscribe Submitted` event (client-side)

**File:** `src/components/blog/SubscribeForm.tsx`

Add `track()` call **before** the state transition (track buffers synchronously):

```tsx
import { track } from "@vercel/analytics/react";

// Inside handleSubmit, after res.ok check:
// SECURITY: Do NOT include email or PII in analytics events
// track() is safe to call before <Analytics /> mounts —
// @vercel/analytics buffers events internally until the script loads.
track("Subscribe Submitted", { page: window.location.pathname });
setState("success");
setEmail("");
```

Properties: `{ page: string }` — which page the form was on (homepage, /subscribe, or a post slug).

> **Research insight:** Import from `@vercel/analytics/react`, NOT `@vercel/analytics`. The `/react` entry point is the correct one for client components. The base package re-exports it but the explicit path is clearer and safer.

#### 1b. `Subscribe Confirmed` event (client-side)

**File:** `src/components/blog/SubscribeStatus.tsx`

The `/api/confirm` route does a server-side redirect to `/subscribe?confirmed=true`. Track the confirmation client-side when the `confirmed` query param is detected.

**Critical:** Use `sessionStorage` in addition to `useRef` to survive Suspense re-mounts. The `SubscribeStatus` component wraps its content in `<Suspense>`. If the Suspense boundary re-suspends (slow connection, parent reset), the child unmounts and remounts with a fresh ref. `sessionStorage` persists across unmounts but scopes to the tab session.

```tsx
import { track } from "@vercel/analytics/react";
import { useEffect, useRef } from "react";

// Inside the component:
const confirmed = params.get("confirmed");
const tracked = useRef(false);

useEffect(() => {
  if (confirmed === "true" && !tracked.current) {
    const storageKey = "analytics:subscribe-confirmed";
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) return;
    tracked.current = true;
    sessionStorage.setItem(storageKey, "1");
    track("Subscribe Confirmed");
  }
}, [confirmed]);
```

> **Research insight:** Use the extracted `confirmed` string as the dependency, not the `params` object. `useSearchParams()` returns a new object on every render, causing unnecessary effect re-runs.

#### 1c. `Share Clicked` event (client-side)

**File:** `src/components/blog/ShareButtons.tsx` (new file)

Fire on share link click:

```tsx
track("Share Clicked", { platform, slug });
```

Properties: `{ platform: "x" | "linkedin" | "hn", slug: string }`.

### Phase 2: SEO Foundation

#### 2a. Sitemap

**File:** `src/app/sitemap.ts` (new)

Use Next.js built-in sitemap generation. Mark as `force-static` for build-time generation. Include `lastModified` from post dates. **Omit `priority` and `changeFrequency`** — Google ignores both.

```tsx
import type { MetadataRoute } from "next";
import { getAllPostSlugs, getPost } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllPostSlugs();

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/changelog`, lastModified: new Date() },
    { url: `${SITE_URL}/subscribe` },
    { url: `${SITE_URL}/setup` },
    ...slugs.map((slug) => {
      const post = getPost(slug);
      return {
        url: `${SITE_URL}/posts/${slug}`,
        lastModified: post?.date ? new Date(post.date) : undefined,
      };
    }),
  ];
}
```

> **Research insight:** Google's own documentation confirms: "We do use the `<lastmod>` value if it is consistently and verifiably accurate." They explicitly ignore `<priority>` and `<changefreq>`. Don't set `lastModified` to `new Date()` for post pages — Google will detect all pages share the same date and stop trusting it. Use actual post dates.

#### 2b. RSS Feed

**File:** `src/app/feed.xml/route.ts` (new)

Route handler with proper XML escaping, caching headers, and deterministic `lastBuildDate`. Use `getPostsIndex()` + `getPersonalPostsIndex()` (which strip content) since the feed only needs title/subtitle/date.

```tsx
import { getPostsIndex, getPersonalPostsIndex } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";
import type { BlogPost } from "@/types";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts: Omit<BlogPost, "content">[] = [
    ...getPostsIndex(),
    ...getPersonalPostsIndex(),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const lastBuildDate = posts.length > 0
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/posts/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/posts/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(post.subtitle)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>insights.codes</title>
    <link>${SITE_URL}</link>
    <description>Notes on building with AI — real patterns from real projects</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
```

> **Research insights:**
> - **XML injection (HIGH severity):** Original plan used CDATA which is vulnerable to `]]>` breakout. Switched to XML entity escaping via `escapeXml()` — simpler and safer.
> - **Performance:** Original loaded full post content (~97KB) via `getPost()` but only used title/subtitle. Switched to `getPostsIndex()` + `getPersonalPostsIndex()` which strip the content field, eliminating ~94KB of unnecessary I/O.
> - **Caching:** Added `s-maxage=3600` so Vercel CDN caches for 1 hour. Without this, every RSS poll hits a serverless function for content that changes at most weekly.
> - **Deterministic `lastBuildDate`:** Uses most recent post date instead of `new Date()`, which defeated caching and misled RSS readers.

#### 2c. robots.txt

**File:** `src/app/robots.ts` (new)

```tsx
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

> **Research insight:** `Disallow: /api/` is NOT access control — it only tells well-behaved crawlers not to index those URLs. The real protection comes from rate limiting and input validation (already present). The `Sitemap:` directive matters since Google deprecated the sitemap ping endpoint.

#### 2d. RSS Autodiscovery

**File:** `src/app/layout.tsx` (edit)

Add to existing metadata export:

```tsx
alternates: {
  types: {
    "application/rss+xml": [
      { url: "https://insights.codes/feed.xml", title: "insights.codes RSS Feed" },
    ],
  },
},
```

> **Research insight:** Using the array-of-objects format adds a `title` attribute to the `<link>` tag, which helps feed readers display a friendly name during subscription.

### Phase 3: Social Share Buttons

**File:** `src/components/blog/ShareButtons.tsx` (new)

Text-based, zero-dependency share links matching the monospace aesthetic. Uses slash separators to match the existing metadata row pattern (`category / reading time / date`). Includes "copy link" action.

```tsx
"use client";

import { track } from "@vercel/analytics/react";
import { useState } from "react";

type SharePlatform = "x" | "linkedin" | "hn";

interface ShareButtonsProps {
  title: string;
  slug: string;
  url: string; // Full URL passed from server component
}

export function ShareButtons({ title, slug, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shares: ReadonlyArray<{ label: string; platform?: SharePlatform; href?: string }> = [
    {
      label: "copy link",
    },
    {
      label: "x",
      platform: "x",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "linkedin",
      platform: "linkedin",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
      label: "hn",
      platform: "hn",
      href: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`,
    },
  ];

  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <span className="text-text-muted">share</span>
      <span className="text-border-light">/</span>
      {shares.map((s, i) => (
        <Fragment key={s.label}>
          {i > 0 && <span className="text-border-light">/</span>}
          {s.href ? (
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("Share Clicked", { platform: s.platform!, slug })}
              className="text-text-muted hover:text-accent transition-colors"
            >
              {s.label}
            </a>
          ) : (
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                track("Share Clicked", { platform: "copy", slug });
              }}
              className="text-text-muted hover:text-accent transition-colors cursor-pointer"
            >
              {copied ? "copied!" : s.label}
            </button>
          )}
        </Fragment>
      ))}
    </div>
  );
}
```

> **Research insights:**
> - **Slash separators** match the existing `category / reading time / date` pattern. Without them, the share row feels disconnected from the site's visual language.
> - **"Copy link"** gives readers a platform-agnostic share option that mirrors the existing CopyMarkdownButton pattern.
> - **Full URL as prop** from server component ensures preview deploys generate correct links. The original plan hardcoded the domain client-side.
> - **Union type for platform** ensures type safety on analytics events.

**Placement in post page** (`src/app/posts/[slug]/page.tsx`):
- **Top**: Co-located with CopyMarkdownButton in a shared utility row (`mt-4 flex items-center gap-4`)
- **Bottom**: After article content with `border-t border-border` separator, before prev/next nav

### Phase 4: Post-Footer Subscribe CTA

**Simplified from original plan.** No mid-article split. No separate component file. Inline the CTA markup directly in the post page.

**File:** `src/app/posts/[slug]/page.tsx` (edit)

Add after `</article>` and before the prev/next navigation:

```tsx
{/* Subscribe CTA */}
<div className="my-10 p-6 border border-border rounded-lg bg-[--color-accent-subtle] border-l-[3px] border-l-accent">
  <div className="font-mono text-[10px] text-accent font-semibold uppercase tracking-wider mb-2">
    enjoyed this?
  </div>
  <p className="text-sm text-text-muted mb-4">
    Get posts like this delivered to your inbox. No spam, no algorithms.
  </p>
  <SubscribeForm compact />
</div>
```

> **Research insights:**
> - **Dropped mid-article split** — ALL reviewers flagged this. Splitting raw markdown breaks `:::callout`, `:::prompt`, and `:::stat` directives, fenced code blocks, tables, and numbered lists. Two `<PostContent>` renders double the markdown parse cost. Footer-only CTA is the simplest thing that works.
> - **Inlined the wrapper** — A 14-line single-use component doesn't warrant its own file. Extract only if a second use appears.
> - **Accent-subtle background + left border** — Matches the existing callout visual language (border-left accent). `bg-[--color-accent-subtle]` uses the existing CSS variable `rgba(16, 185, 129, 0.1)`.
> - **Deferred "already subscribed" UX** — The current silent-success behavior is correct and harmless. A re-subscriber sees "Check your email" — no harm done. Polish later if user complaints surface.

### Phase 5: Enhanced SEO Metadata

**File:** `src/app/posts/[slug]/page.tsx` (edit generateMetadata)

Add missing fields. OG metadata in child pages **replaces** (not merges with) parent OG metadata, so all fields must be re-specified:

```tsx
import { SITE_URL } from "@/lib/constants";

// In generateMetadata:
return {
  title: post ? `${post.title} - insights.codes` : "Post - insights.codes",
  description: post?.subtitle,
  openGraph: {
    title: post?.title,
    description: post?.subtitle,
    type: "article",
    url: `${SITE_URL}/posts/${slug}`,
    siteName: "insights.codes",
    publishedTime: post?.date,
    authors: ["Matt Hartman"],
    images: [{ url: ogImage, width: 1200, height: 630, alt: post?.title || "insights.codes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: post?.title,
    description: post?.subtitle,
    images: [ogImage],
    creator: "@matthew_hartman",
    site: "@matthew_hartman",
  },
  alternates: {
    canonical: `${SITE_URL}/posts/${slug}`,
  },
};
```

> **Research insights:**
> - **`article:published_time`** and **`article:author`** are shown by some platforms and provide useful signals.
> - **`og:image:alt`** is required for accessibility and some social platforms show it as fallback text.
> - **OG shallow merge gotcha:** If you define `openGraph` in a child page, you lose ALL parent fields (including `siteName`, `images`). Everything must be re-specified.

## Acceptance Criteria

### Analytics Events
- [x] `Subscribe Submitted` fires with `{ page }` on successful form submission
- [x] `Subscribe Confirmed` fires once on `/subscribe?confirmed=true` load (guarded by sessionStorage)
- [x] `Share Clicked` fires with `{ platform, slug }` on share link click
- [x] Events appear in Vercel Analytics dashboard under Events tab
- [x] No PII (email addresses) in any analytics event

### SEO Foundation
- [x] `/sitemap.xml` returns valid XML with all post URLs + static pages + `lastModified` dates
- [x] `/feed.xml` returns valid RSS 2.0 with proper XML escaping and `Cache-Control` headers
- [x] `/robots.txt` allows all crawlers, disallows `/api/*`, references sitemap
- [x] RSS autodiscovery `<link>` tag with title present in HTML `<head>`

### Social Share Buttons
- [x] Share buttons (copy link, x, linkedin, hn) visible in post header utility row and after article content
- [x] Each link opens correct share URL in new tab with pre-filled title + URL
- [x] "Copy link" copies full URL to clipboard with feedback
- [x] Visual style uses slash separators matching existing metadata row pattern

### Post-Footer Subscribe CTA
- [x] Subscribe form appears after article content, before prev/next nav
- [x] CTA uses compact form with callout-style visual treatment (accent border, subtle background)

### Enhanced Metadata
- [x] Per-post pages include `og:type=article`, `og:url`, `og:image:alt`, `twitter:site`, `article:published_time`
- [x] Per-post pages include `alternates.canonical`

## Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/constants.ts` | **New** | Shared `SITE_URL` constant |
| `src/lib/data.ts` | Edit | Add slug validation to `getPost()` |
| `src/components/blog/SubscribeForm.tsx` | Edit | Add `track("Subscribe Submitted")` |
| `src/components/blog/SubscribeStatus.tsx` | Edit | Add `track("Subscribe Confirmed")` with sessionStorage guard |
| `src/components/blog/ShareButtons.tsx` | **New** | Social share buttons with copy link + analytics |
| `src/app/posts/[slug]/page.tsx` | Edit | Add share buttons, footer subscribe CTA, fix OG metadata |
| `src/app/layout.tsx` | Edit | Add RSS autodiscovery to metadata |
| `src/app/sitemap.ts` | **New** | Static sitemap with `lastModified` from post dates |
| `src/app/feed.xml/route.ts` | **New** | RSS 2.0 feed with XML escaping + CDN caching |
| `src/app/robots.ts` | **New** | robots.txt with /api/ disallow + sitemap reference |

## Dependencies & Risks

- **Event budget**: Strategy limits to ~750 events/month worst case (within 2,500 limit)
- **No new dependencies**: All features use existing packages (@vercel/analytics, next built-ins)
- **RSS content**: Feed includes subtitle only (not full markdown). Full content can be added later via `content:encoded` if desired.
- **In-memory rate limiter**: Pre-existing concern — resets on serverless cold start. Acceptable at current traffic. Consider Vercel KV if traffic grows.

## References

- [Vercel Analytics Custom Events](https://vercel.com/docs/analytics/custom-events) — `track()` API
- [Vercel Analytics Pricing](https://vercel.com/docs/analytics/limits-and-pricing) — 2,500 events/month hobby tier
- [Next.js Sitemap API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — `app/sitemap.ts`
- [Next.js Robots API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) — `app/robots.ts`
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — OG shallow merge behavior
- [Google Search Central: Sitemaps](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping) — `lastmod` usage, `priority`/`changefreq` ignored
- [RSS Board Best Practices](https://www.rssboard.org/rss-profile) — XML escaping, CDATA, `content:encoded`
- Existing analytics: `src/app/layout.tsx:49` — `<Analytics />` component
- Existing subscribe flow: `src/app/api/subscribe/route.ts`, `src/components/blog/SubscribeForm.tsx`
- Existing post template: `src/app/posts/[slug]/page.tsx`
