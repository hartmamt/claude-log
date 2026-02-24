import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - /insights",
  description: "About Matt Hartman and this site",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Breadcrumb */}
      <div className="text-sm text-text-muted">
        <Link href="/" className="hover:text-foreground transition-colors">
          posts
        </Link>
        <span className="mx-2 text-border-light">/</span>
        <span className="text-foreground">about</span>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Matt Hartman
        </h1>
        <p className="text-accent font-mono text-sm">
          Director of Intelligent Systems &amp; Integration
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-6 text-[15px] leading-relaxed">
        <p>
          I'm a builder with 20+ years in enterprise architecture, systems
          integration, and product leadership. Currently leading digital
          transformation at Monti Inc. &mdash; architecting GenAI, IoT, and
          data-driven automation across manufacturing and enterprise systems.
        </p>

        <p>
          Before that, I spent 5+ years at Procter &amp; Gamble as a Senior
          Technical Product Manager and Platform Engineer, where I led the
          Consumer Connected Devices Platform serving millions of users
          globally. I built and managed a high-availability serverless IoT
          platform on AWS using Go, Vue.js, and Terraform.
        </p>

        <p>
          Before P&amp;G, I spent 17 years at the University of Cincinnati
          working my way from systems administrator to IT Solutions Architect
          &mdash; designing enterprise architecture, leading development teams,
          and building complex integration solutions across the university's
          systems.
        </p>

        {/* What this site is */}
        <div className="border-t border-border pt-6 space-y-4">
          <h2 className="font-mono text-lg font-semibold text-foreground">
            About This Site
          </h2>
          <p>
            This is a dev log generated entirely from Claude Code's{" "}
            <code className="font-mono text-accent text-sm">/insights</code>{" "}
            command. Every post, stat, and changelog entry is auto-generated
            from real session data &mdash; anonymized, converted to first
            person, and published as a static Next.js site.
          </p>
          <p>
            It's an experiment in building in public with AI. The site itself
            was built with Claude Code. The content comes from using Claude Code.
            It updates itself when I run{" "}
            <code className="font-mono text-accent text-sm">/update-site</code>.
          </p>
        </div>

        {/* Career highlights as compact badges */}
        <div className="border-t border-border pt-6 space-y-4">
          <h2 className="font-mono text-lg font-semibold text-foreground">
            Background
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-mono text-accent text-xs mt-1 shrink-0">2026&ndash;</span>
              <div>
                <div className="text-foreground font-semibold text-sm">Director of Intelligent Systems</div>
                <div className="text-text-muted text-sm">Monti, Inc. &mdash; GenAI, IoT, smart manufacturing</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-accent text-xs mt-1 shrink-0">2020&ndash;26</span>
              <div>
                <div className="text-foreground font-semibold text-sm">Sr. Technical Product Manager &amp; Platform Engineer</div>
                <div className="text-text-muted text-sm">Procter &amp; Gamble &mdash; IoT platform, Go, Terraform, millions of users</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-accent text-xs mt-1 shrink-0">2003&ndash;20</span>
              <div>
                <div className="text-foreground font-semibold text-sm">Solutions Architect &rarr; Asst. Director IT</div>
                <div className="text-text-muted text-sm">University of Cincinnati &mdash; enterprise architecture, integration, ERP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="border-t border-border pt-6 space-y-3">
          <h2 className="font-mono text-lg font-semibold text-foreground">
            Education
          </h2>
          <div className="text-sm text-text-muted space-y-1">
            <div>MS Information Systems &mdash; University of Cincinnati</div>
            <div>BA Information Systems &mdash; Olivet Nazarene University</div>
          </div>
        </div>

        {/* Links */}
        <div className="border-t border-border pt-6">
          <a
            href="https://www.linkedin.com/in/matthewhartman"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary text-sm hover:underline"
          >
            LinkedIn &rarr;
          </a>
        </div>
      </div>

      {/* Back link */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="text-secondary text-sm hover:underline"
        >
          &larr; back to posts
        </Link>
      </div>
    </div>
  );
}
