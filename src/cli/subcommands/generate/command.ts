import { Command } from "@effect/cli";
import { format, output, shift, span, verbose } from "~/cli/options";
import { program } from "./program";

export const generate = Command.make(
  "generate",
  {
    span,
    shift,
    output,
    format,
    verbose,
  },
  (opts) => {
    console.log(opts);
    return program;
  },
);
