import * as Options from "@effect/cli/Options";
import * as Schema from "@effect/schema/Schema";

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

export const verbose = Options.boolean("verbose").pipe(Options.withAlias("v"));
export const workflow = Options.boolean("workflow").pipe(
  Options.withAlias("w"),
);
