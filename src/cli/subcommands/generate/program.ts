import * as Effect from "effect/Effect";
import { type GenerateOpts } from "./command";
import { ReportSummary } from "~/lib/types";
import { Formatter } from "~/layers/formatter";

export const program = (opts: GenerateOpts) =>
  Effect.gen(function* () {
    // fetch data (fire off requests in parallel)
    const summary = {
      dateRange: [new Date(), new Date()],
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

    const formatter = yield* Formatter;

    const result = formatter.format(summary);

    yield* Effect.logDebug(result);
    // aggregate summary
    // format
    // output
  });
