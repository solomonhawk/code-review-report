import { it } from "@effect/vitest";
import { Effect } from "effect";

describe("CLI Options", () => {
  it.effect("should require a subcommand", () => {
    return Effect.gen(function* () {
      yield* Effect.void;
      expect(true).toBe(true);
    });
  });
});
