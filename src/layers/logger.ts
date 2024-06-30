import { pipe } from "effect";
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import { Consola, ConsolaImpl } from "./consola";

const make = (consola: ConsolaImpl) => {
  return Logger.make(({ logLevel, message }) => {
    switch (logLevel) {
      case LogLevel.Trace:
        consola.instance.trace(message);
        return;
      case LogLevel.Debug:
        consola.instance.debug(message);
        return;
      case LogLevel.Info:
        consola.instance.info(message);
        return;
      case LogLevel.Warning:
        consola.instance.warn(message);
        return;
      case LogLevel.Fatal:
      case LogLevel.Error:
        consola.instance.error(message);
        return;
      default:
        consola.instance.log(message);
    }
  });
};

const customLogger = Logger.replaceEffect(
  Logger.defaultLogger,
  Effect.map(Consola, (consola) => make(consola)),
);

export const LogLevelLive = Config.logLevel("LOG_LEVEL").pipe(
  Config.withDefault(LogLevel.Warning),
  Effect.andThen((level) => Logger.minimumLogLevel(level)),

  // @NOTE(shawk): if an invalid LOG_LEVEL is passed, nothing is logged without
  // the following
  Effect.tapError(Effect.logError),

  // @NOTE(shawk): if an invalid LOG_LEVEL is passed, the logged error does not
  // use the consola logger unless I also provide it here (again)
  Effect.provide(customLogger),
  Layer.unwrapEffect,
);

export const Live = pipe(customLogger, Layer.provide(LogLevelLive));

export const provideVerboseDebugLogLevel =
  (verbose: boolean) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) => {
    const withLogger = Effect.provide(effect, Live);

    if (!verbose) {
      return withLogger;
    } else {
      return withLogger.pipe(
        Effect.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromMap(
              new Map([["LOG_LEVEL", LogLevel.Debug.label]]),
            ).pipe(ConfigProvider.orElse(ConfigProvider.fromEnv)),
          ),
        ),
      );
    }
  };
