import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You - insights.codes",
  description: "Thanks for supporting insights.codes",
};

export default function ThanksPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Breadcrumb */}
      <div className="text-sm text-text-muted">
        <Link href="/" className="hover:text-foreground transition-colors">
          posts
        </Link>
        <span className="mx-2 text-border-light">/</span>
        <span className="text-foreground">thanks</span>
      </div>

      <div className="space-y-6 text-center py-12">
        <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Thank you for your support
        </h1>
        <p className="text-text-muted text-base leading-relaxed max-w-md mx-auto">
          Your contribution helps keep insights.codes going. All content stays
          free, always — your support makes that possible.
        </p>
        <p className="text-text-muted text-sm">
          You can manage your subscription anytime from the{" "}
          <Link href="/subscribe" className="text-accent hover:underline">
            subscribe page
          </Link>.
        </p>
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
