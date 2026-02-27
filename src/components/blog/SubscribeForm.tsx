"use client";

import { useState } from "react";
import { track } from "@vercel/analytics/react";

type FormState = "idle" | "loading" | "success" | "error";

export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      // SECURITY: Do NOT include email or PII in analytics events
      track("Subscribe Submitted", { page: window.location.pathname });
      setState("success");
      setEmail("");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (state === "success") {
    return (
      <div className={compact ? "" : "py-2"}>
        <p className="text-accent text-sm font-mono">
          Check your email to confirm your subscription.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "flex gap-2" : "flex flex-col sm:flex-row gap-3"}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 px-4 py-2.5 bg-surface-light border border-border rounded-lg text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="px-5 py-2.5 bg-accent text-background font-semibold text-sm rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
      >
        {state === "loading" ? "..." : compact ? "subscribe" : "subscribe — free"}
      </button>
      {state === "error" && (
        <p className="text-red-400 text-xs mt-1 sm:mt-0 sm:self-center">{errorMsg}</p>
      )}
    </form>
  );
}
