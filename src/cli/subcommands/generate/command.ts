import * as Command from "@effect/cli/Command";
import * as Effect from "effect/Effect";
import * as CustomLogger from "~/layers/logger";
import { withFormatter } from "~/lib/format";
import { withIO } from "~/lib/io";
import { options } from "./options";
import { program } from "./program";

/**
 * generate [(-d, --days integer)]
 *          [(-t, --offset integer)]
 *          [(-o, --output file)]
 *          [(-f, --format text | json | slack | markdown)]
 *          [(-v, --verbose)]
 */
export const generate = Command.make("generate", options, (opts) => {
  return program(opts).pipe(
    Effect.tap(Effect.logDebug(opts)),
    withFormatter(opts.format),
    withIO(opts.output),
    CustomLogger.provideVerboseDebugLogLevel(opts.verbose),
    Effect.withSpan("generate program"),
  );
});
