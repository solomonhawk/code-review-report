import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Predicate from "effect/Predicate";
import fs from "node:fs";
import path from "node:path";

import { IOError, IOImpl } from "./types";

export class FileIO extends Effect.Tag("IO")<FileIO, IOImpl>() {
  static makeLive = (output: string) =>
    Layer.succeed(
      FileIO,
      FileIO.of({
        write: (formattedReport: string) =>
          Effect.tryPromise({
            try: async () => {
              const pathDirectory = path.resolve(
                process.cwd(),
                path.dirname(output),
              );
              await fs.promises.mkdir(pathDirectory, { recursive: true });
              await fs.promises.writeFile(output, formattedReport);
            },
            catch: (e) =>
              new IOError({
                message: Predicate.isError(e)
                  ? e.message
                  : "Unknown FileIO error",
              }),
          }),
        writeError: (error: Error) => Effect.logError(error.message),
      }),
    );
}
