import type { Metadata } from "next";
import { WrappedCard } from "@/components/wrapped/WrappedCard";
import { HeroCard } from "./cards/HeroCard";
import { ClockCard } from "./cards/ClockCard";
import { MultiClaudeCard } from "./cards/MultiClaudeCard";
import { LoopCard } from "./cards/LoopCard";
import { GoalsCard } from "./cards/GoalsCard";
import { LanguageCard } from "./cards/LanguageCard";
import { ToolkitCard } from "./cards/ToolkitCard";
import { ErrorsCard } from "./cards/ErrorsCard";
import { PunchlineCard } from "./cards/PunchlineCard";
import { ShareCard } from "./cards/ShareCard";
import wrappedData from "@/data/wrapped-data.json";

export const metadata: Metadata = {
  title: "/wrapped - Your Claude Code Year in Review",
  description:
    "338 sessions. 924 hours. 256 commits. A Spotify Wrapped-style look at how I use Claude Code.",
  openGraph: {
    title: "/wrapped - Claude Code Year in Review",
    description:
      "338 sessions. 924 hours. 256 commits. The numbers behind building with AI.",
    url: "https://slashinsights.codes/wrapped",
    siteName: "/insights",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "/wrapped - Claude Code Year in Review",
    description:
      "338 sessions. 924 hours. 256 commits. The numbers behind building with AI.",
    creator: "@matthew_hartman",
  },
};

export default function WrappedPage() {
  const d = wrappedData;
  return (
    <div className="wrapped-scroll">
      <WrappedCard>
        <HeroCard data={d.hero} />
      </WrappedCard>

      <WrappedCard>
        <ClockCard data={d.clock} />
      </WrappedCard>

      <WrappedCard>
        <MultiClaudeCard data={d.multiClaude} />
      </WrappedCard>

      <WrappedCard>
        <LoopCard data={d.responseTime} />
      </WrappedCard>

      <WrappedCard>
        <GoalsCard data={d.goals} />
      </WrappedCard>

      <WrappedCard>
        <LanguageCard data={d.language} />
      </WrappedCard>

      <WrappedCard>
        <ToolkitCard data={d.toolkit} />
      </WrappedCard>

      <WrappedCard>
        <ErrorsCard data={d.errors} />
      </WrappedCard>

      <WrappedCard>
        <PunchlineCard data={d.punchline} />
      </WrappedCard>

      <WrappedCard>
        <ShareCard dateRange={d.hero.dateRange} />
      </WrappedCard>
    </div>
  );
}
