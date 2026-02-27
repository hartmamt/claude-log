"use client";

import { useInView } from "@/hooks/useInView";

const barColors: Record<string, string> = {
  accent: "bg-accent",
  secondary: "bg-secondary",
  amber: "bg-amber",
  red: "bg-red",
  muted: "bg-border-light",
};

export function AnimatedBar({
  label,
  sublabel,
  value,
  maxValue,
  color = "accent",
}: {
  label: string;
  sublabel?: string;
  value: number;
  maxValue: number;
  color?: string;
}) {
  const { ref, visible } = useInView(0.2);
  const pct = Math.round((value / maxValue) * 100);
  const bg = barColors[color] || "bg-accent";

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">{label}</span>
          {sublabel && (
            <span className="text-xs text-text-muted">{sublabel}</span>
          )}
        </div>
        <span className="font-mono text-sm font-bold text-foreground">
          {value.toLocaleString()}
        </span>
      </div>
      <div className="h-3 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bg} wrapped-bar`}
          style={{
            transform: visible ? `scaleX(${pct / 100})` : "scaleX(0)",
            transformOrigin: "left",
          }}
        />
      </div>
    </div>
  );
}
