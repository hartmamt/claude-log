---
title: "feat: Newsletter subscription system with pay-what-you-want support"
type: feat
status: completed
date: 2026-02-27
---

# Newsletter Subscription System

## Overview

Add a self-hosted newsletter subscription system to insights.codes with double opt-in email signup, new post notifications, and optional "pay what you want" support via Stripe. The static Next.js export stays unchanged — all backend logic lives in standalone Vercel serverless functions.

## Problem Statement

Readers have no way to subscribe or get notified of new posts. There's no way for supporters to contribute financially. The site is fully static with zero backend, forms, or interactivity beyond clipboard/scroll.

## Proposed Solution

| Layer | Service | Role |
|-------|---------|------|
| Subscriber DB | Supabase (Postgres) | Store emails, status, Stripe IDs |
| Email | Resend (marketing plan) | Confirmation, welcome, broadcasts |
| Payments | Stripe Checkout | Pay-what-you-want recurring subscriptions |
| API | Vercel serverless functions | `/api/*` endpoints (standalone, not Next.js) |
| Frontend | Static Next.js (unchanged) | Signup forms, subscribe page |

## Implementation Phases

### Phase 1: Infrastructure & Subscribe Flow

**Goal:** Email signup form that stores subscribers in Supabase with double opt-in via Resend.

#### 1.1 Install dependencies

```bash
npm install @supabase/supabase-js resend stripe
```

#### 1.2 Create Supabase table

Run in Supabase SQL Editor:

```sql
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed')),
  token uuid default gen_random_uuid(),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  support_amount_cents integer,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

create index idx_subscribers_email on subscribers (email);
create index idx_subscribers_token on subscribers (token);
create index idx_subscribers_stripe on subscribers (stripe_customer_id)
  where stripe_customer_id is not null;

alter table subscribers enable row level security;
-- No policies = no access via anon key (we use service role only)
```

#### 1.3 Create Resend Audience

In Resend dashboard, create an audience called "insights.codes subscribers". Note the audience ID.

#### 1.4 Environment variables

Set in Vercel Dashboard (Settings > Environment Variables):

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=aud_...
SITE_URL=https://insights.codes
```

#### 1.5 Create shared serverless helpers

```
api/
  _supabase.ts    — Supabase client (service role, no auth persistence)
  _resend.ts      — Resend client
```

**`api/_supabase.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);
```

**`api/_resend.ts`:**

```typescript
import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY!);
```

#### 1.6 API endpoints — subscribe flow

**`api/subscribe.ts`** — `POST /api/subscribe`

1. Validate email
2. Upsert subscriber in Supabase (`status: 'pending'`)
3. Add contact to Resend Audience
4. Send confirmation email via Resend with `token` link
5. Return success

**`api/confirm.ts`** — `GET /api/confirm?token=xxx`

1. Look up subscriber by token
2. Update `status: 'confirmed'`, set `confirmed_at`
3. Send welcome email via Resend
4. Redirect to `/subscribe?confirmed=true`

**`api/unsubscribe.ts`** — `GET /api/unsubscribe?token=xxx`

1. Look up subscriber by token
2. Update `status: 'unsubscribed'`, set `unsubscribed_at`
3. Update Resend contact (`unsubscribed: true`)
4. Redirect to `/subscribe?unsubscribed=true`

#### 1.7 Create `vercel.json`

```json
{
  "functions": {
    "api/*.ts": {
      "maxDuration": 10
    }
  }
}
```

#### 1.8 Subscribe form component

**`src/components/blog/SubscribeForm.tsx`** — `"use client"`

- Email input + submit button
- `fetch('/api/subscribe', { method: 'POST', body })` on submit
- States: idle, loading, success, error
- Matches existing design tokens (`bg-surface-light`, `border-border`, `text-accent`, etc.)
- Follows existing client component patterns (small, focused, useState only)

#### 1.9 Place subscribe forms

- **Homepage hero** (`src/app/page.tsx`): Add `<SubscribeForm />` below the tagline
- **End of articles** (`src/app/posts/[slug]/page.tsx`): Add after post content, before navigation
- **Footer** (`src/components/layout/Footer.tsx`): Compact inline form
- **`/subscribe` page** (`src/app/subscribe/page.tsx`): Dedicated page with full messaging

#### 1.10 Add "subscribe" link to header nav

Update `src/components/layout/Header.tsx` to add `/subscribe` to the nav.

### Phase 2: Stripe "Pay What You Want"

**Goal:** After subscribing, users can optionally support the blog with a recurring contribution.

#### 2.1 Stripe setup

- Create a Stripe account (or use existing)
- Get API keys, set in Vercel env vars:
  ```
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- Configure webhook endpoint in Stripe Dashboard: `https://insights.codes/api/webhook`
- Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

#### 2.2 API endpoints — Stripe

**`api/checkout.ts`** — `POST /api/checkout`

1. Accept `{ email, amount }` (amount in dollars)
2. Validate amount server-side ($1–$1000)
3. Create Stripe Checkout Session with:
   - `mode: 'subscription'`
   - `price_data` with dynamic `unit_amount` (cents)
   - `customer_email` pre-filled
   - `metadata` with subscriber email
   - `success_url: /thanks?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url: /subscribe`
4. Return `{ url }` for client redirect

**`api/webhook.ts`** — `POST /api/webhook`

1. Read raw body with `request.text()` (required for signature verification)
2. Verify signature with `stripe.webhooks.constructEvent()`
3. Handle events:
   - `checkout.session.completed` → update subscriber with `stripe_customer_id`, `stripe_subscription_id`, `support_amount_cents`
   - `customer.subscription.deleted` → clear Stripe fields, optionally update status
   - `invoice.payment_failed` → send notification email

