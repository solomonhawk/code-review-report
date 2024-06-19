import { createConsola, LogLevels } from "consola";
import { Config, Effect, Layer, Logger, LogLevel } from "effect";

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
  Config.withDefault(LogLevel.Debug),
  Effect.andThen((level) => Logger.minimumLogLevel(level)),
  Layer.unwrapEffect,
);

export const Live = Logger.replace(Logger.defaultLogger, make()).pipe(
  Layer.provide(LogLevelLive),
);
