import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { DefaultIO } from "./default";
import { RunnerIO } from "./runner";
import { makeFileIOLive } from "./file";
import * as Option from "effect/Option";

export const withIO =
  (output?: Option.Option<string>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) => {
    return Effect.gen(function* () {
      const isCi = yield* Config.boolean("CI").pipe(Config.withDefault(false));

      if (isCi) {
        yield* Effect.logDebug("Using Runner IO");
        return yield* Effect.provide(effect, RunnerIO);
      }

      if (output && Option.isSome(output)) {
        const filepath = Option.getOrThrow(output);

        yield* Effect.logDebug(`Using file IO with output: ${filepath}`);
        return yield* Effect.provide(effect, makeFileIOLive(filepath));
      }

      return yield* Effect.provide(effect, DefaultIO);
    });
  };
