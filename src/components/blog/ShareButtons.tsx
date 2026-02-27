"use client";

import { Fragment, useState } from "react";
import { track } from "@vercel/analytics/react";

type SharePlatform = "x" | "linkedin" | "hn" | "copy";

interface ShareButtonsProps {
  title: string;
  slug: string;
  url: string;
}

export function ShareButtons({ title, slug, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shares: ReadonlyArray<{
    label: string;
    platform: SharePlatform;
    href?: string;
  }> = [
    { label: "copy link", platform: "copy" },
    {
      label: "x",
      platform: "x",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "linkedin",
      platform: "linkedin",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
      label: "hn",
      platform: "hn",
      href: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`,
    },
  ];

  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <span className="text-text-muted">share</span>
      <span className="text-border-light">/</span>
      {shares.map((s, i) => (
        <Fragment key={s.label}>
          {i > 0 && <span className="text-border-light">/</span>}
          {s.href ? (
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("Share Clicked", { platform: s.platform, slug })
              }
              className="text-text-muted hover:text-accent transition-colors"
            >
              {s.label}
            </a>
          ) : (
            <button
              onClick={() => {
                navigator.clipboard.writeText(url).then(
                  () => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  },
                  () => {
                    // Clipboard access denied -- silently fail
                  }
                );
                track("Share Clicked", { platform: "copy", slug });
              }}
              className="text-text-muted hover:text-accent transition-colors cursor-pointer"
            >
              {copied ? "copied!" : s.label}
            </button>
          )}
        </Fragment>
      ))}
    </div>
  );
}
