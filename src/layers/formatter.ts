import * as Effect from "effect/Effect";
import { FormatterImpl } from "~/lib/format/types";

export class Formatter extends Effect.Tag("Formatter")<
  Formatter,
  FormatterImpl
>() {}
