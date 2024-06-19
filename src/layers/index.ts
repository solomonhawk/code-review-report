import { NodeContext } from "@effect/platform-node";
import { Layer } from "effect";
import * as CustomLogger from "~/logger";

export const MainLive = Layer.mergeAll(NodeContext.layer, CustomLogger.Live);

/**
 * To override the log level configuration (e.g. when testing), provide
 * a custom ConfigProvider:
 *
 * import { ConfigProvider, LogLevel } from "effect";
 *
 * Layer.provide(
 *   Layer.setConfigProvider(
 *     ConfigProvider.fromMap(new Map([["LOG_LEVEL", LogLevel.Debug.label]])),
 *   ),
 * ),
 */
