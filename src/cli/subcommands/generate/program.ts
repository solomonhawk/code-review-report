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
    const { usernames } = yield* ContributorsList;
    const dr = dateRange(opts.days, opts.offset);

    const stats = yield* Api.getContributorStats(usernames, dr);
    const summary = yield* Aggregator.aggregate(stats, dr);
    const result = yield* Formatter.formatString(summary);

    yield* IO.write(result);
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
