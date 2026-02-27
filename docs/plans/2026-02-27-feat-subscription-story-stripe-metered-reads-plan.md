---
title: "feat: Subscription Story Blog Post, Stripe Donations, and Metered Reading"
type: feat
status: completed
date: 2026-02-27
brainstorm: docs/brainstorms/2026-02-27-subscription-story-stripe-metered-reads-brainstorm.md
---

# feat: Subscription Story Blog Post, Stripe Donations, and Metered Reading

## Overview

Three interconnected features for insights.codes:

1. **Personal essay** about building our own subscription system vs SaaS — hand-authored JSON in `src/data/personal-posts/`
2. **One-time Stripe donations** — voluntary financial support via Stripe Checkout (`mode: "payment"`, `submit_type: "donate"`)
3. **5-article metered reading** — localStorage-based soft paywall that drives free email subscriptions with blur + subscribe overlay

## Problem Statement / Motivation

The blog has a free subscription flow (Supabase + Resend) but no content about *why* we built it ourselves, no way for readers to financially support the blog, and no conversion mechanism to nudge casual readers toward subscribing. The Stripe payment system was added and removed within 4 hours on Feb 27 — that story itself is worth telling.

## Proposed Solution

### Phase 1: Metered Reading Gate

Build the localStorage-based meter and blur overlay first — this is the conversion engine that makes the other two features more impactful.

**New files:**
- `src/components/blog/MeterGate.tsx` — Client component that wraps article content

**Modified files:**
- `src/app/posts/[slug]/page.tsx` — Wrap `<PostContent>` with `<MeterGate>`
- `src/components/blog/SubscribeForm.tsx` — Add optional `onSuccess` callback prop
- `src/components/blog/SubscribeStatus.tsx` — Set localStorage confirmed flag on `?confirmed=true`

#### MeterGate.tsx Implementation

```tsx
// src/components/blog/MeterGate.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { SubscribeForm } from "./SubscribeForm";
import { track } from "@vercel/analytics/react";

const VISITED_KEY = "insights_visited_slugs";
const SUBSCRIBER_KEY = "insights_subscriber_confirmed";
const FREE_ARTICLE_LIMIT = 5;

export function MeterGate({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const [gated, setGated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Confirmed subscribers bypass
    if (localStorage.getItem(SUBSCRIBER_KEY) === "true") return;

    // Track unique slug visit
    const visited: string[] = JSON.parse(
      localStorage.getItem(VISITED_KEY) || "[]"
    );
    if (!visited.includes(slug)) {
      visited.push(slug);
      localStorage.setItem(VISITED_KEY, JSON.stringify(visited));
    }

    // Gate if over limit
    if (visited.length > FREE_ARTICLE_LIMIT) {
      setGated(true);
      track("Meter Gate Shown", { slug, articlesRead: visited.length });
    }
  }, [slug]);

  // Listen for cross-tab localStorage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SUBSCRIBER_KEY && e.newValue === "true") {
        setGated(false);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleSubscribeSuccess = useCallback(() => {
    // Reset counter and ungate on email submission
    localStorage.removeItem(VISITED_KEY);
    setGated(false);
    track("Meter Gate Unlocked", { slug });
  }, [slug]);

  if (!mounted || !gated) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* First paragraph visible, rest blurred */}
      <div className="meter-gated-content">{children}</div>

      {/* Overlay */}
      <div className="meter-overlay" role="dialog" aria-label="Subscribe to keep reading">
        <div className="max-w-md mx-auto text-center">
          <div className="font-mono text-[10px] text-accent font-semibold uppercase tracking-wider mb-2">
            free articles remaining: 0
          </div>
          <h3 className="font-mono text-xl font-bold text-foreground mb-2">
            Subscribe to keep reading
          </h3>
          <p className="text-text-muted text-sm mb-6">
            You&apos;ve read your 5 free articles. Enter your email to unlock
            all content — free, no spam.
          </p>
          <SubscribeForm compact onSuccess={handleSubscribeSuccess} />
        </div>
      </div>
    </div>
  );
}
```

#### CSS for meter gate (add to globals.css)

```css
.meter-gated-content {
  /* Show first ~200px clearly, then blur */
}

.meter-gated-content > :first-child {
  filter: none;
}

.meter-gated-content > :not(:first-child) {
  filter: blur(5px);
  user-select: none;
  pointer-events: none;
}

.meter-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* Gradient fade from transparent to background */
  background: linear-gradient(
    to bottom,
    transparent,
    var(--color-background) 30%
  );
  padding: 8rem 1.5rem 3rem;
}
```

#### SubscribeForm.tsx changes

- [x] Add `onSuccess?: () => void` prop to `SubscribeForm`
- [x] Call `onSuccess?.()` after successful submission (line 33, after `setState("success")`)

