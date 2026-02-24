"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export function WrappedLanding({
  onFile,
  onDemo,
}: {
  onFile: (file: File) => Promise<string | null>;
  onDemo: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const err = await onFile(file);
      if (err) setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center max-w-xl space-y-8 animate-[fadeUp_0.6s_ease-out_both]">
        {/* Pre-heading */}
        <p className="font-mono text-xs text-text-muted tracking-[0.3em] uppercase">
          Claude Code // {new Date().getFullYear()} Recap
        </p>

        {/* Headline */}
        <h1 className="font-mono text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
          Your Year{" "}
          <span className="text-accent">in Code</span>
        </h1>

        {/* Subtitle */}
        <p className="text-text-muted text-lg max-w-md mx-auto">
          Upload your Claude Code <code className="font-mono text-accent text-sm">/insights</code> data and see your AI coding story, wrapped.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="border border-accent text-accent font-mono text-sm px-8 py-3 rounded-full hover:bg-accent hover:text-background transition-all duration-300 disabled:opacity-50"
          >
            <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full mr-2 animate-pulse" />
            {loading ? "Parsing..." : "Upload your data"}
          </button>
          <button
            onClick={onDemo}
            className="text-text-muted font-mono text-sm px-8 py-3 hover:text-foreground transition-colors"
          >
            Try demo
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Error */}
        {error && (
          <div className="text-red font-mono text-xs text-left bg-red/5 border border-red/20 rounded-lg p-4 max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Help text */}
        <p className="text-text-muted text-xs font-mono">
          Find your data at{" "}
          <code className="text-accent">~/.claude/usage-data/facets/insights_data.json</code>
        </p>

        {/* Back link */}
        <div className="pt-4">
          <Link href="/" className="text-secondary text-sm hover:underline">
            &larr; back to /insights
          </Link>
        </div>
      </div>
    </div>
  );
}
