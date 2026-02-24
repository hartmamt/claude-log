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

export interface ChangelogEntry {
  date: string;
  label: string;
  stats: { label: string; before: string; after: string }[];
  newContent: string[];
}

export interface WrappedProject {
  name: string;
  sessions: number;
  description: string;
}

export interface WrappedData {
  year: number;
  totalSessions: number;
  totalMessages: number;
  totalHours: number;
  totalCommits: number;
  projects: WrappedProject[];
  topWorkflow: string | null;
  personality: string;
}
