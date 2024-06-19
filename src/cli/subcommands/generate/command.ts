import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import { shift, span, verbose } from "~/cli/options";
import { withFormatter } from "~/lib/format";
import * as CustomLogger from "~/logger";
import { formatters } from "~/types";
import { program } from "./program";

export const output = Options.file("output").pipe(
  Options.withDescription("Output file to write the report to"),
  Options.withAlias("o"),
  Options.optional,
);

export const format = Options.choice("format", formatters).pipe(
  Options.withAlias("f"),
  Options.withDescription("Format to report"),
  Options.withDefault("json"),
);

const options = {
  span,
  shift,
  output,
  format,
  verbose,
};

export type GenerateOpts = Command.Command.ParseConfig<typeof options>;

/**
 * generate [(-s, --span integer)]
 *          [(-t, --shift integer)]
 *          [(-o, --output file)]
 *          [--format text | json | slack-blocks | markdown...]
 *          [(-v, --verbose)]
 */
export const generate = Command.make("generate", options, (opts) => {
  console.log(opts);
  return CustomLogger.provideVerboseDebugLogLevel(
    program(opts).pipe(withFormatter(opts.format)),
    opts.verbose,
  );
});
