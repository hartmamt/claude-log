import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-surface sticky top-0 z-50 backdrop-blur-sm bg-opacity-80">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <span className="font-mono text-accent font-bold text-base tracking-tight">
            /insights
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-text-muted hover:text-foreground transition-colors"
          >
            posts
          </Link>
          <Link
            href="/wrapped"
            className="text-secondary hover:text-foreground transition-colors font-semibold"
          >
            wrapped
          </Link>
          <Link
            href="/changelog"
            className="text-text-muted hover:text-foreground transition-colors"
          >
            changelog
          </Link>
          <Link
            href="/about"
            className="text-text-muted hover:text-foreground transition-colors"
          >
            about
          </Link>
        </nav>
      </div>
    </header>
  );
}
