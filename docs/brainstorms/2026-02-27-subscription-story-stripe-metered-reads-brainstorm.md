---
topic: Subscription Story + Stripe Donations + Metered Reading
date: 2026-02-27
status: complete
decisions:
  - Personal essay about building own subscription system vs SaaS
  - One-time Stripe donations (no recurring)
  - localStorage-based 5-article reading limit
  - Blur + subscribe overlay at limit
  - Email submission resets counter (no confirmation required)
---

# Subscription Story + Stripe Donations + Metered Reading

## What We're Building

Three interconnected features for insights.codes:

### 1. Featured Blog Post: "Why We Rolled Our Own"

A hand-authored personal essay (in `src/data/personal-posts/`) telling the story of:
- Evaluating SaaS options (Buttondown, Ghost, Substack, ConvertKit)
- Deciding to build our own with Supabase + Stripe + Resend
- The same-day Stripe experiment (added 8:46am, removed 12:43pm) and what we learned
- Why owning your subscriber list matters
- The actual cost comparison (Supabase free tier, Resend free tier, Stripe 2.9% + 30c)

This doubles as content marketing -- it's the kind of post that resonates with indie hackers and gets shared on HN/X.

### 2. Stripe Donations (One-Time Only)

Bring back voluntary financial support, simplified from the previous monthly subscription tiers:
- **One-time payments only** via Stripe Checkout (pay-what-you-want)
- No recurring billing = no webhooks, no subscription lifecycle, no portal management
- No `stripe` npm package needed -- use Stripe Checkout redirect (client-side only) or minimal server-side session creation
- DB columns already exist: `stripe_customer_id`, `support_amount_cents` in subscribers table
- Security: no webhook endpoint to protect, no subscription state to manage

### 3. Metered Reading (5 Free Articles)

Soft paywall to drive free email subscriptions:
- **localStorage counter** tracks unique article slugs read
- After 5 unique articles, show **blur + subscribe overlay** on the 6th
- Article title, subtitle, and first paragraph remain visible (for SEO and hook)
- Subscribe form embedded in the overlay (uses existing `SubscribeForm` component)
- **Email submission immediately resets the counter** (no confirmation wait)
- Subscribers (localStorage flag) see all content permanently
- Easy to bypass (clear storage, incognito) -- this is a nudge, not a hard wall

## Why This Approach

**Personal essay over auto-generated:** The story of building vs. buying is inherently narrative. The git history (Stripe added and removed in 4 hours) is a genuine story worth telling authentically.

**One-time over recurring:** The original Stripe implementation had monthly tiers but was removed within hours. Recurring billing adds webhooks, portal management, cancellation flows, and failed payment handling. One-time donations have nearly zero operational overhead and still let readers support the blog.

**localStorage over server-side tracking:** No backend changes needed for read counting. The metered wall is a conversion optimization tool, not a security boundary. If someone clears localStorage to read more, they're engaged enough that we want them reading anyway. Medium used this exact model for years.

**Trust email submission over confirmation:** Requiring email confirmation before unlocking creates friction at the worst moment (user wants to keep reading). Since subscription is free, the risk of fake emails is low and the cost is zero.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Blog post format | Personal essay in personal-posts/ | Authentic narrative, shareable content |
| Stripe model | One-time donations only | Minimal security surface, no webhooks |
| Read tracking | localStorage | No backend changes, soft nudge not hard wall |
| Gate UX | Blur + subscribe overlay | Shows enough to hook, clear path to unlock |
| Unlock trigger | Email submission (pre-confirmation) | Minimizes friction at conversion moment |

## Resolved Questions

**Q: How do we track reads?**
A: localStorage array of visited slugs. Increment on each unique slug visit.

**Q: What if someone clears localStorage?**
A: They get 5 more reads. This is intentional -- it's a nudge, not DRM.

**Q: Do we need Stripe webhooks?**
A: No. One-time Checkout sessions don't require webhook processing. We can optionally store the payment in Supabase via a thank-you page redirect with session_id, but it's not required.

**Q: How does the blur overlay work with SSR/static generation?**
A: The blur is client-side only. The full article HTML is in the page (good for SEO crawlers). A client component wraps the content and applies blur + overlay based on localStorage state. Search engines see full content, users see the gate.

**Q: What about the existing Stripe DB columns?**
A: Keep them. They're ready for use: `stripe_customer_id`, `stripe_subscription_id` (unused for one-time), `support_amount_cents`.
