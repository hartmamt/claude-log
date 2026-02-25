"use client";

import { useState } from "react";

/** Strip custom directives (:::callout, :::prompt, :::stat) back to plain markdown */
function cleanMarkdown(title: string, subtitle: string, content: string): string {
  let md = `# ${title}\n\n*${subtitle}*\n\n`;

  let cleaned = content
    // :::callout{type="xxx"} ... ::: → blockquote
    .replace(/:::callout\{type="\w+"\}\n([\s\S]*?):::/g, (_m, body) =>
      body.trim().split("\n").map((l: string) => `> ${l}`).join("\n")
    )
    // :::prompt ... ::: → code block
    .replace(/:::prompt\n([\s\S]*?):::/g, (_m, body) => `\`\`\`\n${body.trim()}\n\`\`\``)
    // :::stat{value="X" label="Y"}::: → bold inline
    .replace(/:::stat\{value="([^"]+)" label="([^"]+)"\}:::/g, "**$1** $2");

  md += cleaned;
  return md;
}

export function CopyMarkdownButton({
  title,
  subtitle,
  content,
}: {
  title: string;
  subtitle: string;
  content: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const md = cleanMarkdown(title, subtitle, content);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-mono rounded border border-border hover:border-accent/40 hover:bg-surface-light text-text-muted hover:text-accent transition-colors cursor-pointer"
    >
      {copied ? "copied!" : "copy as markdown"}
    </button>
  );
}
