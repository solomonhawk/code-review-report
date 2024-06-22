import { it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { Formatter } from "~/layers/formatter";
import { withFormatter } from ".";
import { TextFormatter } from "./text";
import { JsonFormatter } from "./json";
import { MarkdownFormatter } from "./markdown";
import { SlackFormatter } from "./slack";

describe("withFormatter", () => {
  it.effect('provides TextFormatter when format is "text"', () =>
    Effect.gen(function* () {
      const formatter = yield* Formatter;
      expect(formatter).toBeInstanceOf(TextFormatter);
    }).pipe(withFormatter("text")),
  );

  it.effect('provides JsonFormatter when format is "json"', () =>
    Effect.gen(function* () {
      const formatter = yield* Formatter;
      expect(formatter).toBeInstanceOf(JsonFormatter);
    }).pipe(withFormatter("json")),
  );

  it.effect('provides MarkdownFormatter when format is "markdown"', () =>
    Effect.gen(function* () {
      const formatter = yield* Formatter;
      expect(formatter).toBeInstanceOf(MarkdownFormatter);
    }).pipe(withFormatter("markdown")),
  );

  it.effect('provides SlackFormatter when format is "slack"', () =>
    Effect.gen(function* () {
      const formatter = yield* Formatter;
      expect(formatter).toBeInstanceOf(SlackFormatter);
    }).pipe(withFormatter("slack")),
  );
});
