"use client";

import { useState, useRef, useCallback } from "react";
import type { WrappedData } from "@/types";

// --- Coding personality (same logic as WrappedStory) ---
function getCodingArchetype(data: WrappedData): string {
  const avgDuration =
    data.totalSessions > 0 ? data.totalHours / data.totalSessions : 0;
  const commitRatio =
    data.totalSessions > 0 ? data.totalCommits / data.totalSessions : 0;

  if (data.projects.length >= 4) return "The Polyglot";
  if (commitRatio > 1.2) return "The Shipper";
  if (data.totalSessions > 100 && avgDuration < 3) return "The Sprinter";
  if (data.totalSessions < 50 && avgDuration > 6) return "The Deep Diver";
  return "The Builder";
}

type CardState = "ready" | "generating" | "done" | "error";

export function WrappedCard({
  data,
  isDemo,
  onWatchAgain,
  onTryOwn,
}: {
  data: WrappedData;
  isDemo: boolean;
  onWatchAgain: () => void;
  onTryOwn: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardState, setCardState] = useState<CardState>("ready");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const generateCard = useCallback(async () => {
    if (cardState === "generating" || !cardRef.current) return;
    setCardState("generating");

    try {
      await document.fonts.ready;
      const { domToPng } = await import("modern-screenshot");
      const dataUrl = await domToPng(cardRef.current, {
        width: 1080,
        height: 1080,
        scale: 1,
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Revoke previous blob
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(url);
      setCardState("done");
      return { blob, url };
    } catch {
      setCardState("error");
      return null;
    }
  }, [cardState, blobUrl]);

  const handleDownload = useCallback(async () => {
    const result = cardState === "done" && blobUrl
      ? { blob: await fetch(blobUrl).then((r) => r.blob()), url: blobUrl }
      : await generateCard();
    if (!result) return;

    const a = document.createElement("a");
    a.href = result.url;
    a.download = "claude-code-wrapped.png";
    a.click();
  }, [cardState, blobUrl, generateCard]);

  const handleShare = useCallback(async () => {
    const result = cardState === "done" && blobUrl
      ? { blob: await fetch(blobUrl).then((r) => r.blob()), url: blobUrl }
      : await generateCard();
    if (!result) return;

    const text = `I coded with Claude for ${data.totalHours.toLocaleString()} hours across ${data.totalSessions.toLocaleString()} sessions. Get your Wrapped: slashinsights.codes/wrapped`;
    const file = new File([result.blob], "claude-code-wrapped.png", {
      type: "image/png",
    });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }

    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(
        "https://slashinsights.codes/wrapped"
      );
    } catch {
      // Silent fail
    }
  }, [cardState, blobUrl, generateCard, data]);

  // Clean up blob on unmount
  // (intentionally not using useEffect cleanup since blobUrl updates via state)

  const personality = getCodingArchetype(data);

  const stats = [
    { value: data.totalMessages, label: "messages", color: "text-indigo-400" },
    { value: data.totalHours, label: "hours", color: "text-amber-400" },
    { value: data.projects.length, label: "projects", color: "text-emerald-400" },
  ].filter((s) => s.value > 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      {/* Visible card preview */}
      <div className="rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-white/10 max-w-[400px] w-full">
        <div className="aspect-square bg-[#09090b] p-8 flex flex-col justify-between relative">
          {/* Top branding */}
          <p className="font-mono text-[10px] text-white/40 tracking-[0.25em] uppercase">
            Claude Code // {data.year} Wrapped
          </p>

          {/* Center stats */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <p className="font-mono text-6xl font-bold text-white tabular-nums">
              {data.totalSessions.toLocaleString()}
            </p>
            <p className="font-mono text-sm text-white/50">sessions</p>

            <div className="flex gap-6 mt-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p
                    className={`font-mono text-xl font-bold tabular-nums ${s.color}`}
                  >
                    {s.value.toLocaleString()}
                  </p>
                  <p className="font-mono text-[10px] text-white/40">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div className="text-center mb-4">
            <p className="font-mono text-emerald-400 text-sm">
              &ldquo;{personality}&rdquo;
            </p>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="font-mono text-[10px] text-white/30">
              /insights
            </span>
            <span className="font-mono text-[10px] text-white/30">
              slashinsights.codes
            </span>
          </div>
        </div>
      </div>

      {/* Off-screen card for capture (1080x1080) */}
      <div
        ref={cardRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1080px",
          height: "1080px",
        }}
      >
        <div
          style={{
            width: "1080px",
            height: "1080px",
            background: "#09090b",
            padding: "80px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: '"JetBrains Mono", monospace',
            color: "white",
          }}
        >
          {/* Top branding */}
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            Claude Code // {data.year} Wrapped
          </p>

          {/* Center */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              flex: 1,
            }}
          >
            <p
              style={{
                fontSize: "160px",
                fontWeight: 700,
                lineHeight: 1,
                textShadow: "0 0 40px rgba(16,185,129,0.3)",
              }}
            >
              {data.totalSessions.toLocaleString()}
            </p>
            <p style={{ fontSize: "24px", color: "rgba(255,255,255,0.5)" }}>
              sessions
            </p>

            <div
              style={{
                display: "flex",
                gap: "64px",
                marginTop: "48px",
              }}
            >
              {stats.map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "48px",
                      fontWeight: 700,
                      color:
                        s.color === "text-indigo-400"
                          ? "#818cf8"
                          : s.color === "text-amber-400"
                            ? "#fbbf24"
                            : "#34d399",
                    }}
                  >
                    {s.value.toLocaleString()}
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ fontSize: "28px", color: "#34d399" }}>
              &ldquo;{personality}&rdquo;
            </p>
          </div>

          {/* Bottom */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "24px",
              fontSize: "14px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            <span>/insights</span>
            <span>slashinsights.codes</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleDownload}
          disabled={cardState === "generating"}
          className="border border-accent text-accent font-mono text-sm px-8 py-3 rounded-full hover:bg-accent hover:text-background transition-all duration-300 disabled:opacity-50"
        >
          {cardState === "generating"
            ? "Generating..."
            : cardState === "done"
              ? "Download PNG"
              : "Save Image"}
        </button>
        <button
          onClick={handleShare}
          disabled={cardState === "generating"}
          className="border border-secondary text-secondary font-mono text-sm px-8 py-3 rounded-full hover:bg-secondary hover:text-background transition-all duration-300 disabled:opacity-50"
        >
          Share
        </button>
      </div>

      {/* Twitter intent */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `I coded with Claude for ${data.totalHours.toLocaleString()} hours across ${data.totalSessions.toLocaleString()} sessions this year.`
        )}&url=${encodeURIComponent("https://slashinsights.codes/wrapped")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-muted font-mono text-xs hover:text-foreground transition-colors"
      >
        Share on X/Twitter &rarr;
      </a>

      {/* Secondary actions */}
      <div className="flex items-center gap-6 mt-4">
        <button
          onClick={onWatchAgain}
          className="text-text-muted font-mono text-sm hover:text-foreground transition-colors"
        >
          Watch again
        </button>
        {isDemo && (
          <button
            onClick={onTryOwn}
            className="text-accent font-mono text-sm hover:underline"
          >
            Upload your own data &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
