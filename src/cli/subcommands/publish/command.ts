import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import { shift, span, verbose, workflow } from "~/cli/options";
import * as CustomLogger from "~/logger";
import { program } from "./program";

export const channel = Options.choice("channel", ["slack", "notion"]).pipe(
  Options.withDescription("Where to publish"),
  Options.repeated,
);

/**
 * publish --channel slack | notion...
 *         [(-s, --span integer)]
 *         [(-t, --shift integer)]
 *         [(-v, --verbose)]
 */
export const publish = Command.make(
  "publish",
  { span, shift, channel, verbose, workflow },
  (opts) => {
    console.log(opts);
    return CustomLogger.provideVerboseDebugLogLevel(program, opts.verbose);
  },
);
