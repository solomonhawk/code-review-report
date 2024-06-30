import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Cause from "effect/Cause";

import { Aggregator } from "~/layers/aggregator";
import { ContributorsList } from "~/layers/contributors-list";
import { Formatter } from "~/layers/formatter";
import { IO } from "~/layers/io";
import { Api } from "~/lib/api";
import { dateRange } from "~/lib/helpers/date";
import { type GenerateOpts } from "./options";

export const program = (opts: GenerateOpts) =>
  Effect.gen(function* () {
    const io = yield* IO;
    const api = yield* Api;
    const formatter = yield* Formatter;
    const aggregator = yield* Aggregator;
    const { usernames } = yield* ContributorsList;
    const dr = dateRange(opts.days, opts.offset);

    // fetch data
    const stats = yield* api.getContributorStats(usernames, dr);

    // aggregate summary
    const summary = yield* aggregator.aggregate(stats, dr);

    // format
    const result = yield* formatter.formatString(summary);

    // output
    yield* io.write(result);
  }).pipe(
    Effect.tapError((e) => IO.writeError(e)),
    Effect.catchAllDefect((defect) => {
      if (Predicate.isError(defect)) {
        return IO.writeError(defect);
      }

      if (Cause.isRuntimeException(defect)) {
        return IO.writeError(defect);
      }

      return IO.writeError(new Error("An unknown defect occurred"));
    }),
  );
