/* v8 ignore start */
import * as Effect from "effect/Effect";
import { type IOImpl } from "~/lib/io/types";

export class IO extends Effect.Tag("IO")<IO, IOImpl>() {}
/* v8 ignore stop */
