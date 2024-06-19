import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { md } from "mdbox";
import { type FormatterImpl } from "~/lib/format/types";
import { trimMultiline } from "~/lib/helpers";

export class MarkdownFormatter extends Effect.Tag("Formatter")<
  MarkdownFormatter,
  FormatterImpl
>() {
  static Live = Layer.succeed(
    MarkdownFormatter,
    MarkdownFormatter.of({
      format: (report) => {
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
          ${md.heading(`Code Review Activity for ${start} through ${end}`, 1)}
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
            rows: Object.entries(report.projectStats).map(
              ([project, stats]) => [
                project,
                stats.opened.toString(),
                stats.merged.toString(),
                stats.reviews.toString(),
              ],
            ),
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
      },
    }),
  );
}
