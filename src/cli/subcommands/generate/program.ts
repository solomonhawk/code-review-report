import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";

import { Aggregator } from "~/layers/aggregator";
import { ContributorsList } from "~/layers/contributors-list";
import { Formatter } from "~/layers/formatter";
import { IO } from "~/layers/io";
import { Api } from "~/lib/api";
import { dateRange } from "~/lib/helpers/date";
import { type GenerateOpts } from "./options";

export const program = (opts: GenerateOpts) =>
  IO.pipe((io) => {
    return Effect.gen(function* () {
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
    });
    // .pipe(
    //   // @TODO(shawk): does this belong here? does it work if moved elsewhere?
    //   Effect.catchTags({
    //     IOError: (e) =>
    //       io.writeError(Predicate.isError(e) ? e : new Error("Unknown error")),
    //   }),
    //   Effect.catchAllDefect((e) => {
    //     return io.writeError(
    //       Predicate.isError(e) ? e : new Error("Unknown error"),
    //     );
    //   }),
    // );
  });
