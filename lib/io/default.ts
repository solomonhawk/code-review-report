import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { IOImpl } from "./types";

export class DefaultIO extends Effect.Tag("IO")<DefaultIO, IOImpl>() {
  static Live = Layer.succeed(
    DefaultIO,
    DefaultIO.of({
      write: (formattedReport: string) => Effect.logInfo(formattedReport),
      writeError: (error: Error) => Effect.logError(error.message),
    }),
  );
}
