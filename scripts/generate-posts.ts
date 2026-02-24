import * as fs from "fs";
import * as path from "path";
import type { BlogPost, SiteStats, TimelineEvent } from "../src/types";

interface InsightsData {
  project_areas: {
    areas: { name: string; session_count: number; description: string }[];
  };
  interaction_style: { narrative: string; key_pattern: string };
  what_works: {
    intro: string;
    impressive_workflows: { title: string; description: string }[];
  };
  friction_analysis: {
    intro: string;
    categories: {
      category: string;
      description: string;
      examples: string[];
    }[];
  };
  suggestions: {
    claude_md_additions: { addition: string; why: string }[];
    features_to_try: {
      feature: string;
      one_liner: string;
      why_for_you: string;
      example_code: string;
    }[];
    usage_patterns: {
      title: string;
      suggestion: string;
      detail: string;
      copyable_prompt: string;
    }[];
  };
  on_the_horizon: {
    intro: string;
    opportunities: {
      title: string;
      whats_possible: string;
      how_to_try: string;
      copyable_prompt: string;
    }[];
  };
  fun_ending: { headline: string; detail: string };
  at_a_glance: {
    whats_working: string;
    whats_hindering: string;
    quick_wins: string;
    ambitious_workflows: string;
  };
}

const OUTPUT_DIR = path.join(process.cwd(), "src", "data");
const POSTS_DIR = path.join(OUTPUT_DIR, "posts");
const INSIGHTS_PATH = path.join(OUTPUT_DIR, "insights.json");
const ARCHIVE_DIR = path.join(OUTPUT_DIR, "insights-archive");

// ── Anonymization ────────────────────────────────────────────────────
// Strips product names, client names, and other identifying details.
// Add entries here when /insights surfaces new names you don't want public.

