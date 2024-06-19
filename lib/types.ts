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
