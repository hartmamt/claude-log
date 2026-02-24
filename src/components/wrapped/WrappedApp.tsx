"use client";

import { useReducer, useCallback, useRef } from "react";
import { z } from "zod";
import type { WrappedData } from "@/types";
import { WrappedLanding } from "./WrappedLanding";
import { WrappedStory } from "./WrappedStory";
import { WrappedCard } from "./WrappedCard";

// --- Zod schema for insights JSON ---
const InsightsSchema = z.object({
  project_areas: z.object({
    areas: z
      .array(
        z.object({
          name: z.string(),
          session_count: z.number().int().nonnegative(),
          description: z.string(),
        })
      )
      .min(1),
  }),
  interaction_style: z.object({
    narrative: z.string(),
    key_pattern: z.string(),
  }),
  what_works: z.object({
    impressive_workflows: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    ),
  }),
});

type ValidatedInsights = z.infer<typeof InsightsSchema>;

// --- Extract WrappedData from validated insights ---
function extractNumber(text: string, pattern: RegExp): number {
  const match = text.match(pattern);
  if (!match?.[1]) return 0;
  return parseInt(match[1].replace(/,/g, ""), 10);
}

function sanitize(str: string, maxLen = 500): string {
  return str.replace(/<[^>]*>/g, "").slice(0, maxLen);
}

function extractWrappedData(insights: ValidatedInsights): WrappedData {
  const areas = insights.project_areas.areas;
  const narrative = insights.interaction_style.narrative.slice(0, 10000);

  return {
    year: new Date().getFullYear(),
    totalSessions: areas.reduce((sum, a) => sum + a.session_count, 0),
    totalMessages: extractNumber(narrative, /(\d[\d,]*)\s+messages/),
    totalHours: extractNumber(narrative, /(\d[\d,]*)\s+hours?\s+of\s+usage/),
    totalCommits: extractNumber(narrative, /(\d[\d,]*)\s+commits/),
    projects: areas.map((a) => ({
      name: sanitize(a.name, 100),
      sessions: a.session_count,
      description: sanitize(a.description, 300),
    })),
    topWorkflow: insights.what_works.impressive_workflows[0]?.title
      ? sanitize(insights.what_works.impressive_workflows[0].title)
      : null,
    personality: sanitize(insights.interaction_style.key_pattern, 200),
  };
}

// --- Parse raw JSON string ---
function parseInsights(
  raw: string
): { success: true; data: WrappedData } | { success: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      success: false,
      error: "Invalid JSON syntax. Check for missing brackets or commas.",
    };
  }

  const result = InsightsSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    return {
      success: false,
      error: `Missing or invalid field: ${issue.path.join(".")} — ${issue.message}`,
    };
  }

  return { success: true, data: extractWrappedData(result.data) };
}

// --- State machine ---
type WrappedState =
  | { phase: "landing" }
  | { phase: "story"; data: WrappedData; isDemo: boolean }
  | { phase: "card"; data: WrappedData; isDemo: boolean };

type WrappedAction =
  | { type: "START_DEMO"; data: WrappedData }
  | { type: "DATA_LOADED"; data: WrappedData }
  | { type: "STORY_COMPLETE" }
  | { type: "WATCH_AGAIN" }
  | { type: "TRY_OWN" }
  | { type: "RESET" };

function wrappedReducer(
  state: WrappedState,
  action: WrappedAction
): WrappedState {
  switch (action.type) {
    case "START_DEMO":
      if (state.phase !== "landing") return state;
      return { phase: "story", data: action.data, isDemo: true };
    case "DATA_LOADED":
      if (state.phase !== "landing") return state;
      return { phase: "story", data: action.data, isDemo: false };
    case "STORY_COMPLETE":
      if (state.phase === "story") {
        return { phase: "card", data: state.data, isDemo: state.isDemo };
      }
      return state;
    case "WATCH_AGAIN":
      if (state.phase === "card") {
        return { phase: "story", data: state.data, isDemo: state.isDemo };
      }
      return state;
    case "TRY_OWN":
    case "RESET":
      return { phase: "landing" };
    default:
      return state;
  }
}

const MAX_FILE_SIZE = 1_048_576; // 1MB

export function WrappedApp() {
  const [state, dispatch] = useReducer(wrappedReducer, { phase: "landing" });
  const demoLoadingRef = useRef(false);

  const handleFile = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      return "File too large. Insights JSON files are typically under 50KB.";
    }
    const text = await file.text();
    const result = parseInsights(text);
    if (!result.success) return result.error;
    dispatch({ type: "DATA_LOADED", data: result.data });
    return null;
  }, []);

  const handleDemo = useCallback(async () => {
    if (demoLoadingRef.current) return;
    demoLoadingRef.current = true;
    try {
      const response = await fetch("/demo-insights.json");
      if (!response.ok) return;
      const raw = await response.text();
      const result = parseInsights(raw);
      if (result.success) {
        dispatch({ type: "START_DEMO", data: result.data });
      }
    } catch {
      // Demo fetch failed silently
    } finally {
      demoLoadingRef.current = false;
    }
  }, []);

  const handleStoryComplete = useCallback(
    () => dispatch({ type: "STORY_COMPLETE" }),
    []
  );
  const handleReset = useCallback(() => dispatch({ type: "RESET" }), []);
  const handleWatchAgain = useCallback(
    () => dispatch({ type: "WATCH_AGAIN" }),
    []
  );
  const handleTryOwn = useCallback(() => dispatch({ type: "TRY_OWN" }), []);

  if (state.phase === "landing") {
    return <WrappedLanding onFile={handleFile} onDemo={handleDemo} />;
  }

  if (state.phase === "story") {
    return (
      <WrappedStory
        data={state.data}
        onComplete={handleStoryComplete}
        onExit={handleReset}
      />
    );
  }

  return (
    <WrappedCard
      data={state.data}
      isDemo={state.isDemo}
      onWatchAgain={handleWatchAgain}
      onTryOwn={handleTryOwn}
    />
  );
}
