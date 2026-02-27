import Link from "next/link";
import type { Metadata } from "next";
import { SubscribeForm } from "@/components/blog/SubscribeForm";
import { SubscribeStatus } from "@/components/blog/SubscribeStatus";
import { DonateForm } from "@/components/blog/DonateForm";

export const metadata: Metadata = {
  title: "Subscribe - insights.codes",
  description:
    "Get notified when new posts go live. Free forever.",
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

      {/* Support section */}
      <div className="space-y-6 pt-6 border-t border-border">
        <div className="space-y-3">
          <div className="font-mono text-[10px] text-accent font-semibold uppercase tracking-wider">
            support the blog
          </div>
          <h2 className="font-mono text-xl font-bold text-foreground tracking-tight">
            Buy me a coffee (or three)
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            insights.codes is free and always will be. If you find the posts
            useful, a one-time donation helps cover hosting and tools.
          </p>
        </div>

        <DonateForm />
      </div>

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
