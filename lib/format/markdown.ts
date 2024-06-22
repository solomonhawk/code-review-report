import * as Effect from "effect/Effect";
import { md } from "mdbox";
import { NotImplementedError, type FormatterImpl } from "~/lib/format/types";
import { trimMultiline } from "~/lib/helpers";
import { ReportSummary } from "../types";

export class MarkdownFormatter implements FormatterImpl {
  formatString(report: ReportSummary) {
    return Effect.succeed(formatMarkdown(report)).pipe(
      Effect.withSpan("format markdown"),
    );
  }

  formatBlocks(_report: ReportSummary) {
    return new NotImplementedError({
      message: "formatBlocks is not implemented for MarkdownFormatter",
    });
  }
}

function formatMarkdown(report: ReportSummary) {
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

  return trimMultiline(`${md.heading(`Code Review Activity for ${start} through ${end}`, 1)}
    ${md.heading("Summary by user:", 2)}
    ${md.table({
      rows: Object.entries(report.userStats).map(([user, stats]) => [
        user,
        stats.opened.toString(),
        stats.merged.toString(),
        stats.reviews.toString(),
      ]),
      columns: ["User", "PRs Opened", "PRs Merged", "Reviews Given"],
    })}
    ${md.heading("Summary by project:", 2)}
    ${md.table({
      rows: Object.entries(report.projectStats).map(([project, stats]) => [
        project,
        stats.opened.toString(),
        stats.merged.toString(),
        stats.reviews.toString(),
      ]),
      columns: ["Project", "PRs Opened", "PRs Merged", "Reviews Given"],
    })}

    ${md.heading("Aggregates and Accolades:", 2)}
    ${md.table({
      rows: [
        ["👀 PRs opened:", totalOpenedPrs.toString()],
        ["🚀 PRs merged:", totalMergedPrs.toString()],
        ["✅ Reviews given:", totalReviews.toString()],
        [
          "👑 Most Active Project:",
          `${mostActiveProject} (${mostActiveProjectActivity} contributions)`,
        ],
        [
          "🥇 Most Active User:",
          `${mostActiveUser} (${mostActiveUserActivity} contributions)`,
        ],
      ],
      columns: ["Metric", "Value"],
    })}
  `);
}
