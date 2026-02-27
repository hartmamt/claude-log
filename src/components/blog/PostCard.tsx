import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types";
import { colorMap, iconMap } from "@/lib/theme";

type PostMeta = Omit<BlogPost, "content">;

function hasOgImage(slug: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", "og", `${slug}.png`));
}

export function PostCard({ post, featured = false }: { post: PostMeta; featured?: boolean }) {
  const color = colorMap[post.categoryColor] || "text-accent";
  const icon = iconMap[post.icon] || ">>";
  const showImage = hasOgImage(post.slug);

  if (featured) {
    return (
      <Link
        href={`/posts/${post.slug}`}
        className="card block hover:border-accent/30 transition-all group overflow-hidden"
      >
        {showImage && (
          <Image
            src={`/og/${post.slug}.png`}
            alt=""
            width={1200}
            height={630}
            className="w-full border-b border-border"
          />
        )}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4 text-xs font-mono">
            <span className={`font-semibold ${color}`}>
              {icon} {post.category}
            </span>
            <span className="text-border-light">/</span>
            <span className="text-text-muted">{post.readingTime}</span>
          </div>
          <h2 className="font-mono text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors tracking-tight">
            {post.title}
          </h2>
          <p className="text-text-muted text-sm leading-relaxed mb-5 max-w-2xl">
            {post.subtitle}
          </p>
          {post.stats && (
            <div className="flex flex-wrap gap-3 mb-4">
              {post.stats.map((s) => (
                <div key={s.label} className="stat-badge">
                  <span className={`stat-badge-value ${colorMap[s.color] || "text-accent"}`}>
                    {s.value}
                  </span>
                  <span className="text-text-muted">{s.label}</span>
                </div>
              ))}
            </div>
          )}
          {post.keyTakeaway && (
            <div className="text-xs text-secondary border-t border-border pt-4 mt-2">
              <span className="text-text-muted font-mono uppercase tracking-wider">Key Takeaway: </span>
              {post.keyTakeaway}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="card block hover:border-accent/30 transition-all group overflow-hidden"
    >
      {showImage && (
        <Image
          src={`/og/${post.slug}.png`}
          alt=""
          width={1200}
          height={630}
          className="w-full border-b border-border"
        />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-mono">
          <span className={`font-semibold ${color}`}>
            {icon} {post.category}
          </span>
          <span className="text-border-light">/</span>
          <span className="text-text-muted">{post.readingTime}</span>
        </div>
        <h3 className="font-mono font-bold text-foreground mb-2 group-hover:text-accent transition-colors tracking-tight">
          {post.title}
        </h3>
        <p className="text-text-muted text-xs leading-relaxed mb-3 line-clamp-2">
          {post.subtitle}
        </p>
        {post.highlights && post.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.highlights.slice(0, 3).map((h) => (
              <span
                key={h}
                className="px-2 py-0.5 bg-surface-light border border-border rounded-full text-[11px] text-text-muted"
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
