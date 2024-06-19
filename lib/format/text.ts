import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type FormatterImpl } from "~/lib/format/types";
import { trimMultiline } from "~/lib/helpers";

export class TextFormatter extends Effect.Tag("Formatter")<
  TextFormatter,
  FormatterImpl
>() {
  static Live = Layer.succeed(
    TextFormatter,
    TextFormatter.of({
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
      },
    }),
  );
}
