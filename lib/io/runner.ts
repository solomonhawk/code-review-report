import * as core from "@actions/core";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { IO } from "~/layers/io";

export const RunnerIO = Layer.succeed(IO, {
  write: (formattedReport: string) => Effect.logInfo(formattedReport),
  writeError: (error: Error) =>
    Effect.all([
      Effect.logError(error.message),
      Effect.sync(() => core.setFailed(error.message)),
    ]),
});
