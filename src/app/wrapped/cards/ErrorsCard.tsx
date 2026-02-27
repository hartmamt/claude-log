"use client";

import { AnimatedCounter } from "@/components/wrapped/AnimatedCounter";
import { useInView } from "@/hooks/useInView";

export function ErrorsCard({
  data,
}: {
  data: { failures: number; sessions: number; rejectionsOnly: number };
}) {
  const { ref, visible } = useInView(0.3);

  return (
    <div ref={ref} className="space-y-8">
      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`}>
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-2">
          The Errors
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-black text-foreground">
          <AnimatedCounter
            value={data.failures}
            className="text-red"
          /> failures across{" "}
          <AnimatedCounter
            value={data.sessions}
            className="text-foreground"
          /> sessions.
        </h2>
      </div>

      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "400ms" }}>
        <p className="text-2xl md:text-3xl text-text-muted font-mono">
          That&apos;s a <span className="text-accent font-bold">feature.</span>
        </p>
        <p className="text-text-muted text-sm mt-4 leading-relaxed">
          Nearly one failure per session. Sounds terrible. It&apos;s actually the build-test-fix loop working correctly —
          Claude writes code, runs the build, it fails, Claude reads the error, fixes it.
        </p>
      </div>

      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "600ms" }}>
        <div className="flex items-baseline gap-3 border-t border-border pt-4">
          <span className="font-mono text-4xl font-black text-accent">{data.rejectionsOnly}</span>
          <span className="text-text-muted text-sm">
            times I rejected a destructive action out of hundreds of sessions.
          </span>
        </div>
      </div>
    </div>
  );
}
