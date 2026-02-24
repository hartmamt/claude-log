import { getPostsIndex, getSiteStats } from "@/lib/data";
import { PostCard } from "@/components/blog/PostCard";
import { StatsBar } from "@/components/blog/StatsBar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "/insights - Building in Public with Claude Code",
};

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
            href="/changelog"
            className="text-xs text-secondary hover:underline"
          >
            view changelog
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      {/* About blurb */}
      <div className="border-t border-border pt-8 flex items-start gap-4">
        <div className="space-y-2">
          <h2 className="font-mono text-sm font-semibold text-foreground">
            Built by{" "}
            <Link href="/about" className="text-accent hover:underline">
              Matt Hartman
            </Link>
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            Director of Intelligent Systems at Monti, Inc. 20+ years in
            enterprise architecture, IoT platforms, and product leadership.
            Previously at P&amp;G and the University of Cincinnati.
          </p>
        </div>
      </div>
    </div>
  );
}
