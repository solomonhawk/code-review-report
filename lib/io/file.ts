import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Predicate from "effect/Predicate";
import path from "node:path";
import { FileSystem } from "@effect/platform";
import { IOError } from "./types";
import { Console } from "effect";
import { IO } from "~/layers/io";

export const makeFileIOLive = (output: string) =>
  Layer.succeed(IO, {
    write: (formattedReport: string) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const pathDirectory = path.resolve(process.cwd(), path.dirname(output));
        yield* fs.makeDirectory(pathDirectory, { recursive: true });
        yield* fs.writeFile(output, Buffer.from(formattedReport));
        yield* Console.log(`Wrote ${pathDirectory}/${output}`);
      }).pipe(
        Effect.catchAll(
          (e) =>
            new IOError({
              message: Predicate.isError(e)
                ? e.message
                : "Unknown FileIO error",
            }),
        ),
      ),
    writeError: (error: Error) => Effect.logError(error.message),
  });
