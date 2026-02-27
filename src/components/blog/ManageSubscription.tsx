"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "sent" | "error";

export function ManageSubscription() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("loading");

    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error();
      setState("sent");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="space-y-2">
        <h2 className="font-mono text-lg font-semibold text-foreground">
          Manage subscription
        </h2>
        <p className="text-accent text-sm font-mono">
          If you have an active subscription, we&apos;ve sent a management link to your email.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-mono text-lg font-semibold text-foreground">
          Manage subscription
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">
          Enter your email and we&apos;ll send you a link to manage or cancel your
          support subscription. To unsubscribe from emails, use the link in any
          email we&apos;ve sent you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
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
          className="px-5 py-2.5 border border-border rounded-lg text-sm text-foreground hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
        >
          {state === "loading" ? "..." : "send link"}
        </button>
      </form>
      {state === "error" && (
        <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
