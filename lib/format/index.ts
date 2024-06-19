import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import { Format } from "~/types";
import { JsonFormatter } from "./json";
import { MarkdownFormatter } from "./markdown";
import { SlackFormatter } from "./slack";
import { TextFormatter } from "./text";

export const withFormatter =
  (format: Format) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) => {
    const formatter = Match.value(format).pipe(
      Match.when("slack", () => SlackFormatter.Live),
      Match.when("text", () => TextFormatter.Live),
      Match.when("markdown", () => MarkdownFormatter.Live),
      Match.when("json", () => JsonFormatter.Live),
      Match.exhaustive,
    );

    return Effect.provide(effect, formatter);
  };
