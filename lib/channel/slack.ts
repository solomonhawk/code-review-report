import { WebClient } from "@slack/web-api";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Predicate from "effect/Predicate";

import { Formatter } from "~/layers/formatter";
import { asyncWithRetryAndTimeout } from "~/lib/helpers";
import type { ReportSummary } from "~/lib/types";
import { Channels } from "./layer";
import { ChannelError } from "./types";

export class SlackChannel extends Effect.Tag("SlackChannel")<
  SlackChannel,
  {
    publish: (summary: ReportSummary) => Effect.Effect<void, ChannelError>;
  }
>() {
  /**
   * Channels registration for Slack
   */
  static registerChannel = () =>
    Effect.gen(function* () {
      const channels = yield* Channels;
      const slack = yield* SlackChannel;

      yield* channels.register("slack", slack.publish);
    }).pipe(Effect.provide(SlackChannel.Live));

  /**
   * Test layer for SlackChannel
   */
  static Test = Layer.succeed(
    SlackChannel,
    SlackChannel.of({
      publish: (report) =>
        Effect.logInfo(`slack publish, ${JSON.stringify(report, null, 2)}`),
    }),
  );

  /**
   * Live layer for SlackChannel
   */
  static Live = Layer.effect(
    SlackChannel,
    Effect.gen(function* () {
      const formatter = yield* Formatter;
      const token = yield* Config.string("SLACK_TOKEN").pipe(
        Effect.orElseFail(
          () => new ChannelError({ message: "Missing SLACK_TOKEN" }),
        ),
      );

      const channelId = yield* Config.string("SLACK_CHANNEL_ID").pipe(
        Effect.orElseFail(
          () => new ChannelError({ message: "Missing SLACK_CHANNEL_ID" }),
        ),
      );

      const client = new WebClient(token);

      return {
        publish: (summary) => {
          return formatter.formatBlocks(summary).pipe(
            Effect.andThen((blocks) =>
              asyncWithRetryAndTimeout(
                () =>
                  client.chat.postMessage({
                    channel: channelId,
                    blocks,
                    text: `Weekly Report ${summary.dateRangeFormatted[0]} - ${summary.dateRangeFormatted[1]}`,
                  }),
                {
                  onError: (e) =>
                    new ChannelError({
                      message: Predicate.isError(e)
                        ? e.message
                        : "Unknown failure sending report to Slack",
                    }),
                  onTimeout: () =>
                    new ChannelError({
                      message: "Timed out sending report to Slack",
                    }),
                },
              ),
            ),
            Effect.catchTags({
              NotImplementedError: Effect.succeed,
            }),
          );
        },
      };
    }),
  );
}