const ANONYMIZE_RULES: [RegExp, string][] = [
  // Product names → generic descriptions
  [/ActionTree/gi, "the platform"],
  [/Anchor Fitness/gi, "a client"],
  [/StreamFit/gi, "a third-party service"],
  // Keep these generic so they read naturally in prose
  [/for ActionTree's/gi, "for the platform's"],
  [/for the platform's agent system/gi, "for the agent system"],
  [/demo scripts for the platform/gi, "demo scripts for the product"],
];

function anonymize(text: string): string {
  let result = text;
  for (const [pattern, replacement] of ANONYMIZE_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ── Voice conversion ─────────────────────────────────────────────────
// /insights writes in second person ("You are…", "Your workflow…").
// Blog posts should read in first person ("I am…", "My workflow…").

function secondToFirstPerson(text: string): string {
  let result = text;

  // Whole-word replacements (case-sensitive for common patterns)
  const replacements: [RegExp, string][] = [
    // "You are" → "I'm" / "I am"
    [/\bYou are\b/g, "I'm"],
    [/\byou are\b/g, "I'm"],
    // "Your" → "My"
    [/\bYour\b/g, "My"],
    [/\byour\b/g, "my"],
    // "yourself" → "myself"
    [/\byourself\b/g, "myself"],
    [/\bYourself\b/g, "Myself"],
    // Object-position "you" → "me" (after prepositions)
    [/\b(forcing|asking|telling|giving|showing|helping|letting|making|costing) you\b/gi, "$1 me"],
    [/\b(for|to|from|with|about|at|by|into|onto|upon) you\b/gi, "$1 me"],
    // Subject-position "You" → "I" (everything else)
    [/\bYou\b/g, "I"],
    [/\byou\b/g, "I"],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

// ── Helpers ──────────────────────────────────────────────────────────

function estimateReadingTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

function extractNumber(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[1] : null;
}

/** Run anonymize + voice conversion on a block of text */
function clean(text: string): string {
  return secondToFirstPerson(anonymize(text));
}

// ── Post generation ──────────────────────────────────────────────────

function generatePosts(data: InsightsData): BlogPost[] {
  const today = new Date().toISOString().split("T")[0];
  const posts: BlogPost[] = [];

  const totalSessions = data.project_areas.areas.reduce(
    (s, a) => s + a.session_count,
    0
  );
  const projectCount = data.project_areas.areas.length;

  const commits =
    extractNumber(data.interaction_style.narrative, /(\d+)\s+commits/) ||
    "256";
  const hours =
    extractNumber(
      data.interaction_style.narrative,
      /(\d[\d,]+)\s+hours?\s+of\s+usage/
    ) || "974";
  const buggyCode =
    extractNumber(
      data.interaction_style.narrative,
      /(\d+)\s+buggy\s*code/i
    ) || "53";
  const wrongApproach =
    extractNumber(
      data.interaction_style.narrative,
      /(\d+)\s+wrong\s*approach/i
    ) || "47";
  const fileTouches =
    extractNumber(
      data.interaction_style.narrative,
      /(\d[\d,]+)\s+file\s+touches/i
    ) || "4,169";

  // -------------------------------------------------------------------
  // Post 1: The definitive "what is it actually like" post
  // Slug: how-i-use-claude-code (STABLE — do not change)
  // -------------------------------------------------------------------
  const narrative = clean(data.interaction_style.narrative);
  const keyPattern = clean(data.interaction_style.key_pattern);

  const post1Content = `
There's a version of this post that just shows you the numbers: ${totalSessions} sessions, ${commits} commits, ${hours} hours, ${projectCount} projects. But numbers don't capture what it actually *feels* like to treat an AI as your primary engineering partner for two months straight.

So here's the honest version.

## The Working Dynamic

${narrative}

:::callout{type="insight"}
**The one-line summary:** ${keyPattern}
:::

## What This Looks Like Day to Day

Most sessions follow the same arc: I describe what I want at a high level, Claude decomposes it into steps, and then we iterate. The good sessions feel like pair programming with someone who types infinitely fast. The bad sessions feel like managing a junior developer who keeps misunderstanding the architecture.

The difference between the two? Specificity. When I say "add a delete button to the user profile with a confirmation modal that calls the existing deleteUser API endpoint," Claude nails it. When I say "improve the settings page," Claude spends 8 minutes reading files and writing plans without producing code.

## The Projects

${data.project_areas.areas
  .map(
    (a) => `### ${anonymize(a.name)}
:::stat{value="${a.session_count}" label="sessions"}:::

${clean(a.description)}`
  )
  .join("\n\n")}

## The Meta-Pattern

After ${totalSessions} sessions, the pattern that matters most isn't any specific technique — it's the *speed of the feedback loop*. The faster you can tell Claude what's wrong and get a correction, the more productive you are. Every workflow optimization I've found boils down to: reduce the time between "that's wrong" and "now it's right."
`.trim();

  posts.push({
    slug: "how-i-use-claude-code",
    title: "What It's Actually Like to Use Claude Code for Everything",
    subtitle: `${totalSessions} sessions, ${commits} commits, ${hours} hours — an honest account of treating AI as an engineering partner`,
    date: today,
    category: "Workflow",
    categoryColor: "cyan",
    icon: "terminal",
    readingTime: estimateReadingTime(post1Content),
    content: post1Content,
    highlights: [
      `${totalSessions} sessions`,
      `${commits} commits`,
      `${fileTouches} file touches`,
    ],
    keyTakeaway:
      "The speed of the feedback loop is everything. Reduce the time between 'that's wrong' and 'now it's right.'",
    stats: [
      { label: "Sessions", value: totalSessions.toString(), color: "green" },
      { label: "Commits", value: commits, color: "amber" },
      { label: "Hours", value: hours, color: "cyan" },
    ],
  });

  // -------------------------------------------------------------------
  // Post 2: The things that actually work well
  // Slug: what-works (STABLE)
  // -------------------------------------------------------------------
  const post2Content = `
${clean(data.what_works.intro)}

But "it works well" isn't very useful advice. What specifically works? What patterns can you steal?

${data.what_works.impressive_workflows
  .map(
    (w) => `## ${w.title}

${clean(w.description)}`
  )
  .join("\n\n")}

## The Pattern Behind the Patterns

Every workflow above shares a common structure: **clear scope, autonomous execution, verification gate, ship.**

The temptation with AI coding tools is to micromanage — describe each function, review each file, approve each change. That's the slow way. The fast way is to describe the *outcome* you want, let Claude figure out the implementation, then verify the result against your actual quality bar (type checks, builds, tests, visual inspection).

:::callout{type="insight"}
**The mental model that works:** Think of Claude as a contractor, not an employee. You don't tell a contractor which nails to use — you describe the finished product and inspect the work.
:::

## What Doesn't Get Talked About Enough

The biggest unlock wasn't any single technique. It was building *trust* over time. After watching Claude successfully implement a complex connector across 12 files and 1,352 lines in a single session, I started scoping much more ambitiously. That compounding trust is the real force multiplier.

The flip side: trust needs to be *calibrated*. Claude will confidently ship code with subtle bugs (more on that in [Where Things Go Wrong](/posts/where-things-go-wrong)). The right balance is high trust on implementation, zero trust on correctness until verified.
`.trim();

  posts.push({
    slug: "what-works",
    title: "The Workflows That Actually Work",
    subtitle:
      "Concrete patterns for shipping features, fixing bugs, and running code reviews with Claude Code",
    date: today,
    category: "Wins",
    categoryColor: "green",
    icon: "rocket",
    readingTime: estimateReadingTime(post2Content),
    content: post2Content,
    highlights: data.what_works.impressive_workflows.map((w) => w.title),
    keyTakeaway:
      "Describe outcomes, not implementations. Let Claude figure out the how, then verify the what.",
    stats: [
      { label: "Commits", value: commits, color: "green" },
      {
        label: "Workflows",
        value: data.what_works.impressive_workflows.length.toString(),
        color: "cyan",
      },
    ],
  });

  // -------------------------------------------------------------------
  // Post 3: Where things go wrong — the honest post
  // Slug: where-things-go-wrong (STABLE)
  // -------------------------------------------------------------------
  const post3Content = `
Every post about AI coding tools tells you how great they are. This one tells you where they break.

After ${totalSessions} sessions, I've accumulated a detailed friction log. Not theoretical concerns — actual things that went wrong, cost time, and sometimes killed entire sessions. Here's the unfiltered version.

${data.friction_analysis.categories
  .map(
    (cat) => `## ${cat.category}

${clean(cat.description)}

:::callout{type="warning"}
**Real examples from my sessions:**
${cat.examples.map((e) => `- ${clean(e)}`).join("\n")}
:::
`
  )
  .join("\n")}

## The Honest Numbers

:::stat{value="${buggyCode}" label="buggy code incidents"}::: :::stat{value="${wrongApproach}" label="wrong approaches"}:::

These aren't edge cases. Across ${totalSessions} sessions and ${commits} commits, roughly 1 in 4 sessions hit meaningful friction. The productive output still far outweighs the cost — but pretending friction doesn't exist makes you worse at managing it.

## What I've Learned About Managing Friction

The single biggest improvement: **make Claude verify its own work before declaring done.** Adding \`npx tsc --noEmit\` after every implementation pass catches the majority of shipped bugs. It's a 5-second check that saves 15-minute debugging cycles.

:::callout{type="insight"}
**The counterintuitive lesson:** The solution to buggy AI code isn't more careful prompting — it's faster verification loops. Don't try to prevent bugs; catch them immediately.
:::

The second biggest improvement: **interrupt early when Claude starts over-planning.** If Claude is reading files and writing plans after 2 minutes without producing code, it's stuck. Kill it, restate the goal more concretely, and tell it to start implementing immediately.
`.trim();

  posts.push({
    slug: "where-things-go-wrong",
    title: "Where Things Go Wrong",
    subtitle: `An honest friction log from ${totalSessions} sessions — buggy code, planning paralysis, and deployment gotchas`,
    date: today,
    category: "Lessons",
    categoryColor: "red",
    icon: "alert",
    readingTime: estimateReadingTime(post3Content),
    content: post3Content,
    highlights: data.friction_analysis.categories.map((c) => c.category),
    keyTakeaway:
      "The solution to buggy AI code isn't more careful prompting — it's faster verification loops.",
    stats: [
      { label: "Buggy Code", value: buggyCode, color: "red" },
      { label: "Wrong Approach", value: wrongApproach, color: "amber" },
      { label: "Sessions", value: totalSessions.toString(), color: "green" },
    ],
  });

  // -------------------------------------------------------------------
  // Post 4: Practical tips — the actionable post
  // Slug: power-user-tips (STABLE)
  // -------------------------------------------------------------------
  const post4Content = `
This is the post I wish I'd read before my first session. No theory, no hype — just the specific things that make Claude Code dramatically more effective.

## The Prompts That Work

${data.suggestions.usage_patterns
  .map(
    (p) => `### ${p.title}

${clean(p.detail)}

:::prompt
${p.copyable_prompt}
:::
`
  )
  .join("\n")}

## Features You're Probably Not Using

${data.suggestions.features_to_try
  .map(
    (f) => `### ${f.feature}

*${f.one_liner}*

${clean(f.why_for_you)}

\`\`\`
${f.example_code}
\`\`\`
`
  )
  .join("\n")}

## CLAUDE.md: The Most Underrated Feature

Your \`CLAUDE.md\` file is loaded at the start of every session. It's the single highest-leverage thing you can configure. Here are the rules I'd add based on ${totalSessions} sessions of friction data:

${data.suggestions.claude_md_additions
  .map(
    (a) => `:::callout{type="tip"}
**Add this rule:** ${a.addition}

**Why it matters:** ${clean(a.why)}
:::`
  )
  .join("\n\n")}

## The One-Minute Setup That Prevents Most Problems

If you only do one thing from this post, do this: add a pre-commit hook that runs your type checker. Most of the bugs Claude ships are type errors that would be caught instantly.

\`\`\`json
// .claude/settings.json
{
  "hooks": {
    "preCommit": {
      "command": "npx tsc --noEmit && npm run build"
    }
  }
}
\`\`\`

This single change would have prevented the majority of my ${buggyCode} buggy code incidents.
`.trim();

  posts.push({
    slug: "power-user-tips",
    title: "Claude Code Power User Guide",
    subtitle: `Battle-tested prompts, CLAUDE.md rules, and workflow tricks from ${totalSessions} sessions`,
    date: today,
    category: "Tips",
    categoryColor: "green",
    icon: "zap",
    readingTime: estimateReadingTime(post4Content),
    content: post4Content,
    highlights: [
      ...data.suggestions.features_to_try.map((f) => f.feature),
      "CLAUDE.md rules",
      "Copyable prompts",
    ],
    keyTakeaway:
      "Add a CLAUDE.md rule: 'start coding immediately, don't over-plan' and a pre-commit hook that runs tsc. These two changes prevent most friction.",
  });

  // -------------------------------------------------------------------
  // Post 5: The fun story — the shareable post
  // Slug: the-story (STABLE)
  // -------------------------------------------------------------------
  const post5Content = `
:::callout{type="story"}
${clean(data.fun_ending.headline)}
:::

${clean(data.fun_ending.detail)}

## Why This Is Actually Revealing

This isn't just a funny anecdote. It captures the central tension of working with AI coding tools at scale: **the same capability that makes them incredibly productive also makes them incredibly frustrating.**

Claude can implement a complete payment integration across server and client code in a single session. It can also burn 8 minutes reading files it's already read, writing a plan nobody asked for, without producing a single line of code. Same model, same session, sometimes minutes apart.

## The Patterns That Emerge After ${totalSessions} Sessions

When you use Claude Code intensely across ${projectCount} projects for ${hours}+ hours, the patterns — both productive and frustrating — become impossible to ignore:

- **Productivity follows a power law.** About 20% of my sessions produce 80% of the shipped code. The best sessions are 10x more productive than average. The worst sessions produce negative value (bugs I have to fix later).

- **Context is everything.** Claude performs dramatically better when it has: a clear goal, specific file paths, known constraints, and a "just do it" instruction. It performs worst with vague requests, open-ended exploration tasks, and multi-objective sessions.

- **The interruption instinct is learned.** I used to wait patiently while Claude explored. Now I interrupt within 2 minutes if I don't see code being written. This single behavioral change improved my success rate more than any prompting technique.

## Lessons From ${hours}+ Hours

- **Trust but verify** — Let Claude run freely, but always validate against your build pipeline
- **Interrupt early** — When Claude starts over-planning, cut it off and redirect
- **Stack tasks intentionally** — Chaining implement → review → fix → deploy works great; stacking 5 unrelated tasks doesn't
- **Front-load constraints** — Tell Claude what NOT to do upfront

:::callout{type="insight"}
**The meta-insight:** The best way to get better at using Claude Code is to use it more, document what happens, and share what you learn. Which is exactly what this site does.
:::
`.trim();

  posts.push({
    slug: "the-story",
    title: `The Best Story From ${hours}+ Hours of AI Coding`,
    subtitle: clean(data.fun_ending.headline),
    date: today,
    category: "Story",
    categoryColor: "cyan",
    icon: "moon",
    readingTime: estimateReadingTime(post5Content),
    content: post5Content,
    highlights: [
      `${totalSessions} sessions analyzed`,
      `${hours}+ hours`,
      "Real patterns",
    ],
    keyTakeaway:
      "The interruption instinct is learned. Don't wait patiently — interrupt within 2 minutes if you don't see code being written.",
  });

  // -------------------------------------------------------------------
  // Post 6: What's coming — the forward-looking post
  // Slug: whats-next (STABLE)
  // -------------------------------------------------------------------
  const post6Content = `
${clean(data.on_the_horizon.intro)}

The workflows I use today would have seemed impossible a year ago. Here's what I think becomes possible in the next year — based not on speculation, but on patterns I'm already seeing work at small scale.

${data.on_the_horizon.opportunities
  .map(
    (o) => `## ${o.title}

${clean(o.whats_possible)}

### How to Start Experimenting

${clean(o.how_to_try)}

:::prompt
${o.copyable_prompt}
:::
`
  )
  .join("\n")}

## The Bigger Picture

Right now, most people use Claude Code for single-task, single-session work: "fix this bug," "add this feature," "write this test." That's like using a spreadsheet as a calculator — technically correct but dramatically underutilizing the tool.

The future is **compound workflows**: chains of autonomous agents that handle entire development lifecycles — from planning through implementation through testing through deployment through monitoring. Not in theory. I've already seen pieces of this work.

:::callout{type="insight"}
**The trajectory:** We're moving from "AI writes code I review" to "AI runs a development pipeline I occasionally steer." The timeline for this transition is shorter than most people think.
:::

The constraint isn't model capability — it's context management. The models can already do the work. The challenge is giving them enough context to do it reliably without human intervention at every step. Solving that is what turns AI coding assistants into AI development teams.
`.trim();

  posts.push({
    slug: "whats-next",
    title: "Where AI Coding Is Actually Heading",
    subtitle:
      "Parallel agents, self-healing deploys, and autonomous development pipelines — based on patterns already working",
    date: today,
    category: "Future",
    categoryColor: "cyan",
    icon: "telescope",
    readingTime: estimateReadingTime(post6Content),
    content: post6Content,
    highlights: data.on_the_horizon.opportunities.map((o) => o.title),
    keyTakeaway:
      "The constraint isn't model capability — it's context management. Solving that turns AI assistants into AI development teams.",
  });

  // -------------------------------------------------------------------
  // Post 7: The projects deep dive
  // Slug: the-projects (STABLE)
  // -------------------------------------------------------------------
  const post7Content = `
Over ${hours}+ hours, I used Claude Code across ${projectCount} distinct project areas. Not toy projects or tutorials — production systems with real users, real integrations, and real deployment pipelines.

Here's what Claude Code handles well, what it struggles with, and what surprised me about each.

${data.project_areas.areas
  .map(
    (area) => `## ${anonymize(area.name)}

:::stat{value="${area.session_count}" label="sessions"}:::

${clean(area.description)}

${
  area.session_count > 30
    ? `:::callout{type="insight"}\nWith ${area.session_count} sessions, this was heavy enough to reveal Claude's real strengths and weaknesses in this domain. The patterns that emerged here informed many of the tips in the [Power User Guide](/posts/power-user-tips).\n:::`
    : area.session_count > 15
      ? `:::callout{type="tip"}\nAt ${area.session_count} sessions, the dominant pattern was rapid iteration — fixing issues as they surfaced rather than trying to prevent them upfront.\n:::`
      : `:::callout{type="tip"}\nEven with only ${area.session_count} sessions, Claude handled the full scope — from initial setup through production deployment.\n:::`
}`
  )
  .join("\n\n---\n\n")}

## Cross-Project Patterns

After working with Claude across all ${projectCount} areas, a few things became clear:

- **TypeScript is Claude's sweet spot.** With ${fileTouches} file touches across the period, TypeScript/React projects had the highest success rate by far. The type system acts as a guardrail that catches Claude's mistakes early.

- **Infrastructure work needs more hand-holding.** Terraform, database migrations, and deployment configs require more explicit instructions. Claude tends to make assumptions about infrastructure that are wrong.

- **Integrations are surprisingly strong.** Payment systems, calendar APIs, OAuth flows, MCP servers — Claude handled these well because the APIs are well-documented and the patterns are clear.
`.trim();

  posts.push({
    slug: "the-projects",
    title: `${projectCount} Projects, ${totalSessions} Sessions: What I Built`,
    subtitle:
      "From SaaS platforms to infrastructure to marketing sites — what Claude handles well and where it struggles",
    date: today,
    category: "Projects",
    categoryColor: "amber",
    icon: "folder",
    readingTime: estimateReadingTime(post7Content),
    content: post7Content,
    highlights: data.project_areas.areas.map(
      (a) =>
        `${anonymize(a.name).split(" ")[0]} (${a.session_count})`
    ),
    keyTakeaway:
      "TypeScript is Claude's sweet spot. The type system acts as a guardrail that catches mistakes early. Infrastructure work needs more hand-holding.",
    stats: [
      { label: "Projects", value: projectCount.toString(), color: "amber" },
      {
        label: "Sessions",
        value: totalSessions.toString(),
        color: "green",
      },
      { label: "File Touches", value: fileTouches, color: "cyan" },
    ],
  });

  return posts;
}

// ── Timeline generation ──────────────────────────────────────────────
// Smart timeline: reads existing timeline.json, auto-generates new events
// from insights data, merges (deduplicating by title), and preserves
// any manually-added entries.

const TIMELINE_PATH = path.join(OUTPUT_DIR, "timeline.json");

type TimelineEventItem = {
  title: string;
  description: string;
  type: "milestone" | "win" | "friction" | "insight";
};

function loadExistingTimeline(): TimelineEvent[] {
  if (!fs.existsSync(TIMELINE_PATH)) return [];
  const raw = fs.readFileSync(TIMELINE_PATH, "utf-8");
  return JSON.parse(raw);
}

/** Extract timeline events from insights data */
function extractEventsFromInsights(data: InsightsData): TimelineEventItem[] {
  const events: TimelineEventItem[] = [];

  // Project areas → milestones
  for (const area of data.project_areas.areas) {
    events.push({
      title: `${area.session_count} sessions: ${anonymize(area.name)}`,
      description: clean(area.description).slice(0, 120),
      type: "milestone",
    });
  }

  // Impressive workflows → wins
  for (const w of data.what_works.impressive_workflows) {
    events.push({
      title: w.title,
      description: clean(w.description).slice(0, 150),
      type: "win",
    });
  }

  // Friction categories → friction events (one per category)
  for (const cat of data.friction_analysis.categories) {
    events.push({
      title: cat.category,
      description: clean(cat.description).slice(0, 150),
      type: "friction",
    });
  }

  // Key pattern → insight
  if (data.interaction_style.key_pattern) {
    events.push({
      title: "Key pattern identified",
      description: clean(data.interaction_style.key_pattern),
      type: "insight",
    });
  }

  // Fun ending → insight
  if (data.fun_ending.headline) {
    const headline = clean(data.fun_ending.headline);
    events.push({
      title: headline.length > 80 ? headline.slice(0, 77) + "..." : headline,
      description: clean(data.fun_ending.detail).slice(0, 150),
      type: "insight",
    });
  }

  return events;
}

/** Deduplicate events by title (first 40 chars, lowercased) */
function dedupeEvents(events: TimelineEventItem[]): TimelineEventItem[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    const key = e.title.toLowerCase().slice(0, 40).trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generateTimeline(data: InsightsData): TimelineEvent[] {
  const existing = loadExistingTimeline();
  const today = new Date().toISOString().split("T")[0];

  const totalSessions = data.project_areas.areas.reduce(
    (s, a) => s + a.session_count,
    0
  );
  const commits =
    extractNumber(data.interaction_style.narrative, /(\d+)\s+commits/) ||
    "256";

  // Collect all existing event titles for dedup
  const existingTitles = new Set<string>();
  for (const day of existing) {
    for (const event of day.events) {
      existingTitles.add(event.title.toLowerCase().slice(0, 40).trim());
    }
  }

  // Auto-generate events from insights
  const autoEvents = extractEventsFromInsights(data);

  // Filter to only genuinely new events
  const newEvents = autoEvents.filter(
    (e) => !existingTitles.has(e.title.toLowerCase().slice(0, 40).trim())
  );

  // Always generate a summary event with current stats
  // Update the stats event in the last existing period if it exists
  const statsTitle = `${commits} commits shipped`;
  const statsEvent: TimelineEventItem = {
    title: statsTitle,
    description: `${totalSessions} sessions, ${data.project_areas.areas.length} project areas — building with Claude Code`,
    type: "win",
  };

  // Remove any old "X commits shipped" events from existing timeline
  for (const day of existing) {
    day.events = day.events.filter(
      (e) => !e.title.match(/^\d+ commits shipped$/)
    );
  }

  if (newEvents.length === 0) {
    // No new events — just update stats in the last period
    if (existing.length > 0) {
      existing[existing.length - 1].events.push(statsEvent);
    }
    console.log(`  Timeline: no new events, updated stats`);
    return existing;
  }

  // Add new events as a new dated period
  const newPeriod: TimelineEvent = {
    day: today,
    label: `Update — ${newEvents.length} new events`,
    events: dedupeEvents([...newEvents, statsEvent]),
  };

  console.log(
    `  Timeline: ${newEvents.length} new events added for ${today}`
  );

  return [...existing, newPeriod];
}

// ── Archive & Merge ──────────────────────────────────────────────────
// Each /insights run is archived by date. The generator merges content
// across all runs so posts get richer over time:
//   - Numbers/stats: always from the latest run (most accurate)
//   - Workflows, examples, stories: accumulated across all runs
//   - Duplicates: removed by comparing first 60 chars (lowercased)

function archiveInsights(): void {
  if (!fs.existsSync(INSIGHTS_PATH)) return;
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

  const date = new Date().toISOString().split("T")[0];
  const archivePath = path.join(ARCHIVE_DIR, `${date}.json`);

  // Don't overwrite if we already archived today
  if (!fs.existsSync(archivePath)) {
    fs.copyFileSync(INSIGHTS_PATH, archivePath);
    console.log(`  Archived insights → ${date}.json`);
  }
}

function loadAllInsights(): InsightsData[] {
  const all: InsightsData[] = [];
  if (fs.existsSync(ARCHIVE_DIR)) {
    const files = fs.readdirSync(ARCHIVE_DIR).sort(); // chronological
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = fs.readFileSync(path.join(ARCHIVE_DIR, file), "utf-8");
      all.push(JSON.parse(raw));
    }
  }
  return all;
}

/** Deduplicate strings by comparing first N chars (lowercased) */
function dedupeStrings(items: string[], prefixLen = 60): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLowerCase().slice(0, prefixLen).trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Merge multiple insights runs. Latest run wins for stats/narrative,
 *  all runs contribute examples/workflows/stories. */
function mergeInsights(runs: InsightsData[]): InsightsData {
  if (runs.length === 0) throw new Error("No insights data to merge");
  if (runs.length === 1) return runs[0];

  const latest = runs[runs.length - 1];

  // Accumulate impressive_workflows across runs (dedupe by title)
  const seenWorkflows = new Set<string>();
  const allWorkflows: { title: string; description: string }[] = [];
  // Process latest first so its descriptions take priority
  for (const run of [...runs].reverse()) {
    for (const w of run.what_works.impressive_workflows) {
      if (!seenWorkflows.has(w.title.toLowerCase())) {
        seenWorkflows.add(w.title.toLowerCase());
        allWorkflows.push(w);
      }
    }
  }

  // Accumulate friction examples across runs (dedupe categories, merge examples)
  const frictionMap = new Map<
    string,
    { category: string; description: string; examples: string[] }
  >();
  for (const run of runs) {
    for (const cat of run.friction_analysis.categories) {
      const key = cat.category.toLowerCase();
      if (frictionMap.has(key)) {
        const existing = frictionMap.get(key)!;
        existing.examples.push(...cat.examples);
        // Use latest description
        existing.description = cat.description;
      } else {
        frictionMap.set(key, {
          category: cat.category,
          description: cat.description,
          examples: [...cat.examples],
        });
      }
    }
  }
  // Deduplicate examples within each category
  const mergedFriction = [...frictionMap.values()].map((cat) => ({
    ...cat,
    examples: dedupeStrings(cat.examples),
  }));

  // Accumulate usage_patterns (dedupe by title)
  const seenPatterns = new Set<string>();
  const allPatterns: typeof latest.suggestions.usage_patterns = [];
  for (const run of [...runs].reverse()) {
    for (const p of run.suggestions.usage_patterns) {
      if (!seenPatterns.has(p.title.toLowerCase())) {
        seenPatterns.add(p.title.toLowerCase());
        allPatterns.push(p);
      }
    }
  }

  // Accumulate features_to_try (dedupe by feature name)
  const seenFeatures = new Set<string>();
  const allFeatures: typeof latest.suggestions.features_to_try = [];
  for (const run of [...runs].reverse()) {
    for (const f of run.suggestions.features_to_try) {
      if (!seenFeatures.has(f.feature.toLowerCase())) {
        seenFeatures.add(f.feature.toLowerCase());
        allFeatures.push(f);
      }
    }
  }

  // Accumulate claude_md_additions (dedupe by first 60 chars of addition)
  const allAdditions = dedupeStrings(
    runs.flatMap((r) => r.suggestions.claude_md_additions.map((a) => a.addition)),
  ).map((addition) => {
    // Find the matching full object from any run
    for (const run of [...runs].reverse()) {
      const found = run.suggestions.claude_md_additions.find((a) => a.addition === addition);
      if (found) return found;
    }
    return { addition, why: "" };
  });

  // Accumulate on_the_horizon opportunities (dedupe by title)
  const seenOpps = new Set<string>();
  const allOpps: typeof latest.on_the_horizon.opportunities = [];
  for (const run of [...runs].reverse()) {
    for (const o of run.on_the_horizon.opportunities) {
      if (!seenOpps.has(o.title.toLowerCase())) {
        seenOpps.add(o.title.toLowerCase());
        allOpps.push(o);
      }
    }
  }

  // Pick the fun_ending with the most detail (longest)
  const bestFunEnding = runs.reduce((best, run) =>
    run.fun_ending.detail.length > best.fun_ending.detail.length
      ? run
      : best
  ).fun_ending;

  return {
    // Latest wins for stats and narrative
    project_areas: latest.project_areas,
    interaction_style: latest.interaction_style,
    at_a_glance: latest.at_a_glance,

    // Accumulated content
    what_works: {
      intro: latest.what_works.intro,
      impressive_workflows: allWorkflows,
    },
    friction_analysis: {
      intro: latest.friction_analysis.intro,
      categories: mergedFriction,
    },
    suggestions: {
      claude_md_additions: allAdditions,
      features_to_try: allFeatures,
      usage_patterns: allPatterns,
    },
    on_the_horizon: {
      intro: latest.on_the_horizon.intro,
      opportunities: allOpps,
    },
    fun_ending: bestFunEnding,
  };
}

// ── Main ─────────────────────────────────────────────────────────────

function main() {
  console.log("Generating blog posts from insights data...\n");

  if (!fs.existsSync(INSIGHTS_PATH)) {
    console.error(`No insights.json found at ${INSIGHTS_PATH}`);
    process.exit(1);
  }

  // Archive current insights before processing
  archiveInsights();

  // Load all archived runs and merge
  const allRuns = loadAllInsights();
  console.log(`  Found ${allRuns.length} archived insights run(s)`);

  const data = mergeInsights(allRuns);
  console.log(
    `  Merged: ${data.what_works.impressive_workflows.length} workflows, ` +
      `${data.friction_analysis.categories.reduce((s, c) => s + c.examples.length, 0)} friction examples, ` +
      `${data.suggestions.usage_patterns.length} usage patterns\n`
  );

  const posts = generatePosts(data);
  const timeline = generateTimeline(data);

  fs.mkdirSync(POSTS_DIR, { recursive: true });

  for (const post of posts) {
    fs.writeFileSync(
      path.join(POSTS_DIR, `${post.slug}.json`),
      JSON.stringify(post, null, 2)
    );
  }

  const index = posts.map(({ content: _, ...meta }) => meta);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "posts-index.json"),
    JSON.stringify(index, null, 2)
  );

  const totalSessions = data.project_areas.areas.reduce(
    (sum, a) => sum + a.session_count,
    0
  );
  const commits =
    extractNumber(data.interaction_style.narrative, /(\d+)\s+commits/) ||
    "256";
  const hours =
    extractNumber(
      data.interaction_style.narrative,
      /(\d[\d,]+)\s+hours?\s+of\s+usage/
    ) || "974";
  const messages =
    extractNumber(
      data.interaction_style.narrative,
      /(\d[\d,]+)\s+messages/
    ) || "3084";

  const stats: SiteStats = {
    totalSessions,
    totalMessages: parseInt(messages.replace(/,/g, "")),
    totalHours: parseInt(hours.replace(/,/g, "")),
    totalCommits: parseInt(commits.replace(/,/g, "")),
    dateRange: "Dec 31 – Feb 24",
    projectCount: data.project_areas.areas.length,
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "site-stats.json"),
    JSON.stringify(stats, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "timeline.json"),
    JSON.stringify(timeline, null, 2)
  );

  console.log(`Generated ${posts.length} blog posts + timeline`);
  for (const post of posts) {
    console.log(`  - ${post.slug}: "${post.title}" (${post.readingTime})`);
  }

  // Verify no sensitive names leaked
  const allContent = posts.map((p) => p.content).join("\n") + "\n" + JSON.stringify(timeline);
  const leaks = ANONYMIZE_RULES.filter(([pattern]) => pattern.test(allContent));
  if (leaks.length > 0) {
    console.warn("\n⚠️  WARNING: Sensitive names still present in output:");
    for (const [pattern] of leaks) {
      console.warn(`   - Pattern: ${pattern}`);
    }
  } else {
    console.log("✓ No sensitive names detected in output");
  }
}

main();
