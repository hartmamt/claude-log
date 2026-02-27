"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function StatusContent() {
  const params = useSearchParams();

  if (params.get("confirmed") === "true") {
    return (
      <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg">
        <p className="text-accent text-sm font-mono">
          Subscription confirmed! You&apos;ll get an email when new posts go live.
        </p>
      </div>
    );
  }

  if (params.get("unsubscribed") === "true") {
    return (
      <div className="p-4 border border-border bg-surface-light rounded-lg">
        <p className="text-text-muted text-sm font-mono">
          You&apos;ve been unsubscribed. Sorry to see you go.
        </p>
      </div>
    );
  }

  if (params.get("error")) {
    return (
      <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-lg">
        <p className="text-red-400 text-sm font-mono">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }

  return null;
}

export function SubscribeStatus() {
  return (
    <Suspense fallback={null}>
      <StatusContent />
    </Suspense>
  );
}
