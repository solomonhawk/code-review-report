import * as Options from "@effect/cli/Options";
import * as Schema from "@effect/schema/Schema";

export const days = Options.integer("days").pipe(
  Options.withDescription("Number of days to include in the report"),
  Options.withAlias("d"),
  Options.withDefault(7),
  Options.withSchema(Schema.Number.pipe(Schema.positive())),
);

export const offset = Options.integer("offset").pipe(
  Options.withDescription(
    "Number of periods to shift the report by (a period is the number of days in the report, i.e. -d|--days N)",
  ),
  Options.withAlias("t"),
  Options.withDefault(0),
  Options.withSchema(Schema.Number.pipe(Schema.nonNegative())),
);

export const verbose = Options.boolean("verbose").pipe(Options.withAlias("v"));
