import * as Effect from "effect/Effect";
import * as Data from "effect/Data";

class TestError extends Data.TaggedError("TestError")<{ message: string }> {}

export const program = Effect.gen(function* () {
  yield* new TestError({ message: "test error" });
  yield* Effect.log("log");
  yield* Effect.logDebug("debug");
  yield* Effect.logInfo("info");
  yield* Effect.logWarning("warning");
  yield* Effect.logError("error");
  yield* Effect.logTrace("trace");
  yield* Effect.logFatal("fatal");
});