#### SubscribeStatus.tsx changes

- [x] In the `useEffect` where `confirmed === "true"`, add: `localStorage.setItem("insights_subscriber_confirmed", "true")`

#### PostPage integration

- [x] Import `MeterGate` in `src/app/posts/[slug]/page.tsx`
- [x] Wrap `<PostContent content={post.content} />` with `<MeterGate slug={slug}>`
- [x] Pass slug as prop

#### localStorage schema

| Key | Type | Purpose |
|-----|------|---------|
| `insights_visited_slugs` | `string[]` (JSON) | Array of unique slugs visited |
| `insights_subscriber_confirmed` | `"true"` | Set when user confirms via email link |

### Phase 2: One-Time Stripe Donations

Bring back voluntary financial support with minimal surface area.

**New files:**
- `src/lib/stripe.ts` — Lazy-init Stripe client (same pattern as supabase.ts/resend.ts)
- `src/app/api/checkout/route.ts` — Create Stripe Checkout session
- `src/app/api/webhooks/stripe/route.ts` — Webhook to record payments reliably
- `src/app/thanks/page.tsx` — Thank-you page after donation

**Modified files:**
- `src/app/subscribe/page.tsx` — Add "Support the blog" section with donation UI
- `package.json` — Add `stripe` dependency

#### Why webhooks after all

The brainstorm said "no webhooks" but Stripe's official docs are clear: redirect alone is unreliable (network drops, tab closes). Since we want to record `support_amount_cents` in the DB, a minimal webhook is the right call. It's one endpoint, one event type (`checkout.session.completed`), ~30 lines of code.

#### src/lib/stripe.ts

```typescript
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}
```

#### src/app/api/checkout/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://insights.codes";
const MIN_AMOUNT = 100;   // $1.00
const MAX_AMOUNT = 50000; // $500.00

