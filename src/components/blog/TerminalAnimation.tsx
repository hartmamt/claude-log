"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TerminalLine {
  type: "input" | "output";
  text: string;
}

interface TerminalAnimationProps {
  title: string;
  lines: TerminalLine[];
}

export function TerminalAnimation({ title, lines }: TerminalAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [visibleLines, setVisibleLines] = useState<
    { type: "input" | "output"; text: string }[]
  >([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const animatingRef = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver to auto-play
  useEffect(() => {
    if (started) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // If reduced motion, show all lines immediately
  useEffect(() => {
    if (started && reducedMotion) {
      setVisibleLines(lines.map((l) => ({ type: l.type, text: l.text })));
      setDone(true);
    }
  }, [started, reducedMotion, lines]);

  // Typing animation
  const animate = useCallback(async () => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const charDelay = line.type === "input" ? 35 : 12;

      // Add empty line, then type characters into it
      setVisibleLines((prev) => [...prev, { type: line.type, text: "" }]);

      for (let j = 0; j < line.text.length; j++) {
        await new Promise((r) => setTimeout(r, charDelay));
        const partial = line.text.slice(0, j + 1);
        setVisibleLines((prev) => {
          const next = [...prev];
          next[next.length - 1] = { type: line.type, text: partial };
          return next;
        });
      }

      // Pause between lines
      await new Promise((r) => setTimeout(r, line.type === "input" ? 400 : 200));
    }

    setDone(true);
    animatingRef.current = false;
  }, [lines]);

  useEffect(() => {
    if (started && !reducedMotion && !done) {
      animate();
    }
  }, [started, reducedMotion, done, animate]);

  // Blinking cursor
  useEffect(() => {
    if (done) {
      setCursorVisible(true);
      return;
    }
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, [done]);

  // Auto-scroll terminal body to bottom
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div ref={containerRef} className="terminal-container">
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
        </div>
        <span className="terminal-title">{title}</span>
      </div>
      <div ref={bodyRef} className="terminal-body">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "input"
                ? "terminal-line-input"
                : "terminal-line-output"
            }
          >
            {line.type === "input" && (
              <span className="terminal-prompt">$ </span>
            )}
            <span>{line.text}</span>
            {i === visibleLines.length - 1 && !done && (
              <span
                className="terminal-cursor"
                style={{ opacity: cursorVisible ? 1 : 0 }}
              >
                |
              </span>
            )}
          </div>
        ))}
        {done && (
          <div className="terminal-line-input">
            <span className="terminal-prompt">$ </span>
            <span
              className="terminal-cursor"
              style={{ opacity: cursorVisible ? 1 : 0 }}
            >
              |
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
