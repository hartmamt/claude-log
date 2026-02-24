import type { SiteStats } from "@/types";

export function StatsBar({ stats }: { stats: SiteStats }) {
  return (
    <div className="flex flex-wrap gap-6 text-sm font-mono">
      <div>
        <span className="text-accent font-bold text-lg">{stats.totalSessions}</span>
        <span className="text-text-muted ml-1.5">sessions</span>
      </div>
      <div>
        <span className="text-secondary font-bold text-lg">{stats.totalMessages}</span>
        <span className="text-text-muted ml-1.5">messages</span>
      </div>
      <div>
        <span className="text-amber font-bold text-lg">{stats.totalHours}</span>
        <span className="text-text-muted ml-1.5">hours</span>
      </div>
      <div>
        <span className="text-foreground font-bold text-lg">{stats.totalCommits}</span>
        <span className="text-text-muted ml-1.5">commits</span>
      </div>
      <div>
        <span className="text-[#a855f7] font-bold text-lg">{stats.projectCount}</span>
        <span className="text-text-muted ml-1.5">projects</span>
      </div>
    </div>
  );
}
