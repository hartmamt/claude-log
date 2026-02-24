import Link from "next/link";
import { getChangelog } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog - /insights",
  description: "What changed each time the site updates",
};

export default function ChangelogPage() {
  const changelog = getChangelog();
  const reversed = [...changelog].reverse();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="text-sm text-text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            posts
          </Link>
          <span className="mx-2 text-border-light">/</span>
          <span className="text-foreground">changelog</span>
        </div>
        <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Changelog
        </h1>
        <p className="text-text-muted text-sm">
          Auto-generated from insights archive diffs. Each entry shows what
          changed when the site was last updated.
        </p>
      </div>

      {/* Entries */}
      <div className="space-y-8">
        {reversed.map((entry) => (
          <div key={entry.date} className="space-y-3">
            {/* Date + label */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-accent font-bold text-sm">
                {entry.date}
              </span>
              <span className="text-text-muted text-sm">{entry.label}</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Stat deltas */}
            {entry.stats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.stats.map((stat) => (
                  <span
                    key={stat.label}
                    className="inline-flex items-center gap-1.5 bg-surface-light border border-border rounded px-2.5 py-1 text-xs font-mono"
                  >
                    <span className="text-text-muted">{stat.label}:</span>
                    <span className="text-text-muted">{stat.before}</span>
                    <span className="text-border-light">&rarr;</span>
                    <span className="text-foreground">{stat.after}</span>
                  </span>
                ))}
              </div>
            )}

            {/* New content items */}
            {entry.newContent.length > 0 && (
              <ul className="space-y-1 text-sm text-text-muted">
                {entry.newContent.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
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
