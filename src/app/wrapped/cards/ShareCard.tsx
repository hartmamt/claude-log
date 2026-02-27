"use client";

import { useInView } from "@/hooks/useInView";
import Link from "next/link";

export function ShareCard({ dateRange }: { dateRange: string }) {
  const { ref, visible } = useInView(0.3);

  return (
    <div ref={ref} className="space-y-8 text-center">
      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`}>
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-4">
          {dateRange}
        </p>
        <h2 className="font-mono text-3xl md:text-5xl font-black text-foreground">
          That&apos;s a wrap.
        </h2>
      </div>

      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "300ms" }}>
        <p className="text-text-muted text-base leading-relaxed max-w-sm mx-auto">
          338 sessions. 924 hours. One AI coding partner that never sleeps.
        </p>
      </div>

      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "600ms" }}>
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/posts/the-numbers"
            className="inline-flex items-center gap-2 bg-accent text-background font-mono text-sm font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Read the full story
          </Link>
          <Link
            href="/"
            className="text-text-muted text-sm hover:text-foreground transition-colors"
          >
            Back to /insights
          </Link>
        </div>
      </div>

      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "900ms" }}>
        <p className="font-mono text-xs text-border-light">
          Built with Claude Code, of course.
        </p>
      </div>
    </div>
  );
}
