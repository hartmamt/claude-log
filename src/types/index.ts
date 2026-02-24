export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  categoryColor: string;
  icon: string;
  readingTime: string;
  content: string;
  highlights?: string[];
  keyTakeaway?: string;
  stats?: { label: string; value: string; color: string }[];
}

export interface SiteStats {
  totalSessions: number;
  totalMessages: number;
  totalHours: number;
  totalCommits: number;
  dateRange: string;
  projectCount: number;
}

export interface TimelineEvent {
  day: string;
  label: string;
  events: {
    title: string;
    description: string;
    type: "milestone" | "win" | "friction" | "insight";
  }[];
}
