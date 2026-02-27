"use client";

import { AnimatedBar } from "@/components/wrapped/AnimatedBar";
import { useInView } from "@/hooks/useInView";

export function ClockCard({
  data,
}: {
  data: {
    periods: { label: string; sublabel: string; value: number; color: string }[];
    peakLabel: string;
    peakValue: number;
  };
}) {
  const { ref, visible } = useInView(0.3);
  const maxVal = Math.max(...data.periods.map((p) => p.value));

  return (
    <div ref={ref} className="space-y-8">
      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`}>
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-2">
          When I Code
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-black text-foreground">
          The deep work happens<br />
          <span className="text-secondary">after hours.</span>
        </h2>
      </div>

      <div className="space-y-4">
        {data.periods.map((p) => (
          <AnimatedBar
            key={p.label}
            label={p.label}
            sublabel={p.sublabel}
            value={p.value}
            maxValue={maxVal}
            color={p.color}
          />
        ))}
      </div>

      <p className="text-text-muted text-sm">
        <span className="font-mono text-secondary font-bold">{data.peakValue.toLocaleString()}</span> messages after 6pm.
        The 14 midnight messages mean I&apos;m at least sleeping.
      </p>
    </div>
  );
}
