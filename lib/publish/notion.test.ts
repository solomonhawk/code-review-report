import { it } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Either from "effect/Either";

import { Consola } from "~/layers/consola";
import { Publisher } from "~/layers/publisher";
import { withFormatter } from "~/lib/format";
import { summaryFixture } from "~/test/fixtures";
import { DefaultPublisher } from "./layer";
import { buildDatabaseProperties, NotionPublisher } from "./notion";
import { PublishError } from "./types";

const mocks = vi.hoisted(() => {
  return {
    databases: {
      query: vi.fn(),
    },
    pages: {
      create: vi.fn(),
      update: vi.fn(),
    },
  };
});

vi.mock("@notionhq/client", () => {
  const Client = vi.fn();

  Client.prototype.databases = mocks.databases;
  Client.prototype.pages = mocks.pages;

  return { Client };
});

describe("NotionPublisher", () => {
  const publish = vi.fn();

  const TestNotionPublisher = Layer.succeed(NotionPublisher, {
    publish: (report) => Effect.sync(() => publish(report)),
  });

  it.effect(
    "registerPublisher returns an effect that subscribes to the Publisher service and calls NotionPublisher.publish when a summary is published",
    () =>
      Effect.gen(function* () {
        const publisher = yield* Publisher;
        yield* NotionPublisher.registerPublisher.pipe(
          Effect.provide(TestNotionPublisher),
        );

        yield* publisher.publishAll(summaryFixture);
        yield* Effect.yieldNow();

        expect(publish).toHaveBeenCalledWith(summaryFixture);
      }).pipe(
        withFormatter("text"),
        Effect.provide(Consola.Live),
        Effect.provide(DefaultPublisher.Live),
        Effect.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromMap(
              new Map([
                ["NOTION_TOKEN", "test_token"],
                ["NOTION_DATABASE_ID", "test_database_id"],
              ]),
            ),
          ),
        ),
        Effect.scoped,
      ),
  );

  describe('if the "NOTION_TOKEN" config is missing', () => {
    it.effect("the live layer returns a PublishError when constructed", () =>
      Effect.gen(function* () {
        yield* NotionPublisher.registerPublisher.pipe(
          Effect.provide(NotionPublisher.Live),
          Effect.catchTags({
            PublishError: (e) =>
              Effect.sync(() => {
                expect(e).toBeInstanceOf(PublishError);
                expect(e.message).toBe("Missing NOTION_TOKEN");
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
              new Map([["NOTION_DATABASE_ID", "test_database_id"]]),
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
        const error = yield* NotionPublisher.registerPublisher.pipe(
          Effect.provide(NotionPublisher.Live),
          Effect.either,
          Effect.flatMap(Either.flip),
        );

        expect(error).toBeInstanceOf(PublishError);
        expect(error.message).toEqual("Missing NOTION_DATABASE_ID");
      }).pipe(
        withFormatter("text"),
        Effect.provide(DefaultPublisher.Live),
        Effect.provide(Consola.Live),
        Effect.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromMap(new Map([["NOTION_TOKEN", "test_token"]])),
          ),
        ),
        Effect.scoped,
      ),
    );
  });

  describe("with all required config", () => {
    describe("publish", () => {
      describe("when the notion page does not exist", () => {
        it.effect("calls `client.pages.create`", () =>
          Effect.gen(function* () {
            const notionPublisher = yield* NotionPublisher;

            mocks.databases.query.mockImplementation(async () => {
              return {
                type: "page_or_database",
                page_or_database: {},
                has_more: false,
                next_cursor: null,
                object: "list",
                results: [],
              };
            });

            mocks.pages.create.mockImplementation(async () => {
              return {
                object: "page",
                id: "new_page_id",
              };
            });

            yield* notionPublisher.publish(summaryFixture);

            expect(mocks.databases.query).toHaveBeenCalled();
            expect(mocks.pages.create).toHaveBeenCalledWith({
              parent: {
                database_id: "test_database_id",
              },
              properties: buildDatabaseProperties(
                "Weekly Report start - end",
                summaryFixture,
              ),
            });
          }).pipe(
            withFormatter("text"),
            Effect.provide(DefaultPublisher.Live),
            Effect.provide(NotionPublisher.Live),
            Effect.provide(Consola.Live),
            Effect.provide(
              Layer.setConfigProvider(
                ConfigProvider.fromMap(
                  new Map([
                    ["NOTION_TOKEN", "test_token"],
                    ["NOTION_DATABASE_ID", "test_database_id"],
                  ]),
                ),
              ),
            ),
          ),
        );
      });

      describe("when the notion page already exists", () => {
        it.effect("calls `client.pages.update`", () =>
          Effect.gen(function* () {
            const notionPublisher = yield* NotionPublisher;

            mocks.databases.query.mockImplementation(async () => {
              return {
                type: "page_or_database",
                page_or_database: {},
                has_more: false,
                next_cursor: null,
                object: "list",
                results: [
                  {
                    object: "page",
                    id: "existing_page_id",
                  },
                ],
              };
            });

            mocks.pages.update.mockImplementation(async () => {
              return {
                object: "page",
                id: "existing_page_id",
              };
            });

            yield* notionPublisher.publish(summaryFixture);

            expect(mocks.databases.query).toHaveBeenCalled();
            expect(mocks.pages.update).toHaveBeenCalledWith({
              page_id: "existing_page_id",
              properties: buildDatabaseProperties(
                "Weekly Report start - end",
                summaryFixture,
              ),
            });
          }).pipe(
            withFormatter("text"),
            Effect.provide(DefaultPublisher.Live),
            Effect.provide(NotionPublisher.Live),
            Effect.provide(Consola.Live),
            Effect.provide(
              Layer.setConfigProvider(
                ConfigProvider.fromMap(
                  new Map([
                    ["NOTION_TOKEN", "test_token"],
                    ["NOTION_DATABASE_ID", "test_database_id"],
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
