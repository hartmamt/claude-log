import Link from "next/link";
import type { Metadata } from "next";
import { SubscribeForm } from "@/components/blog/SubscribeForm";
import { SupportTiers } from "@/components/blog/SupportTiers";
import { ManageSubscription } from "@/components/blog/ManageSubscription";
import { SubscribeStatus } from "@/components/blog/SubscribeStatus";

export const metadata: Metadata = {
  title: "Subscribe - insights.codes",
  description:
    "Get notified when new posts go live. Free forever, with optional support.",
};

export default function SubscribePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Breadcrumb */}
      <div className="text-sm text-text-muted">
        <Link href="/" className="hover:text-foreground transition-colors">
          posts
        </Link>
        <span className="mx-2 text-border-light">/</span>
        <span className="text-foreground">subscribe</span>
      </div>

      {/* Status messages (confirmed, unsubscribed, error) */}
      <SubscribeStatus />

      {/* Main signup */}
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Subscribe to insights.codes
          </h1>
          <p className="text-text-muted text-sm leading-relaxed">
            Get an email when new posts go live. No spam, no algorithms — just
            notes on building with AI, delivered to your inbox.
          </p>
        </div>

        <SubscribeForm />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-text-muted text-xs font-mono">
          or support the blog
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Support tiers */}
      <SupportTiers />

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-text-muted text-xs font-mono">
          already subscribed?
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Manage subscription */}
      <ManageSubscription />

      {/* Back link */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="text-secondary text-sm hover:underline"
        >
          &larr; back to posts
        </Link>
      </div>
    </div>
  );
}
