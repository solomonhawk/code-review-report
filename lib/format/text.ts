import * as Effect from "effect/Effect";
import { NotImplementedError, type FormatterImpl } from "~/lib/format/types";
import { trimMultiline } from "~/lib/helpers";
import { ReportSummary } from "../types";

export class TextFormatter implements FormatterImpl {
  formatString(report: ReportSummary) {
    return Effect.succeed(formatText(report)).pipe(
      Effect.withSpan("format text"),
    );
  }

  formatBlocks(_report: ReportSummary) {
    return new NotImplementedError({
      message: "formatBlocks is not implemented for TextFormatter",
    });
  }
}

function formatText(report: ReportSummary) {
  const {
    dateRangeFormatted: [start, end],
    totalOpenedPrs,
    totalMergedPrs,
    totalReviews,
    mostActiveProject,
    mostActiveProjectActivity,
    mostActiveUser,
    mostActiveUserActivity,
  } = report;

  return trimMultiline(`
    Code Review Activity for ${start} through ${end}

    Summary by user:
    ${Object.entries(report.userStats)
      .map(([user, stats]) => {
        return `${user}: PRs opened: ${stats.opened}, PRs merged: ${stats.merged}, Reviews given: ${stats.reviews}`;
      })
      .join("\n")}

    Summary by project:
    ${Object.entries(report.projectStats)
      .map(([project, stats]) => {
        return `${project}: PRs opened: ${stats.opened}, PRs merged: ${stats.merged}, Reviews given: ${stats.reviews}`;
      })
      .join("\n")}

    👀 Total PRs opened: ${totalOpenedPrs}
    🚀 Total PRs merged: ${totalMergedPrs}
    ✅ Code Reviews given: ${totalReviews}

    👑 Most Active Project: ${mostActiveProject} with ${mostActiveProjectActivity} contributions
    🥇 Most Active User: ${mostActiveUser} with ${mostActiveUserActivity} contributions
  `);
}
