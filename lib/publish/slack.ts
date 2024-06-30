import { ChatPostMessageResponse, WebClient } from "@slack/web-api";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Predicate from "effect/Predicate";
import * as Queue from "effect/Queue";

import { Consola } from "~/layers/consola";
import { Formatter } from "~/layers/formatter";
import { Publisher } from "~/layers/publisher";
import { asyncWithRetryAndTimeout } from "~/lib/helpers";
import { ReportSummary } from "../types";
import { PublisherImpl, PublishError } from "./types";

export class SlackPublisher extends Effect.Tag("SlackPublisher")<
  SlackPublisher,
  PublisherImpl
>() {
  static registerPublisher = Effect.suspend(() =>
    Effect.gen(function* () {
      yield* Effect.logDebug("Registering Slack publisher");

      const publisher = yield* Publisher;
      const slackPublisher = yield* SlackPublisher;
      const dequeue = yield* publisher.subscribe();

      yield* Queue.take(dequeue).pipe(
        Effect.andThen(slackPublisher.publish),
        Effect.catchAll(Effect.logError),
        Effect.fork,
      );
    }),
  );

  /**
   * Test layer for SlackPublisher
   */
  static Test = Layer.succeed(SlackPublisher, {
    publish: (report) =>
      Console.log(`slack publish, ${JSON.stringify(report, null, 2)}`),
  });

  /**
   * Live layer for SlackPublisher
   */
  static Live = Layer.effect(
    SlackPublisher,
    Effect.gen(function* () {
      const consola = yield* Consola;
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
        publish: (summary) =>
          Effect.gen(function* () {
            yield* consola.start("Publishing to Slack");
            const response = yield* publishReport(client, channelId, summary);
            yield* consola.success("Published to Slack");

            return response;
          }).pipe(
            Effect.tapError(() => consola.fail("Failed to publish to Slack")),
          ),
      };
    }),
  );
}

const publishReport = (
  client: WebClient,
  channelId: string,
  summary: ReportSummary,
): Effect.Effect<ChatPostMessageResponse, PublishError, Formatter> =>
  Effect.gen(function* () {
    const formatter = yield* Formatter;
    const blocks = yield* formatter.formatBlocks(summary);

    return yield* asyncWithRetryAndTimeout(
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
    );
  }).pipe(
    Effect.catchTags({
      NotImplementedError: () =>
        new PublishError({
          message:
            "SlackPublisher requires a formatter that implements `formatBlocks`",
        }),
    }),
  );
