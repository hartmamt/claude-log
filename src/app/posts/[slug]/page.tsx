import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPost, getPostsIndex } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";
import { PostContent } from "@/components/blog/PostContent";
import { CopyMarkdownButton } from "@/components/blog/CopyMarkdownButton";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { SubscribeForm } from "@/components/blog/SubscribeForm";
import { colorMap, iconMap } from "@/lib/theme";

function hasOgImage(slug: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", "og", `${slug}.png`));
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const ogImage = hasOgImage(slug) ? `/og/${slug}.png` : "/og.png";
  return {
    title: post ? `${post.title} - insights.codes` : "Post - insights.codes",
    description: post?.subtitle,
    openGraph: {
      title: post?.title,
      description: post?.subtitle,
      type: "article",
      url: `${SITE_URL}/posts/${slug}`,
      siteName: "insights.codes",
      publishedTime: post?.date,
      authors: ["Matt Hartman"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post?.title || "insights.codes",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post?.title,
      description: post?.subtitle,
      images: [ogImage],
      creator: "@matthew_hartman",
      site: "@matthew_hartman",
    },
    alternates: {
      canonical: `${SITE_URL}/posts/${slug}`,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const allPosts = getPostsIndex();
  const currentIdx = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
  const nextPost =
    currentIdx < allPosts.length - 1 ? allPosts[currentIdx + 1] : null;

  const color = colorMap[post.categoryColor] || "text-accent";
  const icon = iconMap[post.icon] || ">>";
  const showHeaderImage = hasOgImage(slug);

  return (
    <>
      <ReadingProgress />
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-text-muted mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            posts
          </Link>
          <span className="mx-2 text-border-light">/</span>
          <span className="text-foreground">{post.slug}</span>
        </div>

        <article>
          {/* Header image */}
          {showHeaderImage && (
            <div className="mb-8 -mx-6 sm:mx-0">
              <Image
                src={`/og/${slug}.png`}
                alt=""
                width={1200}
                height={630}
                priority
                className="w-full rounded-lg border border-border"
              />
            </div>
          )}

          {/* Post header */}
          <div className="mb-10 pb-8 border-b border-border">
            <div className="flex items-center gap-3 mb-4 text-xs font-mono">
              <span className={`font-semibold ${color}`}>
                {icon} {post.category}
              </span>
              <span className="text-border-light">/</span>
              <span className="text-text-muted">{post.readingTime}</span>
              <span className="text-border-light">/</span>
              <span className="text-text-muted">{post.date}</span>
            </div>
            <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
              {post.title}
            </h1>
            <p className="text-text-muted text-base leading-relaxed">
              {post.subtitle}
            </p>

            <div className="mt-4 flex items-center gap-4">
              <CopyMarkdownButton
                title={post.title}
                subtitle={post.subtitle}
                content={post.content}
              />
              <ShareButtons
                title={post.title}
                slug={slug}
                url={`${SITE_URL}/posts/${slug}`}
              />
            </div>

            {/* Stats row */}
            {post.stats && post.stats.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6">
                {post.stats.map((s) => (
                  <div key={s.label} className="stat-badge">
                    <span
                      className={`stat-badge-value ${colorMap[s.color] || "text-accent"}`}
                    >
                      {s.value}
                    </span>
                    <span className="text-text-muted">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Highlights */}
            {post.highlights && post.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {post.highlights.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1 bg-surface-light border border-border rounded-full text-xs text-text-muted"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Key Takeaway */}
          {post.keyTakeaway && (
            <div className="callout callout-insight mb-8">
              <div className="font-mono text-[10px] text-secondary font-semibold uppercase tracking-wider mb-1">
                Key Takeaway
              </div>
              <div className="text-sm text-foreground">
                {post.keyTakeaway}
              </div>
            </div>
          )}

          {/* Post content */}
          <PostContent content={post.content} />
        </article>

        {/* Bottom share */}
        <div className="mt-10 pt-6 border-t border-border">
          <ShareButtons
            title={post.title}
            slug={slug}
            url={`${SITE_URL}/posts/${slug}`}
          />
        </div>

        {/* Subscribe CTA */}
        <div className="my-10 p-6 border border-border rounded-lg border-l-[3px] border-l-accent" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
          <div className="font-mono text-[10px] text-accent font-semibold uppercase tracking-wider mb-2">
            enjoyed this?
          </div>
          <p className="text-sm text-text-muted mb-4">
            Get posts like this delivered to your inbox. No spam, no algorithms.
          </p>
          <SubscribeForm compact />
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-10 gap-4">
          {prevPost ? (
            <Link
              href={`/posts/${prevPost.slug}`}
              className="card flex-1 p-4 hover:border-accent/30 transition-colors"
            >
              <div className="text-xs text-text-muted mb-1">
                &larr; prev
              </div>
              <div className="text-accent text-sm font-mono truncate">
                {prevPost.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextPost ? (
            <Link
              href={`/posts/${nextPost.slug}`}
              className="card flex-1 p-4 hover:border-accent/30 transition-colors text-right"
            >
              <div className="text-xs text-text-muted mb-1">
                next &rarr;
              </div>
              <div className="text-accent text-sm font-mono truncate">
                {nextPost.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </>
  );
}
