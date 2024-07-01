import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";

import { Aggregator } from "~/layers/aggregator";
import { ContributorsList } from "~/layers/contributors-list";
import { IO } from "~/layers/io";
import { Publisher } from "~/layers/publisher";
import { Api } from "~/lib/api";
import { dateRange } from "~/lib/helpers/date";
import type { PublishOpts } from "./options";

export const program = (opts: PublishOpts) =>
  Effect.gen(function* () {
    yield* Effect.logDebug(opts);

    const { usernames } = yield* ContributorsList;
    const dr = dateRange(opts.days, opts.offset);

    const stats = yield* Api.getContributorStats(usernames, dr);
    const summary = yield* Aggregator.aggregate(stats, dr);

    yield* Publisher.publishAll(summary);
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
