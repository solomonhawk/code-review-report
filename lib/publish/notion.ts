import { Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Predicate from "effect/Predicate";
import * as Queue from "effect/Queue";

import { Publisher } from "~/layers/publisher";
import { asyncWithRetryAndTimeout } from "~/lib/helpers";
import { ReportSummary } from "~/lib/types";
import { PublishError, PublisherImpl } from "./types";
import { Consola } from "~/layers/consola";
import { Console } from "effect";

export class NotionPublisher extends Effect.Tag("NotionPublisher")<
  NotionPublisher,
  PublisherImpl
>() {
  static registerPublisher = Effect.suspend(() =>
    Effect.gen(function* () {
      yield* Effect.logDebug("Registering Notion publisher");

      const publisher = yield* Publisher;
      const notionPublisher = yield* NotionPublisher;
      const dequeue = yield* publisher.subscribe();

      yield* Queue.take(dequeue).pipe(
        Effect.andThen(notionPublisher.publish),
        Effect.catchAll(Effect.logError),
        Effect.fork,
      );
    }),
  );

  /**
   * Test layer for NotionPublisher
   */
  static Test = Layer.succeed(NotionPublisher, {
    publish: (report) =>
      Effect.logInfo(`notion publish, ${JSON.stringify(report, null, 2)}`),
  });

  /**
   * Live layer for NotionPublisher
   */
  static Live = Layer.effect(
    NotionPublisher,
    Effect.gen(function* () {
      const consola = yield* Consola;

      const token = yield* Config.string("NOTION_TOKEN").pipe(
        Effect.orElseFail(
          () => new PublishError({ message: "Missing NOTION_TOKEN" }),
        ),
      );

      const databaseId = yield* Config.string("NOTION_DATABASE_ID").pipe(
        Effect.orElseFail(
          () => new PublishError({ message: "Missing NOTION_DATABASE_ID" }),
        ),
      );

      const client = new Client({ auth: token });

      return {
        publish: (summary) =>
          Effect.gen(function* () {
            yield* consola.start(`Publishing to Notion`);
            yield* publishReport(client, databaseId, summary);
            yield* consola.success("Published to Notion");
          }).pipe(
            Effect.tapError(() => consola.fail("Failed to publish to Notion")),
          ),
      };
    }),
  );
}

const publishReport = (
  client: Client,
  databaseId: string,
  summary: ReportSummary,
) =>
  Effect.gen(function* () {
    const title = `Weekly Report ${summary.dateRangeFormatted[0]} - ${summary.dateRangeFormatted[1]}`;
    const existingPageId = yield* findExistingPage(client, databaseId, title);
    const properties = buildDatabaseProperties(title, summary);

    if (existingPageId) {
      yield* Effect.logInfo(
        `Updating existing notion page with ID ${existingPageId}`,
      );

      yield* asyncWithRetryAndTimeout(
        () =>
          client.pages.update({
            page_id: existingPageId,
            properties,
          }),
        {
          onError: (e) =>
            new PublishError({
              message: Predicate.isError(e)
                ? e.message
                : `Unknown error updating notion page with ID ${existingPageId}`,
            }),
          onTimeout: () =>
            new PublishError({
              message: `Timed out updating notion page with ID ${existingPageId}`,
            }),
        },
      );
    } else {
      yield* Effect.logInfo(
        `Creating new notion page in database with ID ${databaseId}`,
      );

      yield* asyncWithRetryAndTimeout(
        () =>
          client.pages.create({
            parent: {
              database_id: databaseId,
            },
            properties,
          }),
        {
          onError: (e) =>
            new PublishError({
              message: Predicate.isError(e)
                ? e.message
                : `Unknown error creating notion page in database with ID ${databaseId}`,
            }),
          onTimeout: () =>
            new PublishError({
              message: `Timed out creating notion page in database with ID ${databaseId}`,
            }),
        },
      );
    }
  });

const findExistingPage = (notion: Client, databaseId: string, title: string) =>
  asyncWithRetryAndTimeout(
    () =>
      notion.databases
        .query({
          database_id: databaseId,
          filter: {
            type: "title",
            property: "Name",
            title: {
              equals: title,
            },
          },
        })
        .then((res) => res.results[0]?.id),
    {
      onError: (e) =>
        new PublishError({
          message: Predicate.isError(e)
            ? e.message
            : `Unknown error querying notion database with ID ${databaseId}`,
        }),
      onTimeout: () =>
        new PublishError({
          message: `Timed out querying notion database with ID ${databaseId}`,
        }),
    },
  );

export function buildDatabaseProperties(
  title: string,
  summary: ReportSummary,
): CreatePageParameters["properties"] {
  return {
    Name: {
      type: "title",
      title: [
        {
          type: "text",
          text: {
            content: title,
          },
        },
      ],
    },
    "Date Range": {
      type: "date",
      date: {
        start: summary.dateRange[0].toISOString(),
        end: summary.dateRange[1].toISOString(),
        // @NOTE: force Notion to show these in EST instead of UTC
        time_zone: "America/New_York",
      },
    },
    "PRs Opened": {
      type: "number",
      number: summary.totalOpenedPrs,
    },
    "PRs Merged": {
      type: "number",
      number: summary.totalMergedPrs,
    },
    "PRs Reviewed": {
      type: "number",
      number: summary.totalReviews,
    },
    "Most Active Project": {
      type: "rich_text",
      rich_text: [
        {
          type: "text",
          text: {
            content: summary.mostActiveProject,
          },
        },
      ],
    },
    "Most Active Project Contributions": {
      type: "number",
      number: summary.mostActiveProjectActivity,
    },
    "Most Active User": {
      type: "rich_text",
      rich_text: [
        {
          type: "text",
          text: {
            content: summary.mostActiveUser,
          },
        },
      ],
    },
    "Most Active User Contributions": {
      type: "number",
      number: summary.mostActiveUserActivity,
    },
  };
}
