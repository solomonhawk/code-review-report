import * as core from "@actions/core";
import * as Effect from "effect/Effect";
import { IOImpl } from "./types";
import * as Layer from "effect/Layer";

export class RunnerIO extends Effect.Tag("IO")<RunnerIO, IOImpl>() {
  static Live = Layer.succeed(
    RunnerIO,
    RunnerIO.of({
      write: (formattedReport: string) => Effect.logInfo(formattedReport),
      writeError: (error: Error) =>
        Effect.all([
          Effect.logError(error.message),
          Effect.sync(() => core.setFailed(error.message)),
        ]),
    }),
  );
}
