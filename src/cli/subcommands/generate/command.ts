import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import { shift, span, verbose } from "~/cli/options";
import * as CustomLogger from "~/logger";
import { formatters } from "~/types";
import { program } from "./program";

export const output = Options.file("output").pipe(
  Options.withDescription("Output file to write the report to"),
  Options.withAlias("o"),
  Options.optional,
);

export const format = Options.choice("format", formatters).pipe(
  Options.withDescription("Format to report"),
  Options.withDefault("json"),
);

/**
 * generate [(-s, --span integer)]
 *          [(-t, --shift integer)]
 *          [(-o, --output file)]
 *          [--format text | json | slack-blocks | markdown...]
 *          [(-v, --verbose)]
 */
export const generate = Command.make(
  "generate",
  {
    span,
    shift,
    output,
    format,
    verbose,
  },
  (opts) => {
    return CustomLogger.provideVerboseDebugLogLevel(program, opts.verbose);
  },
);
