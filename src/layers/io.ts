import * as Effect from "effect/Effect";
import { type IOImpl } from "~/lib/io/types";

// @TODO(shawk): maybe have 1 service that fans out to multiple IO adapters?
export class IO extends Effect.Tag("IO")<IO, IOImpl>() {}
