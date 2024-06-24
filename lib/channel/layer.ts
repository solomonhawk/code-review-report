import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Consola } from "~/layers/consola";
import { Channel } from "~/lib/types";
import { ReportSummary } from "~/lib/types";
import { NotionChannel } from "./notion";
import { SlackChannel } from "./slack";
import { ChannelError } from "./types";

type ChannelHandler = (
  summary: ReportSummary,
) => Effect.Effect<unknown, ChannelError>;

export class Channels extends Effect.Tag("Channels")<
  Channels,
  {
    register: (
      channel: Channel,
      handler: ChannelHandler,
    ) => Effect.Effect<void, never>;
    publish: ChannelHandler;
  }
>() {
  static make = (channels: Channel[]) =>
    Layer.effect(
      Channels,
      Effect.gen(function* () {
        const consola = yield* Consola;

        const handlers: Record<
          string,
          (summary: ReportSummary) => Effect.Effect<void, ChannelError>
        > = {};

        return {
          register: (channel, handler) => {
            return Effect.sync(() => {
              handlers[channel] = handler;
            }).pipe(
              Effect.andThen(
                Effect.logDebug(`Registering handler for channel ${channel}`),
              ),
            );
          },

          publish: (message) => {
            return Effect.forEach(
              channels,
              (channel) => {
                const handler = handlers[channel];

                if (handler) {
                  return Effect.all([
                    consola.start(`Publishing to ${channel}`),
                    handler(message).pipe(
                      Effect.matchEffect({
                        onFailure: (error) => consola.fail(error.message),
                        onSuccess: () =>
                          consola.success(`Published to ${channel}`),
                      }),
                    ),
                  ]);
                }

                return new ChannelError({
                  message: `No handler for channel ${channel}`,
                });
              },
              {
                concurrency: "unbounded",
              },
            );
          },
        };
      }),
    );
}

// export const withChannels =
//   (channels: Channel[]) =>
//   <A, E, R>(effect: Effect.Effect<A, E, R>) =>
//     Effect.gen(function* () {
//       /**
//        * @NOTE(shawk): Lazily construct the channel layers based on which ones
//        * are enabled. This lets us avoid raising e.g. ConfigErrors for missing
//        * configuration for channels that are not enabled.
//        */
//       if (channels.includes("slack")) {
//         yield* SlackChannel.registerChannel();
//       }

//       if (channels.includes("notion")) {
//         yield* NotionChannel.registerChannel();
//       }
//     }).pipe(Effect.andThen(effect), Effect.provide(Channels.make(channels)));
