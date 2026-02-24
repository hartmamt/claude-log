import fs from "fs";
import path from "path";
import type { BlogPost, SiteStats, ChangelogEntry } from "@/types";

import postsIndex from "@/data/posts-index.json";
import siteStatsData from "@/data/site-stats.json";

export function getSiteStats(): SiteStats {
  return siteStatsData as SiteStats;
}

export function getPostsIndex(): Omit<BlogPost, "content">[] {
  return postsIndex as Omit<BlogPost, "content">[];
}

export function getPost(slug: string): BlogPost | null {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "posts",
      `${slug}.json`
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as BlogPost;
  } catch {
    return null;
  }
}

export function getAllPostSlugs(): string[] {
  return getPostsIndex().map((p) => p.slug);
}

export function getChangelog(): ChangelogEntry[] {
  const filePath = path.join(process.cwd(), "src", "data", "changelog.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as ChangelogEntry[];
}