export async function POST(req: NextRequest) {
  const { amount } = await req.json();

  // Validate amount server-side
  if (!amount || typeof amount !== "number" || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return NextResponse.json(
      { error: "Amount must be between $1 and $500" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    submit_type: "donate",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Support insights.codes" },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${SITE_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/subscribe`,
  });

  return NextResponse.json({ url: session.url });
}
```

#### src/app/api/webhooks/stripe/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.text(); // Raw body for signature verification
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.customer_details?.email) {
      const supabase = getSupabase();
      await supabase.from("subscribers").upsert(
        {
          email: session.customer_details.email,
          support_amount_cents: session.amount_total,
          stripe_customer_id: session.customer,
        },
        { onConflict: "email" }
      );
    }
  }

  return NextResponse.json({ received: true });
}
```

#### src/app/thanks/page.tsx

```typescript
// Simple thank-you page — no session verification needed
// The webhook handles DB recording reliably
export default function ThanksPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <h1 className="font-mono text-2xl font-bold text-foreground mb-4">
        Thank you for your support!
      </h1>
      <p className="text-text-muted text-sm mb-8">
        Your donation helps keep insights.codes running and ad-free.
      </p>
      <a href="/" className="text-accent hover:underline text-sm font-mono">
        &larr; back to posts
      </a>
    </div>
  );
}
```

#### Donation UI on /subscribe page

- [x] Add a "Support the blog" section below the subscribe form
- [x] Preset amount buttons: $5, $10, $25
- [x] Custom amount input field
- [x] "Donate" button that POSTs to `/api/checkout` and redirects to `session.url`
- [x] Disable button after click to prevent double-submit

#### Environment variables needed

| Variable | Where | Purpose |
|----------|-------|---------|
| `STRIPE_SECRET_KEY` | Vercel + .env.local | Server-side Stripe SDK |
| `STRIPE_WEBHOOK_SECRET` | Vercel + .env.local | Webhook signature verification |
| `NEXT_PUBLIC_SITE_URL` | Vercel | Checkout success/cancel URLs |

#### Stripe Dashboard setup

- [x] Create a webhook endpoint pointing to `https://insights.codes/api/webhooks/stripe`
- [ ] Subscribe to `checkout.session.completed` event only (Stripe Dashboard)
- [ ] Copy the webhook signing secret to env vars (Stripe Dashboard)

### Phase 3: Personal Essay Blog Post

Hand-authored content — write after the features are built so the post can reference them.

**New files:**
- `src/data/personal-posts/why-we-rolled-our-own.json` — The blog post content

#### Post structure

```json
{
  "slug": "why-we-rolled-our-own",
  "title": "Why We Rolled Our Own",
  "subtitle": "On evaluating SaaS options, building with Supabase + Stripe + Resend, and the 4-hour experiment that changed everything",
  "date": "2026-02-27",
  "category": "Essay",
  "categoryColor": "red",
  "icon": "essay",
  "readingTime": "8 min read",
  "content": "...",
  "highlights": ["SaaS vs DIY", "Supabase", "Stripe", "Resend", "Indie Hacking"],
  "keyTakeaway": "Owning your subscriber list is worth the engineering investment. The tools exist to build it yourself in a day.",
  "stats": [
    { "label": "SaaS options evaluated", "value": "4", "color": "blue" },
    { "label": "time to build", "value": "1 day", "color": "green" },
    { "label": "monthly cost", "value": "$0", "color": "accent" },
    { "label": "Stripe experiment", "value": "4 hours", "color": "red" }
  ]
}
```

#### Essay content outline

The essay tells the story of:
1. Evaluating Buttondown, Ghost, Substack, ConvertKit
2. Deciding to build with Supabase (free tier) + Resend (free tier) + Stripe (2.9% + 30c)
3. The same-day Stripe experiment — added 8:46am, removed 12:43pm (from real git history)
4. What we learned and why we brought Stripe back (donations, not subscriptions)
5. The actual cost comparison
6. Why owning your subscriber list matters

- [x] Write full essay content in markdown within the JSON `content` field
- [x] Reference real git history timestamps for authenticity
- [x] Include a "Support this blog" CTA at the end linking to `/subscribe`

## Technical Considerations

### Security

- **Stripe webhook signature verification** using raw body (`req.text()`) — never parse JSON before verification
- **Server-side amount validation** — min $1, max $500, integer cents only
- **No PII in analytics events** — only track page paths and slugs, never emails
- **localStorage is not a security boundary** — the meter is a nudge, not DRM

### Performance

- **MeterGate is client-only** — no impact on server render or SEO
- **Stripe SDK lazy-loaded** — only initialized when `/api/checkout` or `/api/webhooks/stripe` is hit
- **No additional client-side JS bundles** — `stripe` package is server-only; no `@stripe/stripe-js` needed (simple `window.location.href` redirect)

### SEO

- Full article HTML remains in the DOM (good for crawlers)
- CSS blur is client-side only — search engines see full content
- Google's paywalled content guidelines allow this pattern (NYT, Medium use it)

### Accessibility

- Overlay has `role="dialog"` and `aria-label`
- Keyboard focus management on overlay appearance
- Screen readers bypass blur (acceptable — meter is a conversion tool, not a hard wall)

## Acceptance Criteria

### Metered Reading
- [x] First 5 unique articles render normally with no overlay
- [x] 6th unique article shows blur + subscribe overlay
- [x] Article title, subtitle, and first paragraph remain visible
- [x] Email submission in overlay resets counter and removes blur immediately
- [x] Confirmed subscribers (localStorage flag) never see the gate
- [x] `SubscribeStatus` sets localStorage flag on `?confirmed=true`
- [x] Cross-tab `storage` event listener removes gate when subscriber confirms in another tab
- [x] Vercel Analytics tracks `Meter Gate Shown` and `Meter Gate Unlocked` events

### Stripe Donations
- [x] "Support the blog" section appears on `/subscribe` page
- [x] Preset amounts ($5, $10, $25) and custom amount input work
- [x] Server validates amount ($1-$500, integer cents)
- [x] Stripe Checkout opens with `submit_type: "donate"` and "Support insights.codes" product name
- [x] Webhook records `support_amount_cents` and `stripe_customer_id` in subscribers table
- [x] `/thanks` page renders a clean thank-you message
- [x] Button disables after click to prevent double-submit

### Blog Post
- [x] Personal post JSON file matches `BlogPost` interface
- [x] Post renders at `/posts/why-we-rolled-our-own`
- [x] Post appears in "Featured Essays" section on homepage
- [x] Post is included in RSS feed and sitemap
- [x] Essay references real git history and links to `/subscribe`

### General
- [x] `npm run build` succeeds with no type errors
- [x] No sensitive data (API keys, emails) in client bundles
- [x] All new routes return 200

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| Stripe SDK not in package.json | `npm install stripe` — well-tested, minimal dependency |
| Webhook endpoint needs Stripe Dashboard config | Document setup steps; use Stripe CLI for local testing |
| Flash-of-unblurred-content on gated articles | Accept it — gate is soft, content is free, and full HTML is needed for SEO |
| localStorage trivially bypassable | By design — this is a nudge, not a paywall |

## References

- Brainstorm: `docs/brainstorms/2026-02-27-subscription-story-stripe-metered-reads-brainstorm.md`
- Existing subscribe flow: `src/app/api/subscribe/route.ts`
- Lazy-init pattern: `src/lib/supabase.ts`, `src/lib/resend.ts`
- Old Stripe code (git history): commit `f681c0e~1`
- Stripe Checkout docs: https://docs.stripe.com/payments/checkout
- Stripe Webhook docs: https://docs.stripe.com/webhooks
