import { getPostsIndex, getPersonalPostsIndex } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = [...getPostsIndex(), ...getPersonalPostsIndex()].sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  const lastBuildDate =
    posts.length > 0
      ? new Date(posts[0].date).toUTCString()
      : new Date().toUTCString();

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/posts/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/posts/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(post.subtitle)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>insights.codes</title>
    <link>${SITE_URL}</link>
    <description>Notes on building with AI — real patterns from real projects</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
