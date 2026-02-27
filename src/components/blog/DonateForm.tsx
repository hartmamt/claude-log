"use client";

import { useState } from "react";
import { track } from "@vercel/analytics/react";

const PRESETS = [500, 1000, 2500]; // $5, $10, $25

export function DonateForm() {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amountCents =
    selected ?? (custom ? Math.round(parseFloat(custom) * 100) : 0);

  const handleDonate = async () => {
    if (!amountCents || amountCents < 100) {
      setError("Minimum donation is $1");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountCents }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const { url } = await res.json();
      track("Donate Clicked", { amount: String(amountCents) });
      window.location.href = url;
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset amounts */}
      <div className="flex gap-3">
        {PRESETS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => {
              setSelected(amt);
              setCustom("");
            }}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-mono font-semibold transition-colors cursor-pointer ${
              selected === amt
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface-light text-text-muted hover:border-border-light"
            }`}
          >
            ${amt / 100}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
            $
          </span>
          <input
            type="number"
            min="1"
            max="500"
            step="1"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setSelected(null);
            }}
            placeholder="Other amount"
            className="w-full pl-7 pr-4 py-2.5 bg-surface-light border border-border rounded-lg text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleDonate}
          disabled={loading || !amountCents}
          className="px-6 py-2.5 bg-accent text-background font-semibold text-sm rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          {loading ? "..." : "Donate"}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
