/* v8 ignore start */
import * as Effect from "effect/Effect";
import type { FormatterImpl } from "~/lib/format/types";

export class Formatter extends Effect.Tag("Formatter")<
  Formatter,
  FormatterImpl
>() {}
/* v8 ignore stop */
