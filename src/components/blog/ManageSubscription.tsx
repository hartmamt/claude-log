"use client";

import { useState } from "react";

export function ManageSubscription() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePortal = async () => {
    if (!email) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || "No active support subscription found for this email.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-mono text-lg font-semibold text-foreground">
          Manage subscription
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">
          Enter your email to manage or cancel your support subscription.
          To unsubscribe from emails, use the link in any email we&apos;ve sent you.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-2.5 bg-surface-light border border-border rounded-lg text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />
        <button
          onClick={handlePortal}
          disabled={!email || loading}
          className="px-5 py-2.5 border border-border rounded-lg text-sm text-foreground hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
        >
          {loading ? "..." : "manage"}
        </button>
      </div>
      {message && (
        <p className="text-text-muted text-xs">{message}</p>
      )}
    </div>
  );
}
