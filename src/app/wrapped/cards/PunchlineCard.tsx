"use client";

import { useInView } from "@/hooks/useInView";

export function PunchlineCard({
  data,
}: {
  data: { headline: string; detail: string };
}) {
  const { ref, visible } = useInView(0.3);

  return (
    <div ref={ref} className="space-y-8 text-center">
      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`}>
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-4">
          The Punchline
        </p>
        <h2 className="font-mono text-2xl md:text-3xl font-black text-foreground leading-tight">
          {data.headline}
        </h2>
      </div>

      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "400ms" }}>
        <p className="text-text-muted text-sm leading-relaxed max-w-md mx-auto">
          {data.detail}
        </p>
      </div>

      <div className={`wrapped-fade-in ${visible ? "visible" : ""}`} style={{ transitionDelay: "800ms" }}>
        <p className="font-mono text-lg text-amber">
          &quot;That&apos;s a feature, not a bug.&quot;
        </p>
      </div>
    </div>
  );
}
