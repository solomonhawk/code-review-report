import type { ReportSummary } from "~/lib/types";

export const summaryFixture = {
  dateRange: [new Date("2024-1-1"), new Date("2024-1-1")],
  dateRangeFormatted: ["start", "end"],
  totalOpenedPrs: 10,
  totalMergedPrs: 10,
  totalReviews: 18,
  mostActiveProject: "most-active-project",
  mostActiveProjectActivity: 5,
  mostActiveUser: "most-active-user",
  mostActiveUserActivity: 3,
  userStats: {
    "user-1": { opened: 1, merged: 2, reviews: 3 },
    "user-2": { opened: 1, merged: 2, reviews: 3 },
  },
  projectStats: {
    "project-1": { opened: 1, merged: 2, reviews: 3 },
    "project-2": { opened: 1, merged: 2, reviews: 3 },
  },
} satisfies ReportSummary;
