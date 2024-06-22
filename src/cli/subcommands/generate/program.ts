import * as Effect from "effect/Effect";
import { isError } from "effect/Predicate";
import { Formatter } from "~/layers/formatter";
import { IO } from "~/layers/io";
import { summary } from "~/test/fixtures/report-summary";
import { type GenerateOpts } from "./options";

export const program = (opts: GenerateOpts) =>
  IO.pipe((io) => {
    return Effect.gen(function* () {
      const formatter = yield* Formatter;

      // fetch data (fire off requests in parallel)

      // aggregate summary

      // format
      const result = yield* formatter.formatString(summary);

      // throw new Error("error");
      // yield* Effect.logDebug("test");
      // output
      yield* io.write(result);
    }).pipe(
      Effect.catchTags({
        IOError: (e) =>
          io.writeError(isError(e) ? e : new Error("Unknown error")),
      }),
      Effect.catchAllDefect((e) => {
        return io.writeError(isError(e) ? e : new Error("Unknown error"));
      }),
    );
  });
