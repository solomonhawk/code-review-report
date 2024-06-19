import * as Effect from "effect/Effect";

export const program = Effect.gen(function* () {
  yield* Effect.log("log");
  yield* Effect.logDebug("debug");
  yield* Effect.logInfo("info");
  yield* Effect.logWarning("warning");
  yield* Effect.logError("error");
  yield* Effect.logTrace("trace");
  yield* Effect.logFatal("fatal");
});
