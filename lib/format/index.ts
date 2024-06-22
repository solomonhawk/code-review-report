import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import { Format } from "~/lib/types";
import { JsonFormatter } from "./json";
import { MarkdownFormatter } from "./markdown";
import { SlackFormatter } from "./slack";
import { TextFormatter } from "./text";
import { createConsola, LogLevels } from "consola";
import { Formatter } from "~/layers/formatter";

export const makeConsola = () =>
  createConsola({
    level: LogLevels["verbose"],
    formatOptions: {
      date: false,
    },
  });

export const withFormatter =
  (format: Format) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) => {
    const formatter = Match.value(format).pipe(
      Match.when("slack", () => new SlackFormatter()),
      Match.when("text", () => new TextFormatter()),
      Match.when("markdown", () => new MarkdownFormatter()),
      Match.when("json", () => new JsonFormatter()),
      Match.exhaustive,
    );

    return Effect.provideService(effect, Formatter, formatter);
  };
