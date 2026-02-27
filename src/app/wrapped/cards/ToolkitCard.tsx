"use client";

import { AnimatedBar } from "@/components/wrapped/AnimatedBar";
import { useInView } from "@/hooks/useInView";

export function ToolkitCard({
  data,
}: {
  data: {
    tools: { label: string; value: number; color: string }[];
  };
}) {
  const { ref, visible } = useInView(0.3);
  const maxVal = Math.max(...data.tools.map((t) => t.value));

  return (
    <div ref={ref} className="space-y-8">
      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`}>
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-2">
          The Toolkit
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-black text-foreground">
          <span className="text-accent">Bash</span> runs the show.
        </h2>
        <p className="text-text-muted text-sm mt-2">
          Top tools across all sessions.
        </p>
      </div>

      <div className="space-y-4">
        {data.tools.map((tool) => (
          <AnimatedBar
            key={tool.label}
            label={tool.label}
            value={tool.value}
            maxValue={maxVal}
            color={tool.color}
          />
        ))}
      </div>

      <p className="text-text-muted text-sm">
        4,135 Bash calls. I let Claude run autonomously through builds, deploys, and multi-file operations.
      </p>
    </div>
  );
}
