import { getSiteStats } from "@/lib/data";

export function Footer() {
  const stats = getSiteStats();

  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-3xl mx-auto px-6 py-4 flex flex-col gap-3 text-xs text-text-muted">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/hartmamt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-foreground transition-colors"
            >
              github
            </a>
            <a
              href="https://x.com/matthew_hartman"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-foreground transition-colors"
            >
              x
            </a>
            <a
              href="https://www.linkedin.com/in/matthewhartman/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-foreground transition-colors"
            >
              linkedin
            </a>
          </div>
        </div>
        <div className="text-text-muted">
          generated from{" "}
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
