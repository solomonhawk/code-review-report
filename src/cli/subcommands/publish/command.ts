import { Command, Options } from "@effect/cli";
import { shift, span, verbose } from "~/cli/options";
import { program } from "./program";

export const channel = Options.choice("channel", ["slack", "notion"]).pipe(
  Options.withDescription("Where to publish"),
  Options.repeated,
);

export const publish = Command.make(
  "publish",
  { span, shift, channel, verbose },
  (opts) => {
    console.log(opts);
    return program;
  },
);
