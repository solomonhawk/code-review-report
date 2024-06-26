import * as Effect from "effect/Effect";
import * as Data from "effect/Data";
import { FileSystem } from "@effect/platform";

export class IOError extends Data.TaggedError("IOError")<{ message: string }> {}

export interface IOImpl {
  write: (
    formattedReport: string,
  ) => Effect.Effect<void, IOError, FileSystem.FileSystem>;
  writeError: (error: Error) => Effect.Effect<void, IOError>;
}
