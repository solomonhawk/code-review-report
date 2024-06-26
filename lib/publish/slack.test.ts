import { it } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Consola } from "~/layers/consola";
import { Publisher } from "~/layers/publisher";
import { withFormatter } from "~/lib/format";
import { summaryFixture } from "~/test/fixtures";
import { DefaultPublisher } from "./layer";
import { SlackPublisher } from "./slack";
import { PublishError } from "./types";
import { createSlackBlocks } from "../format/slack";

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
        yield* SlackPublisher.registerPublisher.pipe(
          Effect.provide(SlackPublisher.Live),
          Effect.catchTags({
            PublishError: (e) =>
              Effect.sync(() => {
                expect(e).toBeInstanceOf(PublishError);
                expect(e.message).toBe("Missing SLACK_TOKEN");
              }),
          }),
        );
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

  describe('if the "NOTION_DATABASE_ID" config is missing', () => {
    it.effect("the live layer returns a PublishError when constructed", () =>
      Effect.gen(function* () {
        yield* SlackPublisher.registerPublisher.pipe(
          Effect.provide(SlackPublisher.Live),
          Effect.catchTags({
            PublishError: (e) =>
              Effect.sync(() => {
                expect(e).toBeInstanceOf(PublishError);
                expect(e.message).toBe("Missing SLACK_CHANNEL_ID");
              }),
          }),
        );
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
        it.effect("logs a success message", () => Effect.gen(function* () {}));
      });

      describe("when the API returns an error response", () => {
        it.effect("logs a success message", () => Effect.gen(function* () {}));
      });
    });
  });
});
