import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Console from "effect/Console";
import { IOImpl } from "./types";

export class DefaultIO extends Effect.Tag("IO")<DefaultIO, IOImpl>() {
  static Live = Layer.succeed(DefaultIO, {
    write: (formattedReport: string) => Console.log(formattedReport),
    writeError: (error: Error) => Effect.logError(error.message),
  });
}