**`api/portal.ts`** — `POST /api/portal`

1. Accept `{ email }`
2. Look up `stripe_customer_id` in Supabase
3. Create Stripe Customer Portal session
4. Return `{ url }`

#### 2.3 Support tier UI on `/subscribe` page

**`src/app/subscribe/page.tsx`:**

```
┌─────────────────────────────────────┐
│  Subscribe to insights.codes        │
│                                     │
│  [email input] [Subscribe — free]   │
│                                     │
│  ─────── or support the blog ────── │
│                                     │
│  [$5/mo]  [$10/mo]  [$20/mo]        │
│  [Custom: $___/mo]                  │
│                                     │
│  All content is always free.        │
│  Supporting helps keep it going.    │
└─────────────────────────────────────┘
```

- Amount buttons + custom input
- Clicking an amount → `fetch('/api/checkout')` → redirect to Stripe Checkout
- After successful payment, redirect to `/thanks`

#### 2.4 Thanks page

**`src/app/thanks/page.tsx`:** Simple confirmation page after successful payment.

### Phase 3: New Post Notifications

**Goal:** When a new post is published, subscribers get an email (with author preview/approval).

#### 3.1 Notification script

**`scripts/notify-subscribers.ts`:**

1. Read current post slugs from `src/data/posts/` + `src/data/personal-posts/`
2. Compare against a stored manifest (`src/data/notified-slugs.json`)
3. For each new slug:
   - Load the post data (title, subtitle, slug)
   - Draft an email (title, excerpt, link to post)
   - Print preview to stdout
4. If `--send` flag: call Resend Broadcast API to send to audience
5. Update `notified-slugs.json` with sent slugs

**Usage:**
```bash
# Preview what would be sent
npx tsx scripts/notify-subscribers.ts

# Actually send
npx tsx scripts/notify-subscribers.ts --send
```

#### 3.2 Add npm script

```json
"notify": "tsx scripts/notify-subscribers.ts"
```

## Files to Create

| File | Type | Purpose |
|------|------|---------|
| `api/_supabase.ts` | Serverless helper | Supabase client |
| `api/_resend.ts` | Serverless helper | Resend client |
| `api/subscribe.ts` | Serverless function | POST — email signup |
| `api/confirm.ts` | Serverless function | GET — confirm subscription |
| `api/unsubscribe.ts` | Serverless function | GET — unsubscribe |
| `api/checkout.ts` | Serverless function | POST — create Stripe Checkout session |
| `api/webhook.ts` | Serverless function | POST — Stripe webhook handler |
| `api/portal.ts` | Serverless function | POST — Stripe Customer Portal |
| `vercel.json` | Config | Serverless function settings |
| `src/components/blog/SubscribeForm.tsx` | Client component | Email signup form |
| `src/app/subscribe/page.tsx` | Page | Dedicated subscribe + support page |
| `src/app/thanks/page.tsx` | Page | Post-payment confirmation |
| `scripts/notify-subscribers.ts` | Build script | Send new post notifications |
| `src/data/notified-slugs.json` | Data | Track which posts have been notified |

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add dependencies + `notify` script |
| `src/app/page.tsx` | Add SubscribeForm to hero section |
| `src/app/posts/[slug]/page.tsx` | Add SubscribeForm after post content |
| `src/components/layout/Header.tsx` | Add "subscribe" nav link |
| `src/components/layout/Footer.tsx` | Add compact subscribe form |

## Acceptance Criteria

### Functional Requirements

- [x] Email signup form collects email and creates pending subscriber in Supabase
- [x] Confirmation email is sent via Resend with unique token link
- [x] Clicking confirmation link activates subscription and sends welcome email
- [x] Unsubscribe link deactivates subscription in both Supabase and Resend
- [x] Subscribe form appears on homepage, article pages, footer, and /subscribe page
- [x] /subscribe page offers optional pay-what-you-want support tiers
- [x] Stripe Checkout handles recurring subscriptions with dynamic amounts
- [x] Stripe webhooks update subscriber records on payment events
- [x] Notification script detects new posts and sends broadcasts via Resend
- [x] Author can preview notification emails before sending

### Non-Functional Requirements

- [x] Static export (`output: "export"`) remains unchanged
- [x] All API endpoints validate input and handle errors gracefully
- [x] Stripe webhook signatures are verified on every request
- [x] Service role key is never exposed to the client
- [x] Forms match existing dark theme design tokens

## Dependencies & Prerequisites

- Supabase account (free tier) with project created
- Resend account (marketing plan — already have) with verified domain
- Stripe account with API keys
- Vercel environment variables configured

## Risk Analysis

| Risk | Mitigation |
|------|-----------|
| Vercel standalone functions not picking up alongside static export | Test with `vercel dev` locally; verify `vercel.json` config |
| Stripe webhook blocked by Vercel deployment protection | Exclude `/api/webhook` path from deployment protection |
| Resend rate limits on free/marketing plan | Use Broadcast API for bulk sends, transactional for 1:1 |
| Supabase free tier limits (50k rows) | More than enough for initial subscriber base |

## References

- Brainstorm: `docs/brainstorms/2026-02-27-newsletter-subscription-system-brainstorm.md`
- [Vercel Standalone Functions](https://vercel.com/docs/functions)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/start)
- [Resend API](https://resend.com/docs/api-reference/emails/send-email)
- [Resend Broadcasts](https://resend.com/docs/api-reference/broadcasts/create-broadcast)
- [Stripe Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/create)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
