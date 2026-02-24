"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { WrappedData, WrappedProject } from "@/types";
import { getCodingArchetype, getArchetypeDescription } from "./archetypes";

function deriveWorkWeeks(hours: number): string {
  return (Math.round((hours / 40) * 10) / 10).toString();
}

// --- Slide types ---
type SlideContent =
  | { kind: "hero"; title: string; subtitle: string }
  | {
      kind: "stat";
      label: string;
      value: number;
      subtitle?: string;
      color: string;
    }
  | { kind: "bar-chart"; label: string; items: WrappedProject[] }
  | { kind: "quote"; label: string; quote: string }
  | {
      kind: "summary";
      year: number;
      sessions: number;
      messages: number;
      hours: number;
      commits: number;
      projects: number;
      personality: string;
    };

interface SlideConfig {
  id: string;
  gradient: string;
  shouldShow: (data: WrappedData) => boolean;
  extract: (data: WrappedData) => SlideContent;
}

const SLIDES: SlideConfig[] = [
  {
    id: "intro",
    gradient: "wrapped-bg-emerald",
    shouldShow: () => true,
    extract: (d) => ({
      kind: "hero",
      title: `Your ${d.year} with Claude Code`,
      subtitle: d.personality,
    }),
  },
  {
    id: "sessions",
    gradient: "wrapped-bg-indigo",
    shouldShow: () => true,
    extract: (d) => ({
      kind: "stat",
      label: "CODING SESSIONS",
      value: d.totalSessions,
      color: "text-emerald-400",
    }),
  },
  {
    id: "hours",
    gradient: "wrapped-bg-amber",
    shouldShow: () => true,
    extract: (d) => ({
      kind: "stat",
      label: "HOURS WITH AI",
      value: d.totalHours,
      subtitle: `That's ${deriveWorkWeeks(d.totalHours)} work weeks`,
      color: "text-amber-400",
    }),
  },
  {
    id: "commits",
    gradient: "wrapped-bg-emerald",
    shouldShow: (d) => d.totalCommits > 0,
    extract: (d) => ({
      kind: "stat",
      label: "COMMITS SHIPPED",
      value: d.totalCommits,
      color: "text-emerald-400",
    }),
  },
  {
    id: "personality",
    gradient: "wrapped-bg-mesh",
    shouldShow: () => true,
    extract: (d) => {
      const archetype = getCodingArchetype(d);
      return {
        kind: "hero",
        title: archetype,
        subtitle: getArchetypeDescription(archetype),
      };
    },
  },
  {
    id: "projects",
    gradient: "wrapped-bg-indigo",
    shouldShow: () => true,
    extract: (d) => ({
      kind: "bar-chart",
      label: "YOUR PROJECTS",
      items: d.projects,
    }),
  },
  {
    id: "top-workflow",
    gradient: "wrapped-bg-emerald",
    shouldShow: (d) => d.topWorkflow !== null,
    extract: (d) => ({
      kind: "quote",
      label: "TOP WORKFLOW",
      quote: d.topWorkflow ?? "",
    }),
  },
  {
    id: "summary",
    gradient: "wrapped-bg-spectrum",
    shouldShow: () => true,
    extract: (d) => ({
      kind: "summary",
      year: d.year,
      sessions: d.totalSessions,
      messages: d.totalMessages,
      hours: d.totalHours,
      commits: d.totalCommits,
      projects: d.projects.length,
      personality: getCodingArchetype(d),
    }),
  },
];

// --- Animated counter (refs + direct DOM mutation) ---
function AnimatedNumber({
  value,
  reducedMotion,
  className,
}: {
  value: number;
  reducedMotion: boolean;
  className?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    if (reducedMotion || value === 0) {
      el.textContent = value.toLocaleString();
      return;
    }
    let start: number | null = null;
    const canceled = { current: false };
    let rafId: number;

    function animate(ts: number) {
      if (canceled.current || !el) return;
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 1000, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(eased * value).toLocaleString();
      if (progress < 1) rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => {
      canceled.current = true;
      cancelAnimationFrame(rafId);
    };
  }, [value, reducedMotion]);

  return <span ref={spanRef} className={className} />;
}

