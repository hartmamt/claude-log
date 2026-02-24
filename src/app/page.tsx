import { getPostsIndex, getSiteStats } from "@/lib/data";
import { PostCard } from "@/components/blog/PostCard";
import { StatsBar } from "@/components/blog/StatsBar";
import Link from "next/link";

export default function HomePage() {
  const posts = getPostsIndex();
  const stats = getSiteStats();

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
      {/* Hero */}
      <div className="space-y-5">
        <h1 className="font-mono text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Building in Public<br />
          <span className="text-accent">with Claude Code</span>
        </h1>
        <p className="text-text-muted text-base leading-relaxed max-w-xl">
          {stats.totalSessions} sessions. {stats.totalCommits} commits. {stats.dateRange}.
          Real insights from using an AI coding assistant as a full-stack engineering partner.
          Generated from{" "}
          <code className="font-mono text-accent text-sm">/insights</code>.
        </p>
        <StatsBar stats={stats} />
      </div>

      {/* Featured Post */}
      <PostCard post={featured} featured />

      {/* Post Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg font-semibold text-foreground tracking-tight">
            All Posts
          </h2>
          <Link
            href="/journey"
            className="text-xs text-secondary hover:underline"
          >
            view timeline
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      {/* Fork CTA */}
      <div className="card p-8 text-center">
        <h3 className="font-mono font-bold text-foreground text-lg mb-2">
          Make Your Own Dev Log
        </h3>
        <p className="text-text-muted text-sm mb-5 max-w-md mx-auto">
          This site was generated from Claude Code&apos;s{" "}
          <code className="font-mono text-accent text-xs">/insights</code> command.
          Fork the repo and generate your own.
        </p>
        <Link
          href="/setup"
          className="inline-block px-6 py-2.5 bg-accent text-background font-mono font-semibold text-sm rounded-lg hover:bg-accent-dim transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
