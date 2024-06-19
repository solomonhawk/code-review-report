import { createConsola, LogLevels } from "consola";
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";

const make = () => {
  const consola = createConsola({
    level: LogLevels["debug"],
  });

  return Logger.make(({ logLevel, message }) => {
    switch (logLevel) {
      case LogLevel.Trace:
        consola.trace(message);
        return;
      case LogLevel.Debug:
        consola.debug(message);
        return;
      case LogLevel.Info:
        consola.info(message);
        return;
      case LogLevel.Warning:
        consola.warn(message);
        return;
      case LogLevel.Fatal:
      case LogLevel.Error:
        consola.error(message);
        return;
      default:
        consola.log(message);
    }
  });
};

export const LogLevelLive = Config.logLevel("LOG_LEVEL").pipe(
  Config.withDefault(LogLevel.Warning),
  Effect.andThen((level) => Logger.minimumLogLevel(level)),
  Layer.unwrapEffect,
);

export const Live = Logger.replace(Logger.defaultLogger, make()).pipe(
  Layer.provide(LogLevelLive),
);

export const provideVerboseDebugLogLevel = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  verbose: boolean,
) => {
  const withLogger = Effect.provide(effect, Live);

  if (!verbose) {
    return withLogger;
  } else {
    return withLogger.pipe(
      Effect.provide(
        Layer.setConfigProvider(
          ConfigProvider.fromMap(
            new Map([["LOG_LEVEL", LogLevel.Debug.label]]),
          ),
        ),
      ),
    );
  }
};