// --- Slide renderer ---
function SlideRenderer({
  content,
  reducedMotion,
}: {
  content: SlideContent;
  reducedMotion: boolean;
}) {
  switch (content.kind) {
    case "hero":
      return (
        <div className="flex flex-col items-center justify-center text-center px-8 gap-6">
          <h2 className="font-mono text-4xl md:text-6xl font-bold text-white leading-tight">
            {content.title}
          </h2>
          <p className="text-white/60 text-lg md:text-xl max-w-md">
            {content.subtitle}
          </p>
        </div>
      );

    case "stat":
      return (
        <div className="flex flex-col items-center justify-center text-center px-8 gap-4">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-white/50">
            {content.label}
          </p>
          <AnimatedNumber
            value={content.value}
            reducedMotion={reducedMotion}
            className={`font-mono text-7xl md:text-9xl font-bold tabular-nums ${content.color}`}
          />
          {content.subtitle && (
            <p className="text-white/60 text-base">{content.subtitle}</p>
          )}
        </div>
      );

    case "bar-chart": {
      const maxSessions = Math.max(
        ...content.items.map((i) => i.sessions),
        1
      );
      return (
        <div className="flex flex-col items-center justify-center px-8 gap-6 w-full max-w-lg">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-white/50">
            {content.label}
          </p>
          <div className="w-full space-y-3">
            {content.items.slice(0, 6).map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80 font-mono truncate mr-4">
                    {item.name}
                  </span>
                  <span className="text-white/50 font-mono tabular-nums shrink-0">
                    {item.sessions}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(item.sessions / maxSessions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "quote":
      return (
        <div className="flex flex-col items-center justify-center text-center px-8 gap-6">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-white/50">
            {content.label}
          </p>
          <div className="relative">
            <span className="absolute -top-8 -left-4 text-6xl text-white/10 font-serif">
              &ldquo;
            </span>
            <p className="font-mono text-2xl md:text-3xl text-white font-medium leading-relaxed max-w-md">
              {content.quote}
            </p>
            <span className="absolute -bottom-8 -right-4 text-6xl text-white/10 font-serif">
              &rdquo;
            </span>
          </div>
        </div>
      );

    case "summary":
      return (
        <div className="flex flex-col items-center justify-center px-8 gap-8 text-center">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-white/50">
            YOUR {content.year} WRAPPED
          </p>
          <div className="grid grid-cols-2 gap-6 max-w-sm">
            {[
              {
                label: "Sessions",
                value: content.sessions,
                color: "text-emerald-400",
              },
              {
                label: "Messages",
                value: content.messages,
                color: "text-indigo-400",
              },
              {
                label: "Hours",
                value: content.hours,
                color: "text-amber-400",
              },
              {
                label: "Commits",
                value: content.commits,
                color: "text-emerald-400",
              },
            ]
              .filter((s) => s.value > 0)
              .map((stat) => (
                <div key={stat.label}>
                  <p
                    className={`font-mono text-3xl md:text-4xl font-bold tabular-nums ${stat.color}`}
                  >
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-white/50 text-sm font-mono">
                    {stat.label}
                  </p>
                </div>
              ))}
          </div>
          <p className="text-white font-mono text-xl mt-2">
            <span className="text-accent">&ldquo;</span>
            {content.personality}
            <span className="text-accent">&rdquo;</span>
          </p>
          <p className="text-white/40 text-sm">
            Tap to see your shareable card &rarr;
          </p>
        </div>
      );
  }
}

// --- Main story component ---
export function WrappedStory({
  data,
  onComplete,
  onExit,
}: {
  data: WrappedData;
  onComplete: () => void;
  onExit: () => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIndexRef = useRef(0);
  const transitionLockRef = useRef(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Filter slides based on data
  const activeSlides = useMemo(
    () => SLIDES.filter((s) => s.shouldShow(data)),
    [data]
  );

  // Preload modern-screenshot on penultimate slide
  const preloaded = useRef(false);
  useEffect(() => {
    if (!preloaded.current && currentSlide >= activeSlides.length - 2) {
      preloaded.current = true;
      import("modern-screenshot").catch(() => {});
    }
  }, [currentSlide, activeSlides.length]);

  // Clean up transition timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current)
        clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Navigate slides with ref-based transition lock
  const navigate = useCallback(
    (direction: "next" | "prev") => {
      if (transitionLockRef.current) return;

      const idx = slideIndexRef.current;

      if (direction === "next") {
        if (idx >= activeSlides.length - 1) {
          onComplete();
          return;
        }
        transitionLockRef.current = true;
        slideIndexRef.current = idx + 1;
        setCurrentSlide(idx + 1);
      } else {
        if (idx <= 0) return;
        transitionLockRef.current = true;
        slideIndexRef.current = idx - 1;
        setCurrentSlide(idx - 1);
      }

      // Unlock after transition
      if (transitionTimeoutRef.current)
        clearTimeout(transitionTimeoutRef.current);
      if (reducedMotion) {
        transitionLockRef.current = false;
      } else {
        transitionTimeoutRef.current = setTimeout(() => {
          transitionLockRef.current = false;
        }, 350);
      }
    },
    [activeSlides.length, onComplete, reducedMotion]
  );

  // Pointer events for navigation
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const threshold = rect.width * 0.33;
      navigate(x < threshold ? "prev" : "next");
    },
    [navigate]
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          navigate("next");
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigate("prev");
          break;
        case "Escape":
          onExit();
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navigate, onExit]);

  const slide = activeSlides[currentSlide];
  if (!slide) return null;
  const content = slide.extract(data);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none"
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-3 pt-3">
        {activeSlides.map((s, i) => (
          <div
            key={s.id}
            className="h-0.5 flex-1 rounded-full overflow-hidden bg-white/20"
          >
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width:
                  i < currentSlide
                    ? "100%"
                    : i === currentSlide
                      ? "100%"
                      : "0%",
                background:
                  i <= currentSlide
                    ? "linear-gradient(90deg, #10b981, #6366f1)"
                    : "transparent",
              }}
            />
          </div>
        ))}
      </div>

      {/* Exit button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExit();
        }}
        className="absolute top-6 right-4 z-20 text-white/50 hover:text-white text-2xl font-light transition-colors"
        aria-label="Exit story"
      >
        &times;
      </button>

      {/* Slide content */}
      <div
        className={`flex-1 flex items-center justify-center ${slide.gradient} ${
          reducedMotion ? "" : "transition-all duration-300"
        }`}
        style={{
          willChange: reducedMotion ? "auto" : "background",
        }}
      >
        <SlideRenderer content={content} reducedMotion={reducedMotion} />
      </div>

      {/* Navigation hint */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-white/20 text-xs font-mono">
          {currentSlide < activeSlides.length - 1
            ? "tap to continue"
            : "tap to see your card"}
        </p>
      </div>
    </div>
  );
}
