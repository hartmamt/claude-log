import type { MetadataRoute } from "next";
import { getAllPostSlugs, getPost } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllPostSlugs();

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/changelog`, lastModified: new Date() },
    { url: `${SITE_URL}/subscribe` },
    { url: `${SITE_URL}/setup` },
    ...slugs.map((slug) => {
      const post = getPost(slug);
      return {
        url: `${SITE_URL}/posts/${slug}`,
        lastModified: post?.date ? new Date(post.date) : undefined,
      };
    }),
  ];
}
