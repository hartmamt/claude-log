import Link from "next/link";
import { getTimeline, getSiteStats } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Journey - claude_log",
  description: "A chronological timeline of building with Claude Code",
};

const typeStyles: Record<
  string,
  { color: string; textColor: string; bg: string; label: string }
> = {
  milestone: {
    color: "border-secondary",
    textColor: "text-secondary",
    bg: "bg-secondary/5",
    label: "MILESTONE",
  },
  win: {
    color: "border-accent",
    textColor: "text-accent",
    bg: "bg-accent/5",
    label: "WIN",
  },
  friction: {
    color: "border-amber",
    textColor: "text-amber",
    bg: "bg-amber/5",
    label: "FRICTION",
  },
  insight: {
    color: "border-[#a855f7]",
    textColor: "text-[#a855f7]",
    bg: "bg-[#a855f7]/5",
    label: "INSIGHT",
  },
};

export default function JourneyPage() {
  const timeline = getTimeline();
  const stats = getSiteStats();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="text-sm text-text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            posts
          </Link>
          <span className="mx-2 text-border-light">/</span>
          <span className="text-foreground">journey</span>
        </div>
        <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          The Journey
        </h1>
        <p className="text-text-muted text-sm">
          {stats.totalSessions} sessions, {stats.totalCommits} commits,{" "}
          {stats.totalHours} hours — a chronological view of building with
          Claude Code.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 text-xs">
        {Object.entries(typeStyles).map(([type, style]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 ${style.color}`}
            />
            <span className="text-text-muted font-mono">{style.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-14">
        {timeline.map((day) => (
          <div key={day.day}>
            {/* Day header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="font-mono text-accent font-bold text-base">
                {day.day}
              </div>
              <div className="text-text-muted text-sm">
                {day.label}
              </div>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Events */}
            <div className="relative pl-10 space-y-4">
              {/* Vertical line */}
              <div className="timeline-line" />

              {day.events.map((event, i) => {
                const style = typeStyles[event.type] || typeStyles.milestone;
                return (
                  <div key={i} className="relative flex gap-4">
                    {/* Dot */}
                    <div
                      className={`timeline-dot ${style.color} absolute -left-10 top-1`}
                    />

                    {/* Content */}
                    <div
                      className={`flex-1 ${style.bg} border border-border rounded-lg p-4`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${style.textColor}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <div className="text-foreground font-semibold text-sm mb-1">
                        {event.title}
                      </div>
                      <div className="text-text-muted text-xs">
                        {event.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
