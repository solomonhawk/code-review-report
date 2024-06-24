import { WebClient } from "@slack/web-api";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Queue from "effect/Queue";
import * as Predicate from "effect/Predicate";

import { Formatter } from "~/layers/formatter";
import { asyncWithRetryAndTimeout } from "~/lib/helpers";
import { PublisherImpl, PublishError } from "./types";
import { Publisher } from "~/layers/publisher";

export class SlackPublisher extends Effect.Tag("SlackPublisher")<
  SlackPublisher,
  PublisherImpl
>() {
  static registerPublisher = Effect.suspend(() =>
    Effect.gen(function* () {
      yield* Effect.logDebug("Registering Notion publisher");

      const publisher = yield* Publisher;
      const slackPublisher = yield* SlackPublisher;
      const dequeue = yield* publisher.subscribe();

      yield* Queue.take(dequeue).pipe(
        Effect.andThen(slackPublisher.publish),
        Effect.fork,
      );
    }).pipe(Effect.provide(SlackPublisher.Test)),
  );

  /**
   * Test layer for SlackPublisher
   */
  static Test = Layer.succeed(
    SlackPublisher,
    SlackPublisher.of({
      publish: (report) =>
        Effect.logInfo(`slack publish, ${JSON.stringify(report, null, 2)}`),
    }),
  );

  /**
   * Live layer for SlackPublisher
   */
  static Live = Layer.effect(
    SlackPublisher,
    Effect.gen(function* () {
      const formatter = yield* Formatter;
      const token = yield* Config.string("SLACK_TOKEN").pipe(
        Effect.orElseFail(
          () => new PublishError({ message: "Missing SLACK_TOKEN" }),
        ),
      );

      const channelId = yield* Config.string("SLACK_CHANNEL_ID").pipe(
        Effect.orElseFail(
          () => new PublishError({ message: "Missing SLACK_CHANNEL_ID" }),
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
                    new PublishError({
                      message: Predicate.isError(e)
                        ? e.message
                        : "Unknown failure sending report to Slack",
                    }),
                  onTimeout: () =>
                    new PublishError({
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
