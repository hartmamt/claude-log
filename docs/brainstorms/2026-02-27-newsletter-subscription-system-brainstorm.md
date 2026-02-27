# Newsletter & Subscription System

**Date:** 2026-02-27
**Status:** Brainstorm

## What We're Building

A self-hosted newsletter/subscription system for insights.codes that lets readers subscribe via email, get notified of new posts, and eventually pay for premium content. No third-party newsletter platform — we own the stack.

## Why This Approach (Build vs Buy)

- **Full control** — no platform lock-in, no branding, no revenue share
- **insights.codes stays the canonical home** — not Substack or Buttondown
- **Supabase + Resend + Stripe** are all tools we already use/have accounts for
- **Paid tier is a natural extension** — Stripe integration is straightforward when ready
- **Cost**: Supabase free tier (50k rows), Resend marketing plan (already have it), Stripe 2.9% when payments start

## Tech Stack

| Component | Service | Role |
|-----------|---------|------|
| Subscriber storage | Supabase (Postgres) | emails, status, preferences, timestamps |
| Email sending | Resend (marketing plan) | confirmation, welcome, post notifications |
| API endpoints | Vercel serverless functions | `/api/subscribe`, `/api/confirm`, `/api/send` |
| Payments (later) | Stripe | paid subscriptions, customer portal |
| Frontend | Static Next.js (unchanged) | signup forms, subscribe page |

## Key Decisions

### 1. Vercel serverless functions outside Next.js
The site uses `output: "export"` (static). API routes go in a top-level `/api` directory as standalone Vercel serverless functions, completely separate from the Next.js build. No architecture changes needed.

### 2. Double opt-in flow
- User submits email → stored as `pending` → confirmation email sent via Resend
- User clicks confirmation link → status flipped to `confirmed` → welcome email sent
- Only `confirmed` subscribers receive post notifications

### 3. Subscribe form placement
- Homepage hero section (prominent CTA)
- End of every article (catch engaged readers)
- Footer of every page (persistent, unobtrusive)
- Dedicated `/subscribe` page (linked from nav)

### 4. New post notification flow
- Build pipeline detects new posts (compare slugs before/after)
- Drafts notification email with post title, excerpt, link
- Author previews and approves before sending (CLI command or simple web UI)
- Resend sends to all confirmed subscribers via batch API

### 5. Supabase schema (minimal)
```sql
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null default 'pending', -- pending, confirmed, unsubscribed
  token uuid default gen_random_uuid(),   -- for confirmation/unsubscribe links
  tier text not null default 'free',      -- free, paid (for later)
  created_at timestamptz default now(),
  confirmed_at timestamptz
);
```

### 6. API endpoints
- `POST /api/subscribe` — accept email, create subscriber, send confirmation
- `GET /api/confirm?token=xxx` — confirm subscription, send welcome email
- `GET /api/unsubscribe?token=xxx` — unsubscribe
- `POST /api/send` — (authenticated) send notification to all confirmed subscribers

### 7. Stripe "pay what you want" support (from day one)
- Not a paywall — all content is free, always
- After subscribing, offer an optional "Support this blog" step
- Pay what you want: suggested amounts ($5/mo, $10/mo, $20/mo) + custom amount
- Stripe Checkout session with `payment_method_types: ['card']` and `mode: 'subscription'`
- Supporters get a small badge/flair (in emails or on the site) — nothing gated
- Dedicated `/subscribe` page shows: free signup at top, optional support tier below
- Stripe Customer Portal link for managing/canceling support

### 8. Stripe schema addition
```sql
alter table subscribers add column stripe_customer_id text;
alter table subscribers add column stripe_subscription_id text;
alter table subscribers add column support_amount_cents integer; -- null = free
```

### 9. Additional API endpoints for Stripe
- `POST /api/checkout` — create Stripe Checkout session for support tier
- `POST /api/webhook` — Stripe webhook for subscription events (created, canceled, updated)
- `GET /api/portal` — generate Stripe Customer Portal link

## What's Deferred (YAGNI)

- Email templates / rich HTML — start with simple, clean text-based emails
- Subscriber admin dashboard — use Supabase dashboard directly for now
- Audience segmentation — everyone gets everything for now
- Analytics (open rates, click rates) — Resend provides this out of the box

## Open Questions

None — all key decisions resolved through brainstorming.
