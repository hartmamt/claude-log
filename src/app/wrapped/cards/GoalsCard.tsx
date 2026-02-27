"use client";

import { AnimatedBar } from "@/components/wrapped/AnimatedBar";
import { useInView } from "@/hooks/useInView";

export function GoalsCard({
  data,
}: {
  data: {
    items: { label: string; value: number; color: string }[];
  };
}) {
  const { ref, visible } = useInView(0.3);
  const maxVal = Math.max(...data.items.map((i) => i.value));

  return (
    <div ref={ref} className="space-y-8">
      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`}>
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-2">
          What I Actually Do
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-black text-foreground">
          Bug fix is{" "}
          <span className="text-red">#1.</span>
        </h2>
        <p className="text-text-muted text-sm mt-2">
          Not features. Not deployment. <em>Fixing things.</em>
        </p>
      </div>

      <div className="space-y-4">
        {data.items.map((item) => (
          <AnimatedBar
            key={item.label}
            label={item.label}
            value={item.value}
            maxValue={maxVal}
            color={item.color}
          />
        ))}
      </div>

      <p className="text-text-muted text-sm">
        Features come in focused bursts. Bugs arrive constantly.
      </p>
    </div>
  );
}
