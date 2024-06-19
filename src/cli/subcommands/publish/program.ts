import { Effect } from "effect";

export const program = Effect.gen(function* () {
  yield* Effect.log("log");
  yield* Effect.logDebug("debug");
  yield* Effect.logInfo("info");
  yield* Effect.logWarning("warning");
  yield* Effect.logError("error");
  yield* Effect.logTrace("trace");
  yield* Effect.logFatal("fatal");
});
