import { getSiteStats } from "@/lib/data";

export function Footer() {
  const stats = getSiteStats();

  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <span>
            <span className="text-accent font-mono">{stats.totalSessions}</span>{" "}
            sessions
          </span>
          <span className="text-border-light">/</span>
          <span>
            <span className="text-amber font-mono">{stats.totalCommits}</span>{" "}
            commits
          </span>
          <span className="text-border-light">/</span>
          <span>{stats.dateRange}</span>
        </div>
        <div className="text-text-muted">
          from{" "}
          <a
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            claude code
          </a>{" "}
          /insights
        </div>
      </div>
    </footer>
  );
}
