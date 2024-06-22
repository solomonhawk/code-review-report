import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import { days, offset, verbose } from "~/cli/options";
import { formatters } from "~/lib/types";

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

export const options = {
  days,
  offset,
  output,
  format,
  verbose,
};

export type GenerateOpts = Command.Command.ParseConfig<typeof options>;
