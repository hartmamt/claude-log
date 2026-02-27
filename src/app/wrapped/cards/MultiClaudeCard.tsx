"use client";

import { AnimatedCounter } from "@/components/wrapped/AnimatedCounter";
import { useInView } from "@/hooks/useInView";

export function MultiClaudeCard({
  data,
}: {
  data: { overlapEvents: number; sessionsInvolved: number; percentOfMessages: number };
}) {
  const { ref, visible } = useInView(0.3);

  return (
    <div ref={ref} className="space-y-8">
      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`}>
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-2">
          Parallel Sessions
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-black text-foreground">
          I run multiple Claudes<br />
          <span className="text-[#a855f7]">at once.</span>
        </h2>
      </div>

      <div className="flex items-end gap-8">
        <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "200ms" }}>
          <AnimatedCounter
            value={data.overlapEvents}
            className="font-mono text-6xl md:text-7xl font-black text-[#a855f7]"
          />
          <p className="font-mono text-xs text-text-muted mt-1">overlap events</p>
        </div>
        <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "400ms" }}>
          <AnimatedCounter
            value={data.sessionsInvolved}
            className="font-mono text-3xl md:text-4xl font-bold text-foreground"
          />
          <p className="font-mono text-xs text-text-muted mt-1">sessions involved</p>
        </div>
      </div>

      <p className="text-text-muted text-sm leading-relaxed">
        <span className="font-mono text-foreground font-semibold">{data.percentOfMessages}%</span> of
        all messages sent while another session was already running.
        I treat Claude sessions like browser tabs. One isn&apos;t enough.
      </p>
    </div>
  );
}
