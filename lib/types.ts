export type Stats = {
  opened: number;
  merged: number;
  reviews: number;
};

export type ReportSummary = {
  dateRange: readonly [Date, Date];
  dateRangeFormatted: readonly [string, string];
  totalOpenedPrs: number;
  totalMergedPrs: number;
  totalReviews: number;
  mostActiveProject: string;
  mostActiveProjectActivity: number;
  mostActiveUser: string;
  mostActiveUserActivity: number;
  userStats: Record<string, Stats>;
  projectStats: Record<string, Stats>;
};

export const formatters = ["text", "json", "slack", "markdown"] as const;

export type Format = (typeof formatters)[number];

export const channels = ["slack", "notion"] as const;

export type Channel = (typeof channels)[number];
