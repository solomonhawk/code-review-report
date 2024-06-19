import * as Effect from "effect/Effect";
import * as Config from "effect/Config";
import * as Runner from "./runner";

export const tapError = <A, E, R>(effect: Effect.Effect<A, E, R>) => {
  return Effect.tapError(effect, (e) => {
    return Effect.gen(function* () {
      // @TODO(shawk): move to catch* below?
      yield* Effect.logError(e);

      const isCI = yield* Config.boolean("CI");

      if (isCI) {
        // @TODO(shawk): extract error message from failure
        yield* Runner.setFailed("Failed to run command");
      }
    });
  });
};
