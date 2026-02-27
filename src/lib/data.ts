import fs from "fs";
import path from "path";
import type { BlogPost, SiteStats, ChangelogEntry } from "@/types";

import postsIndex from "@/data/posts-index.json";
import siteStatsData from "@/data/site-stats.json";

const PERSONAL_POSTS_DIR = path.join(
  process.cwd(),
  "src",
  "data",
  "personal-posts"
);

export function getSiteStats(): SiteStats {
  return siteStatsData as SiteStats;
}

export function getPostsIndex(): Omit<BlogPost, "content">[] {
  return postsIndex as Omit<BlogPost, "content">[];
}

export function getPersonalPosts(): BlogPost[] {
  if (!fs.existsSync(PERSONAL_POSTS_DIR)) return [];
  const files = fs.readdirSync(PERSONAL_POSTS_DIR).filter((f) => f.endsWith(".json")).sort();
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(PERSONAL_POSTS_DIR, file), "utf-8");
    return JSON.parse(raw) as BlogPost;
  });
  // Newest first
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPersonalPostsIndex(): Omit<BlogPost, "content">[] {
  return getPersonalPosts().map(({ content: _, ...meta }) => meta);
}

export function getPost(slug: string): BlogPost | null {
  // Check generated posts first
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
    // fall through to personal posts
  }

  // Check personal posts
  try {
    const filePath = path.join(PERSONAL_POSTS_DIR, `${slug}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as BlogPost;
  } catch {
    return null;
  }
}

export function getAllPostSlugs(): string[] {
  const generated = getPostsIndex().map((p) => p.slug);
  const personal = getPersonalPostsIndex().map((p) => p.slug);
  return [...generated, ...personal];
}

export function getChangelog(): ChangelogEntry[] {
  const filePath = path.join(process.cwd(), "src", "data", "changelog.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as ChangelogEntry[];
}
