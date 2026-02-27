"use client";

import { useState, useEffect, useCallback } from "react";
import { SubscribeForm } from "./SubscribeForm";
import { track } from "@vercel/analytics/react";

const VISITED_KEY = "insights_visited_slugs";
const SUBSCRIBER_KEY = "insights_subscriber_confirmed";
const FREE_ARTICLE_LIMIT = 5;

export function MeterGate({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const [gated, setGated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Confirmed subscribers bypass
    if (localStorage.getItem(SUBSCRIBER_KEY) === "true") return;

    // Track unique slug visit
    const visited: string[] = JSON.parse(
      localStorage.getItem(VISITED_KEY) || "[]"
    );
    if (!visited.includes(slug)) {
      visited.push(slug);
      localStorage.setItem(VISITED_KEY, JSON.stringify(visited));
    }

    // Gate if over limit
    if (visited.length > FREE_ARTICLE_LIMIT) {
      setGated(true);
      track("Meter Gate Shown", { slug, articlesRead: String(visited.length) });
    }
  }, [slug]);

  // Listen for cross-tab localStorage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SUBSCRIBER_KEY && e.newValue === "true") {
        setGated(false);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleSubscribeSuccess = useCallback(() => {
    localStorage.removeItem(VISITED_KEY);
    setGated(false);
    track("Meter Gate Unlocked", { slug });
  }, [slug]);

  if (!mounted || !gated) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="meter-gated-content">{children}</div>

      <div
        className="meter-overlay"
        role="dialog"
        aria-label="Subscribe to keep reading"
      >
        <div className="max-w-md mx-auto text-center">
          <div className="font-mono text-[10px] text-accent font-semibold uppercase tracking-wider mb-2">
            free articles remaining: 0
          </div>
          <h3 className="font-mono text-xl font-bold text-foreground mb-2">
            Subscribe to keep reading
          </h3>
          <p className="text-text-muted text-sm mb-6">
            You&apos;ve read your 5 free articles. Enter your email to unlock
            all content — free, no spam.
          </p>
          <SubscribeForm compact onSuccess={handleSubscribeSuccess} />
        </div>
      </div>
    </div>
  );
}
