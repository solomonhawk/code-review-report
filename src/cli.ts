import { Command } from "@effect/cli";
import { NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";
import { generate } from "~/cli/subcommands/generate/command";
import { publish } from "~/cli/subcommands/publish/command";
import { MainLive } from "~/layers";

const main = Command.make("code-review-report", {}, () => {
  return Effect.fail("A subcommand is required.");
});

const command = main.pipe(Command.withSubcommands([generate, publish]));

const cli = Command.run(command, {
  name: "Code Review Report CLI",
  version: "v1.0.0",
});

NodeRuntime.runMain(
  cli(process.argv).pipe(
    Effect.tapError(Effect.logError),
    Effect.provide(MainLive),
  ),
  {
    disableErrorReporting: true,
  },
);
