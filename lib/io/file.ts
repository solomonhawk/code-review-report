import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import fs from "node:fs";
import path from "node:path";
import { IOError, IOImpl } from "./types";

export class FileIO extends Effect.Tag("IO")<FileIO, IOImpl>() {
  static makeLive = (output: string) =>
    Layer.succeed(
      FileIO,
      FileIO.of({
        write: (formattedReport: string) =>
          Effect.async<void, IOError>((resume) => {
            const pathDirectory = path.resolve(
              process.cwd(),
              path.dirname(output),
            );

            if (!fs.existsSync(pathDirectory)) {
              fs.mkdirSync(pathDirectory, { recursive: true });
            }

            fs.writeFile(output, formattedReport, (err) => {
              if (err) {
                resume(Effect.fail(new IOError({ message: err.message })));
              } else {
                resume(Effect.succeed(void 0));
              }
            });
          }),
        writeError: (error: Error) => Effect.logError(error.message),
      }),
    );
}
