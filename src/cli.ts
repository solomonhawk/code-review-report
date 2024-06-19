import * as Command from "@effect/cli/Command";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import * as Effect from "effect/Effect";
import { generate } from "~/cli/subcommands/generate/command";
import { publish } from "~/cli/subcommands/publish/command";
import * as IO from "~/lib/io";
import { MainLive } from "./layers";

const main = Command.make("cr-report", {}, () => {
  return Effect.fail("A subcommand is required.");
});

const command = main.pipe(Command.withSubcommands([generate, publish]));

const cli = Command.run(command, {
  name: "Code Review Report CLI",
  version: "v1.0.0",
});

NodeRuntime.runMain(
  cli(process.argv).pipe(
    IO.tapError,
    Effect.provide(NodeContext.layer),
    Effect.provide(MainLive),
  ),
  {
    disableErrorReporting: true,
  },
);
