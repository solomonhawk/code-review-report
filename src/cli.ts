import { CliConfig } from "@effect/cli";
import * as Command from "@effect/cli/Command";
import * as HelpDoc from "@effect/cli/HelpDoc";
import { NodeRuntime } from "@effect/platform-node";
import { pipe } from "effect";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { isError } from "effect/Predicate";

import { generate } from "~/cli/subcommands/generate/command";
import { publish } from "~/cli/subcommands/publish/command";
import * as CustomLogger from "~/layers/logger";
import pkg from "../package.json";
import { MainLive } from "./layers";
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

const main = Command.make("cr-report", {}, () => {
  return new SubcommandRequiredError({ message: "A subcommand is required" });
});

const command = main.pipe(Command.withSubcommands([generate, publish]));

const cli = Command.run(command, config);

NodeRuntime.runMain(
  pipe(
    // @NOTE(shawk): without consola hooking `console`, the cli run function
    // calls `Console.error` directly, which bypasses the logger, but it also
    // returns `Effect.fail` which we can tap (and log) here (but we see
    // duplicate output as a result)
    Effect.flatMap(Consola, (consola) =>
      Effect.suspend(() => {
        consola.instance.wrapAll();

        return cli(process.argv).pipe(
          Effect.andThen(() => consola.instance.restoreAll()),
          Effect.withSpan("cli"),
        );
      }),
    ),

    Effect.catchTags({
      ChannelError: Effect.logError,
      ConfigError: Effect.logError,
      SubcommandRequiredError: (e) =>
        Effect.logError(e.message)
          .pipe(
            Effect.andThen(() =>
              Console.log(
                HelpDoc.toAnsiText(
                  Command.getHelp(command, CliConfig.defaultConfig),
                ),
              ),
            ),
          )
          .pipe(Effect.provide(CustomLogger.Live)),
    }),

    Effect.catchAllDefect((defect) => {
      if (isError(defect)) {
        return Effect.logFatal(defect.message);
      }

      if (Cause.isRuntimeException(defect)) {
        return Effect.logFatal(
          `RuntimeException defect caught: ${defect.message}`,
        );
      }

      return Effect.all([
        Effect.logFatal("Unknown defect caught."),
        Effect.logFatal(defect),
      ]);
    }),

    // @TODO(shawk): how can I provide the custom logger globally when I don't
    // have access to `opts.verbose` here? Without it, some things aren't
    // logged correctly (with consola).
    // Effect.provide(CustomLogger.Live),

    Effect.provide(MainLive),
  ),
  {
    disableErrorReporting: true,
  },
);
