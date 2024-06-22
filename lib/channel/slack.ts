import { WebClient } from "@slack/web-api";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { ReportSummary } from "~/lib/types";
import { ChannelError } from "./types";
import { Formatter } from "~/layers/formatter";
import { Channels } from ".";
import { isError } from "effect/Predicate";
import { asyncWithRetryAndTimeout } from "../helpers";

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
    }).pipe(Effect.provide(SlackChannel.Test));

  /**
   * Test layer for SlackChannel
   */
  static Test = Layer.succeed(
    SlackChannel,
    SlackChannel.of({
      publish: (report) => Effect.logDebug(`slack publish, ${report}`),
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
                  }),
                {
                  onError: (e) =>
                    new ChannelError({
                      message: isError(e)
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
