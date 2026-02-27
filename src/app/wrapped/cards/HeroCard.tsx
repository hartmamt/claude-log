"use client";

import { AnimatedCounter } from "@/components/wrapped/AnimatedCounter";
import { useInView } from "@/hooks/useInView";

export function HeroCard({
  data,
}: {
  data: { sessions: number; hours: number; commits: number; messages: number; dateRange: string };
}) {
  const { ref, visible } = useInView(0.3);

  return (
    <div ref={ref} className="text-center space-y-8">
      <p className="font-mono text-xs text-text-muted tracking-widest uppercase">
        {data.dateRange}
      </p>

      <div className="space-y-4">
        <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "0ms" }}>
          <AnimatedCounter
            value={data.sessions}
            className="font-mono text-6xl md:text-8xl font-black text-foreground"
          />
          <p className="font-mono text-sm text-text-muted mt-1">sessions</p>
        </div>

        <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "300ms" }}>
          <AnimatedCounter
            value={data.hours}
            className="font-mono text-5xl md:text-7xl font-black text-accent"
          />
          <p className="font-mono text-sm text-text-muted mt-1">hours</p>
        </div>

        <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "600ms" }}>
          <AnimatedCounter
            value={data.commits}
            className="font-mono text-5xl md:text-7xl font-black text-secondary"
          />
          <p className="font-mono text-sm text-text-muted mt-1">commits</p>
        </div>
      </div>

      <p className="text-text-muted text-sm">
        <span className="font-mono text-foreground font-semibold">{data.messages.toLocaleString()}</span> messages exchanged
      </p>

      <p className="font-mono text-xs text-text-muted animate-pulse">scroll down</p>
    </div>
  );
}
