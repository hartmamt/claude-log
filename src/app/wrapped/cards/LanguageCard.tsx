"use client";

import { AnimatedCounter } from "@/components/wrapped/AnimatedCounter";
import { useInView } from "@/hooks/useInView";

export function LanguageCard({
  data,
}: {
  data: { typescript: number; javascript: number; ratio: string; markdown: number };
}) {
  const { ref, visible } = useInView(0.3);

  return (
    <div ref={ref} className="space-y-8">
      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`}>
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-2">
          The Language
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-black text-foreground">
          TypeScript{" "}
          <span className="text-secondary">{data.ratio}</span>
        </h2>
      </div>

      <div className="flex gap-2 items-end h-48">
        <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "200ms" }}>
          <div className="flex flex-col items-center gap-2">
            <AnimatedCounter
              value={data.typescript}
              className="font-mono text-sm font-bold text-secondary"
            />
            <div
              className="w-24 md:w-32 bg-secondary rounded-t-lg wrapped-bar-vertical"
              style={{
                height: visible ? "160px" : "0px",
                transition: "height 1s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: "400ms",
              }}
            />
            <span className="font-mono text-xs text-text-muted">TS</span>
          </div>
        </div>

        <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "600ms" }}>
          <div className="flex flex-col items-center gap-2">
            <AnimatedCounter
              value={data.javascript}
              className="font-mono text-sm font-bold text-amber"
            />
            <div
              className="w-24 md:w-32 bg-amber rounded-t-lg"
              style={{
                height: visible ? "4px" : "0px",
                transition: "height 1s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: "800ms",
              }}
            />
            <span className="font-mono text-xs text-text-muted">JS</span>
          </div>
        </div>

        <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "800ms" }}>
          <div className="flex flex-col items-center gap-2">
            <AnimatedCounter
              value={data.markdown}
              className="font-mono text-sm font-bold text-accent"
            />
            <div
              className="w-24 md:w-32 bg-accent rounded-t-lg"
              style={{
                height: visible ? "58px" : "0px",
                transition: "height 1s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: "1000ms",
              }}
            />
            <span className="font-mono text-xs text-text-muted">MD</span>
          </div>
        </div>
      </div>

      <p className="text-text-muted text-sm">
        The JS touches are probably config files. The Markdown is an entire Obsidian vault — built with a coding tool.
      </p>
    </div>
  );
}
