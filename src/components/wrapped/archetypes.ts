import type { WrappedData } from "@/types";

const ARCHETYPES = [
  {
    name: "The Polyglot",
    description:
      "Working across many codebases. A true multi-project operator.",
  },
  {
    name: "The Shipper",
    description:
      "Ship fast, commit often. You turn ideas into production code.",
  },
  {
    name: "The Sprinter",
    description:
      "Rapid-fire micro-sessions. You move fast and iterate faster.",
  },
  {
    name: "The Deep Diver",
    description: "Marathon coding blocks. Deep focus, deep impact.",
  },
  {
    name: "The Builder",
    description:
      "Consistent, steady progress. Building something great, one session at a time.",
  },
] as const;

export type ArchetypeName = (typeof ARCHETYPES)[number]["name"];

export function getCodingArchetype(data: WrappedData): ArchetypeName {
  const avgDuration =
    data.totalSessions > 0 ? data.totalHours / data.totalSessions : 0;
  const commitRatio =
    data.totalSessions > 0 ? data.totalCommits / data.totalSessions : 0;

  if (data.projects.length >= 4) return "The Polyglot";
  if (commitRatio > 1.2) return "The Shipper";
  if (data.totalSessions > 100 && avgDuration < 3) return "The Sprinter";
  if (data.totalSessions < 50 && avgDuration > 6) return "The Deep Diver";
  return "The Builder";
}

export function getArchetypeDescription(name: ArchetypeName): string {
  return ARCHETYPES.find((a) => a.name === name)!.description;
}
