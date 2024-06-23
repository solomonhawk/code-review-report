import { format } from "date-fns";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { ContributorStats } from "~/lib/api/types";
import { ReportSummary, Stats } from "~/lib/types";
import { getMostActiveProject, getMostActiveUser } from "./awards";
import { AggregatorImpl } from "./types";

export class DefaultAggregator extends Effect.Tag("Aggregator")<
  DefaultAggregator,
  AggregatorImpl
>() {
  static Live = Layer.succeed(
    DefaultAggregator,
    DefaultAggregator.of({
      aggregate,
    }),
  );
}

function aggregate(
  statsByUsername: Record<string, ContributorStats>,
  [startDate, endDate]: readonly [Date, Date],
) {
  return Effect.sync(() => {
    let totalOpenedPrs = 0;
    let totalMergedPrs = 0;
    let totalReviews = 0;

    const projectStats: Record<string, Stats> = {};
    const userStats: Record<string, Stats> = Object.fromEntries(
      Object.keys(statsByUsername).map((username) => [
        username,
        {
          opened: 0,
          merged: 0,
          reviews: 0,
        },
      ]),
    );

    for (const stats of Object.values(statsByUsername)) {
      aggregateResults(projectStats, userStats, stats);

      totalOpenedPrs += stats.opened.total_count;
      totalMergedPrs += stats.merged.total_count;
      totalReviews += stats.reviews.total_count;
    }

    const [mostActiveUser, mostActiveUserActivity] =
      getMostActiveUser(userStats);
    const [mostActiveProject, mostActiveProjectActivity] =
      getMostActiveProject(projectStats);

    const start = format(startDate, "MMM d, yyyy");
    const end = format(endDate, "MMM d, yyyy");

    return {
      dateRange: [startDate, endDate],
      dateRangeFormatted: [start, end],
      totalOpenedPrs,
      totalMergedPrs,
      totalReviews,
      mostActiveProject,
      mostActiveProjectActivity,
      mostActiveUser,
      mostActiveUserActivity,
      userStats,
      projectStats,
    } satisfies ReportSummary;
  });
}

export function aggregateResults(
  projectStats: Record<string, Stats>,
  userStats: Record<string, Stats>,
  { username, opened, merged, reviews }: ContributorStats,
) {
  [
    ["opened", opened] as const,
    ["merged", merged] as const,
    ["reviews", reviews] as const,
  ].forEach(([type, results]) => {
    results.items.forEach((item) => {
      const project = repositoryKey(item.repository_url);

      ensureProject(projectStats, project);

      projectStats[project][type]++;
      userStats[username][type]++;
    });
  });

  return {
    userStats,
    projectStats,
  };
}

function ensureProject(projectStats: Record<string, Stats>, project: string) {
  projectStats[project] = projectStats[project] || {
    opened: 0,
    merged: 0,
    reviews: 0,
  };
}

function repositoryKey(url: string) {
  return url.replace("https://api.github.com/repos/", "");
}
