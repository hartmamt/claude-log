"use client";

import { useState } from "react";

const SUGGESTED_AMOUNTS = [5, 10, 20];

export function SupportTiers() {
  const [email, setEmail] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSupport = async (amount: number) => {
    if (!email) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="font-mono text-lg font-semibold text-foreground">
          Support insights.codes
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">
          All content is always free. Supporting helps keep it going.
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-2.5 bg-surface-light border border-border rounded-lg text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />

        <div className="grid grid-cols-3 gap-3">
          {SUGGESTED_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => handleSupport(amount)}
              disabled={!email || loading}
              className="px-4 py-3 border border-border rounded-lg text-sm font-mono text-foreground hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-40 cursor-pointer"
            >
              ${amount}/mo
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-1 px-4 py-2.5 bg-surface-light border border-border rounded-lg">
            <span className="text-text-muted text-sm">$</span>
            <input
              type="number"
              min="1"
              max="1000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="custom"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-text-muted focus:outline-none"
            />
            <span className="text-text-muted text-sm">/mo</span>
          </div>
          <button
            onClick={() => handleSupport(Number(customAmount))}
            disabled={!email || !customAmount || Number(customAmount) < 1 || loading}
            className="px-5 py-2.5 bg-accent text-background font-semibold text-sm rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            {loading ? "..." : "support"}
          </button>
        </div>
      </div>
    </div>
  );
}
