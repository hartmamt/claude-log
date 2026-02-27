import type { MetadataRoute } from "next";
import { getPostsIndex, getPersonalPostsIndex } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = [...getPostsIndex(), ...getPersonalPostsIndex()];

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/changelog`, lastModified: new Date() },
    { url: `${SITE_URL}/subscribe` },
    { url: `${SITE_URL}/setup` },
    ...posts.map((post) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : undefined,
    })),
  ];
}
