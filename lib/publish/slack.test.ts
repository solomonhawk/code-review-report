import { it } from "@effect/vitest";
import { ChatPostMessageResponse } from "@slack/web-api";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as TestClock from "effect/TestClock";

import { Consola } from "~/layers/consola";
import { Publisher } from "~/layers/publisher";
import { withFormatter } from "~/lib/format";
import { createSlackBlocks } from "~/lib/format/slack";
import { summaryFixture } from "~/test/fixtures";
import { DefaultPublisher } from "./layer";
import { SlackPublisher } from "./slack";
import { PublishError } from "./types";

const mocks = vi.hoisted(() => {
  return {
    chat: {
      postMessage: vi.fn(),
    },
  };
});

vi.mock("@slack/web-api", () => {
  const WebClient = vi.fn();

  WebClient.prototype.chat = mocks.chat;

  return { WebClient };
});

const slackPostMessageSuccessData = {
  ok: true,
  channel: "C048MLBK9T6",
  ts: "1719717168.430379",
  message: {
    user: "U048XJHEQGH",
    type: "message",
    ts: "1719717168.430379",
    bot_id: "B048MD7CKAQ",
    app_id: "A048XJ5QD7T",
    text: "Weekly Report Jun 22, 2024 - Jun 29, 2024",
    team: "T024F9JB8",
    bot_profile: {
      id: "B048MD7CKAQ",
      app_id: "A048XJ5QD7T",
      name: "Code Review Report",
      icons: {},
      deleted: false,
      updated: 1666963920,
      team_id: "T024F9JB8",
    },
    blocks: [],
  },
  response_metadata: {
    scopes: ["chat:write", "im:write"],
    acceptedScopes: ["chat:write"],
  },
} satisfies ChatPostMessageResponse;

describe("SlackPublisher", () => {
  const publish = vi.fn();

  const TestSlackPublisher = Layer.succeed(SlackPublisher, {
    publish: (report) => Effect.sync(() => publish(report)),
  });

  it.effect(
    "registerPublisher returns an effect that subscribes to the Publisher service and calls SlackPublisher.publish when a summary is published",
    () =>
      Effect.gen(function* () {
        const publisher = yield* Publisher;
        yield* SlackPublisher.registerPublisher.pipe(
          Effect.provide(TestSlackPublisher),
        );

        yield* publisher.publishAll(summaryFixture);
        yield* Effect.yieldNow();

        expect(publish).toHaveBeenCalledWith(summaryFixture);
      }).pipe(
        withFormatter("slack"),
        Effect.provide(Consola.Live),
        Effect.provide(DefaultPublisher.Live),
        Effect.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromMap(
              new Map([
                ["SLACK_TOKEN", "test_token"],
                ["SLACK_CHANNEL_ID", "test_channel_id"],
              ]),
            ),
          ),
        ),
        Effect.scoped,
      ),
  );

  describe('if the "SLACK_TOKEN" config is missing', () => {
    it.effect("the live layer returns a PublishError when constructed", () =>
      Effect.gen(function* () {
        const error = yield* SlackPublisher.registerPublisher.pipe(
          Effect.provide(SlackPublisher.Live),
          Effect.either,
          Effect.flatMap(Either.flip),
        );

        expect(error).toBeInstanceOf(PublishError);
        expect(error.message).toEqual("Missing SLACK_TOKEN");
      }).pipe(
        withFormatter("text"),
        Effect.provide(Consola.Live),
        Effect.provide(DefaultPublisher.Live),
        Effect.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromMap(
              new Map([["SLACK_CHANNEL_ID", "test_channel_id"]]),
            ),
          ),
        ),
        Effect.scoped,
      ),
    );
  });

  describe('if the "SLACK_CHANNEL_ID" config is missing', () => {
    it.effect("the live layer returns a PublishError when constructed", () =>
      Effect.gen(function* () {
        const error = yield* SlackPublisher.registerPublisher.pipe(
          Effect.provide(SlackPublisher.Live),
          Effect.either,
          Effect.flatMap(Either.flip),
        );

        expect(error).toBeInstanceOf(PublishError);
        expect(error.message).toEqual("Missing SLACK_CHANNEL_ID");
      }).pipe(
        withFormatter("text"),
        Effect.provide(Consola.Live),
        Effect.provide(DefaultPublisher.Live),
        Effect.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromMap(new Map([["SLACK_TOKEN", "test_token"]])),
          ),
        ),
        Effect.scoped,
      ),
    );
  });

  describe("with all required config", () => {
    describe("publish", () => {
      it.effect("calls `client.chat.postMessage`", () =>
        Effect.gen(function* () {
          const slackPublisher = yield* SlackPublisher;

          mocks.chat.postMessage.mockImplementation(async () => {
            return {};
          });

          yield* slackPublisher.publish(summaryFixture);

          expect(mocks.chat.postMessage).toHaveBeenCalledWith({
            channel: "test_channel_id",
            blocks: createSlackBlocks(summaryFixture),
            text: `Weekly Report start - end`,
          });
        }).pipe(
          withFormatter("slack"),
          Effect.provide(DefaultPublisher.Live),
          Effect.provide(SlackPublisher.Live),
          Effect.provide(Consola.Live),
          Effect.provide(
            Layer.setConfigProvider(
              ConfigProvider.fromMap(
                new Map([
                  ["SLACK_TOKEN", "test_token"],
                  ["SLACK_CHANNEL_ID", "test_channel_id"],
                ]),
              ),
            ),
          ),
        ),
      );

      describe("when the API returns a success response", () => {
        it.effect("returns the response data", () =>
          Effect.gen(function* () {
            const slackPublisher = yield* SlackPublisher;

            mocks.chat.postMessage.mockResolvedValue(
              slackPostMessageSuccessData,
            );

            const fiber = yield* slackPublisher
              .publish(summaryFixture)
              .pipe(Effect.fork);

            yield* TestClock.adjust("2 seconds");

            const result = yield* Fiber.join(fiber);

            expect(result).toEqual(slackPostMessageSuccessData);
          }).pipe(
            withFormatter("slack"),
            Effect.provide(SlackPublisher.Live),
            Effect.provide(Consola.Live),
            Effect.provide(
              Layer.setConfigProvider(
                ConfigProvider.fromMap(
                  new Map([
                    ["SLACK_TOKEN", "test_token"],
                    ["SLACK_CHANNEL_ID", "test_channel_id"],
                  ]),
                ),
              ),
            ),
          ),
        );
      });

      describe("when the API returns an error response", () => {
        it.effect("returns a PublishError", () =>
          Effect.gen(function* () {
            const slackPublisher = yield* SlackPublisher;

            mocks.chat.postMessage.mockRejectedValue(new Error("test error"));

            const fiber = yield* slackPublisher
              .publish(summaryFixture)
              .pipe(Effect.either, Effect.flatMap(Either.flip), Effect.fork);

            yield* TestClock.adjust("2 seconds");

            const error = yield* Fiber.join(fiber);

            expect(error).toBeInstanceOf(PublishError);
            expect(error.message).toEqual("test error");
          }).pipe(
            withFormatter("slack"),
            Effect.provide(SlackPublisher.Live),
            Effect.provide(Consola.Live),
            Effect.provide(
              Layer.setConfigProvider(
                ConfigProvider.fromMap(
                  new Map([
                    ["SLACK_TOKEN", "test_token"],
                    ["SLACK_CHANNEL_ID", "test_channel_id"],
                  ]),
                ),
              ),
            ),
          ),
        );
      });
    });
  });
});
