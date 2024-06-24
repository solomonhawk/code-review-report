import * as Command from "@effect/cli/Command";
import * as Effect from "effect/Effect";
import * as CustomLogger from "~/layers/logger";
import { withFormatter } from "~/lib/format";
import { options } from "./options";
import { program } from "./program";
import { withPublishers } from "~/lib/publish";

/**
 * publish (-c, --channel slack | notion)...
 *         [(-d, --days integer)]
 *         [(-t, --offset integer)]
 *         [(-v, --verbose)]
 */
export const publish = Command.make("publish", options, (opts) => {
  return program(opts).pipe(
    withPublishers(opts.channel),
    withFormatter("slack"),
    CustomLogger.provideVerboseDebugLogLevel(opts.verbose),
    Effect.withSpan("publish program"),
  );
});
