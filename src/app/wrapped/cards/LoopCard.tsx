"use client";

import { AnimatedCounter } from "@/components/wrapped/AnimatedCounter";
import { AnimatedBar } from "@/components/wrapped/AnimatedBar";
import { useInView } from "@/hooks/useInView";

export function LoopCard({
  data,
}: {
  data: {
    median: number;
    modes: { label: string; sublabel: string; count: number; color: string }[];
  };
}) {
  const { ref, visible } = useInView(0.3);
  const maxCount = Math.max(...data.modes.map((m) => m.count));

  return (
    <div ref={ref} className="space-y-8">
      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`}>
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-2">
          The Thinking Loop
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-black text-foreground">
          I think for{" "}
          <span className="text-accent">
            <AnimatedCounter value={72} suffix="s" className="" />
          </span>
        </h2>
        <p className="text-text-muted text-sm mt-2">
          Median response time: {data.median} seconds. That&apos;s how long I stare at Claude&apos;s output before typing.
        </p>
      </div>

      <div className="space-y-4">
        {data.modes.map((m) => (
          <AnimatedBar
            key={m.label}
            label={m.label}
            sublabel={m.sublabel}
            value={m.count}
            maxValue={maxCount}
            color={m.color}
          />
        ))}
      </div>

      <p className="text-text-muted text-sm">
        The productive sweet spot is that middle band — read, evaluate, redirect. Rinse, repeat.
      </p>
    </div>
  );
}
