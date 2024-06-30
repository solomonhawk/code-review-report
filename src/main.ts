import { CliConfig } from "@effect/cli";
import * as Command from "@effect/cli/Command";
import * as HelpDoc from "@effect/cli/HelpDoc";
import { pipe } from "effect";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { generate } from "~/cli/subcommands/generate/command";
import { publish } from "~/cli/subcommands/publish/command";
import * as CustomLogger from "~/layers/logger";
import { Requirements } from "~/lib/types";
import pkg from "../package.json";
import { Consola } from "./layers/consola";

class SubcommandRequiredError extends Data.TaggedError(
  "SubcommandRequiredError",
)<{ message: string }> {}

const config = {
  name: "Code Review Report CLI",
  version: `v${pkg.version}`,
  footer: HelpDoc.p("Made with ❤️ at Viget"),
  executable: "cr-report",
};

const mainCommand = Command.make("cr-report", {}, () => {
  return new SubcommandRequiredError({ message: "A subcommand is required" });
});

const commandWithSubcommands = mainCommand.pipe(
  Command.withSubcommands([generate, publish]),
);

export const cli = Command.run(commandWithSubcommands, config);

export type CliReqs = Requirements<ReturnType<typeof cli>>;

export const main = (argv: string[]) =>
  pipe(
    // @NOTE(shawk): without consola hooking `console`, the cli run function
    // calls `Console.error` directly, which bypasses the logger, but it also
    // returns `Effect.fail` which we can tap (and log) here (but we see
    // duplicate output as a result)
    Effect.flatMap(Consola, (consola) =>
      Effect.suspend(() => {
        consola.instance.wrapConsole();

        return cli(argv).pipe(
          Effect.andThen(() => consola.instance.restoreConsole()),
          Effect.withSpan("cli"),
        );
      }),
    ),

    Effect.catchTags({
      ApiError: (e) => Effect.logError(e.errors[0]?.message),
      IOError: Effect.logError,
      PublishError: Effect.logError,
      ConfigError: Effect.logError,
      NotImplementedError: Effect.logError,
      SubcommandRequiredError: (e) =>
        Effect.logError(e.message).pipe(
          Effect.andThen(() =>
            Console.log(
              HelpDoc.toAnsiText(
                Command.getHelp(
                  commandWithSubcommands,
                  CliConfig.defaultConfig,
                ),
              ),
            ),
          ),
          Effect.provide(CustomLogger.Live),
        ),
    }),

    Effect.awaitAllChildren,
    Effect.scoped,
  );
