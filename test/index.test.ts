import { it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import { cli } from "~/cli";

// @TODO(shawk): more high-level test cases
describe("CLI Options", () => {
  it.effect("should require a subcommand", () => {
    return Effect.gen(function* () {
      yield* Effect.void;
      expect(true).toBe(true);
    });
  });
});
