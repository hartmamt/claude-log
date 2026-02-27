import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="font-mono text-[10px] text-accent font-semibold uppercase tracking-wider mb-4">
        thank you
      </div>
      <h1 className="font-mono text-2xl font-bold text-foreground mb-4">
        Your support means everything.
      </h1>
      <p className="text-text-muted text-sm mb-8">
        Your donation helps keep insights.codes running and ad-free. Every
        dollar goes directly toward hosting and tools.
      </p>
      <Link
        href="/"
        className="text-accent hover:underline text-sm font-mono"
      >
        &larr; back to posts
      </Link>
    </div>
  );
}
