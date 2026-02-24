import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fork Your Own - /insights",
  description:
    "Generate your own dev blog from your Claude Code usage data",
};

export default function SetupPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="text-sm text-text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            posts
          </Link>
          <span className="mx-2 text-border-light">/</span>
          <span className="text-foreground">setup</span>
        </div>
        <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Fork Your Own Dev Log
        </h1>
        <p className="text-text-muted text-sm">
          Generate a dev blog from your Claude Code usage in under 5 minutes.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="card">
          <div className="p-6">
            <div className="font-mono text-xs text-text-muted mb-4 uppercase tracking-wider">
              Step 1 — Prerequisites
            </div>
            <h2 className="text-foreground font-semibold mb-3">
              You need Claude Code
            </h2>
            <p className="text-text-muted text-sm mb-4">
              This project requires{" "}
              <a
                href="https://github.com/anthropics/claude-code"
                className="text-secondary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Claude Code
              </a>{" "}
              installed and at least a few sessions of usage. The more
              sessions you have, the richer your dev log will be.
            </p>
            <pre className="bg-surface border border-border rounded-lg p-4 text-sm overflow-x-auto font-mono">
              <code>
                <span className="text-text-muted">
                  # Install Claude Code if you haven&apos;t already
                </span>
                {"\n"}
                <span className="text-amber">$</span> npm install -g
                @anthropic-ai/claude-code
              </code>
            </pre>
          </div>
        </div>

        {/* Step 2 */}
        <div className="card">
          <div className="p-6">
            <div className="font-mono text-xs text-text-muted mb-4 uppercase tracking-wider">
              Step 2 — Generate Insights
            </div>
            <h2 className="text-foreground font-semibold mb-3">
              Run /insights in Claude Code
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Open Claude Code and run the{" "}
              <code className="text-accent font-mono text-xs">/insights</code> command.
              This analyzes your session data and generates a report.
            </p>
            <pre className="bg-surface border border-border rounded-lg p-4 text-sm overflow-x-auto font-mono">
              <code>
                <span className="text-text-muted">
                  # In any Claude Code session, type:
                </span>
                {"\n"}
                <span className="text-amber">claude&gt;</span>{" "}
                /insights
                {"\n\n"}
                <span className="text-text-muted">
                  # This generates a report at:
                </span>
                {"\n"}
                <span className="text-text-muted">
                  # ~/.claude/usage-data/report.html
                </span>
              </code>
            </pre>
          </div>
        </div>

        {/* Step 3 */}
        <div className="card">
          <div className="p-6">
            <div className="font-mono text-xs text-text-muted mb-4 uppercase tracking-wider">
              Step 3 — Fork & Configure
            </div>
            <h2 className="text-foreground font-semibold mb-3">
              Fork this repo and add your data
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Clone the repo, paste your insights JSON into{" "}
              <code className="text-accent font-mono text-xs">src/data/insights.json</code>,
              and run the generator.
            </p>
            <pre className="bg-surface border border-border rounded-lg p-4 text-sm overflow-x-auto font-mono">
              <code>
                <span className="text-text-muted"># Clone</span>
                {"\n"}
                <span className="text-amber">$</span> git clone
                https://github.com/YOUR_USER/claude-log
                {"\n"}
                <span className="text-amber">$</span> cd claude-log
                {"\n"}
                <span className="text-amber">$</span> npm install
                {"\n\n"}
                <span className="text-text-muted">
                  # Paste your insights JSON into:
                </span>
                {"\n"}
                <span className="text-text-muted">
                  # src/data/insights.json
                </span>
                {"\n\n"}
                <span className="text-text-muted">
                  # Generate posts
                </span>
                {"\n"}
                <span className="text-amber">$</span> npm run generate
                {"\n\n"}
                <span className="text-text-muted">
                  # Preview locally
                </span>
                {"\n"}
                <span className="text-amber">$</span> npm run build
                {"\n"}
                <span className="text-amber">$</span> npx serve out
              </code>
            </pre>
          </div>
        </div>

        {/* Step 4 */}
        <div className="card">
          <div className="p-6">
            <div className="font-mono text-xs text-text-muted mb-4 uppercase tracking-wider">
              Step 4 — Deploy
            </div>
            <h2 className="text-foreground font-semibold mb-3">
              Deploy to Vercel
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Push to GitHub and import into Vercel. The static export
              deploys instantly with zero configuration.
            </p>
            <pre className="bg-surface border border-border rounded-lg p-4 text-sm overflow-x-auto font-mono">
              <code>
                <span className="text-amber">$</span> git add -A
                {"\n"}
                <span className="text-amber">$</span> git commit -m
                &quot;feat: my dev log&quot;
                {"\n"}
                <span className="text-amber">$</span> git push origin
                main
                {"\n\n"}
                <span className="text-text-muted">
                  # Then import on vercel.com/new
                </span>
                {"\n"}
                <span className="text-text-muted">
                  # Framework: Next.js (auto-detected)
                </span>
                {"\n"}
                <span className="text-text-muted">
                  # Output: Static export (auto-configured)
                </span>
              </code>
            </pre>
          </div>
        </div>

        {/* Step 5 */}
        <div className="card">
          <div className="p-6">
            <div className="font-mono text-xs text-text-muted mb-4 uppercase tracking-wider">
              Step 5 — Update
            </div>
            <h2 className="text-foreground font-semibold mb-3">
              Update whenever you want
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Run <code className="text-accent font-mono text-xs">/insights</code> again
              after more sessions, replace the JSON, regenerate, and push.
              Your dev log grows with you.
            </p>
            <div className="callout callout-insight">
              <div className="text-sm">
                <strong className="text-secondary">Tip:</strong> The
                more sessions you have across different projects, the richer
                and more interesting your dev log becomes. Each{" "}
                <code className="text-accent font-mono text-xs">/insights</code> run
                captures your evolving workflow.
              </div>
            </div>
          </div>
        </div>
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
