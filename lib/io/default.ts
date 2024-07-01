import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Console from "effect/Console";
import { IO } from "~/layers/io";

export const DefaultIO = Layer.succeed(IO, {
  write: (formattedReport: string) => Console.log(formattedReport),
  writeError: (error: Error) => Effect.logError(error.message),
});
