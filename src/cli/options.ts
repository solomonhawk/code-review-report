import { Options } from "@effect/cli";
import { Schema } from "@effect/schema";
import { formatters } from "~/types";

/**
 * $ cli generate-report [-s | --span <days>] [-t | --shift <weeks ago>] [-o | --output <file>] [-f | --format <format>]
 * $ cli publish-report [-d <days>] [-w <weeks ago>] [-c <channel>]
 */
export const span = Options.integer("span").pipe(
  Options.withDescription("Number of days to include in the report"),
  Options.withAlias("s"),
  Options.withDefault(7),
  Options.withSchema(Schema.Number.pipe(Schema.positive())),
);

export const shift = Options.integer("shift").pipe(
  Options.withDescription(
    "Number of spans to shift the report by (a span is the number of days in the report)",
  ),
  Options.withAlias("t"),
  Options.withDefault(0),
  Options.withSchema(Schema.Number.pipe(Schema.nonNegative())),
);

export const output = Options.file("output").pipe(
  Options.withDescription("Output file to write the report to"),
  Options.withAlias("o"),
  Options.optional,
);

export const format = Options.choice("format", formatters).pipe(
  Options.withDescription("Format to report"),
  Options.atLeast(1),
  Options.withDefault("json"),
);

export const verbose = Options.boolean("verbose").pipe(Options.withAlias("v"));
