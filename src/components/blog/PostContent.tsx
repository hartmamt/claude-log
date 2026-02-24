"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CopyButton } from "./CopyButton";
import type { Components } from "react-markdown";

// Parse custom callout and prompt directives from markdown
function preprocessContent(content: string): string {
  // Convert :::callout{type="xxx"} ... ::: to HTML markers
  let processed = content.replace(
    /:::callout\{type="(\w+)"\}\n([\s\S]*?):::/g,
    (_match, type, body) =>
      `<div data-callout="${type}">\n\n${body.trim()}\n\n</div>`
  );

  // Convert :::prompt ... ::: to HTML markers
  processed = processed.replace(
    /:::prompt\n([\s\S]*?):::/g,
    (_match, body) => `<div data-prompt="true">\n\n\`\`\`\n${body.trim()}\n\`\`\`\n\n</div>`
  );

  // Convert :::stat{value="X" label="Y"}::: to inline badges
  processed = processed.replace(
    /:::stat\{value="([^"]+)" label="([^"]+)"\}:::/g,
    (_match, value, label) =>
      `<span data-stat-value="${value}" data-stat-label="${label}"></span>`
  );

  return processed;
}

const components: Components = {
  div: ({ node, ...props }) => {
    const calloutType = (node?.properties?.dataCallout as string) || "";
    const isPrompt = node?.properties?.dataPrompt === "true";

    if (calloutType) {
      return (
        <div className={`callout callout-${calloutType}`} {...props} />
      );
    }
    if (isPrompt) {
      return <div className="prompt-block" {...props} />;
    }
    return <div {...props} />;
  },
  span: ({ node, ...props }) => {
    const statValue = node?.properties?.dataStatValue as string;
    const statLabel = node?.properties?.dataStatLabel as string;
    if (statValue) {
      return (
        <span className="stat-badge">
          <span className="stat-badge-value text-accent">
            {statValue}
          </span>
          <span className="text-text-muted">{statLabel}</span>
        </span>
      );
    }
    return <span {...props} />;
  },
  pre: ({ children, ...props }) => {
    // Extract text content from children for copy button
    let codeText = "";
    const extractText = (child: React.ReactNode): void => {
      if (typeof child === "string") {
        codeText += child;
      } else if (child && typeof child === "object" && "props" in child) {
        const c = child as React.ReactElement<{ children?: React.ReactNode }>;
        if (c.props?.children) {
          if (Array.isArray(c.props.children)) {
            c.props.children.forEach(extractText);
          } else {
            extractText(c.props.children);
          }
        }
      }
    };
    if (Array.isArray(children)) {
      children.forEach(extractText);
    } else {
      extractText(children);
    }

    return (
      <div className="relative group">
        <pre {...props}>{children}</pre>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={codeText.trim()} />
        </div>
      </div>
    );
  },
};

export function PostContent({ content }: { content: string }) {
  const processed = preprocessContent(content);

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        rehypePlugins={[rehypeRaw]}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
