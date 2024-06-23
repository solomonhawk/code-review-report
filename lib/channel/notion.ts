import { Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Predicate from "effect/Predicate";

import { asyncWithRetryAndTimeout } from "~/lib/helpers";
import { ReportSummary } from "~/lib/types";
import { Channels } from "./layer";
import { ChannelError } from "./types";

export class NotionChannel extends Effect.Tag("NotionChannel")<
  NotionChannel,
  {
    publish: (summary: ReportSummary) => Effect.Effect<void, ChannelError>;
  }
>() {
  /**
   * Channels registration for Notion
   */
  static registerChannel = () =>
    Effect.gen(function* () {
      const channels = yield* Channels;
      const notion = yield* NotionChannel;

      yield* channels.register("notion", notion.publish);
    }).pipe(Effect.provide(NotionChannel.Test));

  /**
   * Test layer for NotionChannel
   */
  static Test = Layer.succeed(
    NotionChannel,
    NotionChannel.of({
      publish: (report) => Effect.logDebug(`notion publish, ${report}`),
    }),
  );

  /**
   * Live layer for NotionChannel
   */
  static Live = Layer.effect(
    NotionChannel,
    Effect.gen(function* () {
      const token = yield* Config.string("NOTION_TOKEN").pipe(
        Effect.orElseFail(
          () => new ChannelError({ message: "Missing NOTION_TOKEN" }),
        ),
      );

      const databaseId = yield* Config.string("NOTION_DATABASE_ID").pipe(
        Effect.orElseFail(
          () => new ChannelError({ message: "Missing NOTION_DATABASE_ID" }),
        ),
      );

      const client = new Client({ auth: token });

      return {
        publish: (summary) => publishReport(client, databaseId, summary),
      };
    }),
  );
}

const publishReport = (
  notion: Client,
  databaseId: string,
  summary: ReportSummary,
) =>
  Effect.gen(function* () {
    const title = `Weekly Report ${summary.dateRangeFormatted[0]} - ${summary.dateRangeFormatted[1]}`;
    const existingPageId = yield* findExistingPage(notion, databaseId, title);
    const properties = buildDatabaseProperties(title, summary);

    if (existingPageId) {
      yield* Effect.logInfo(
        `Updating existing notion page with ID ${existingPageId}`,
      );

      yield* asyncWithRetryAndTimeout(
        () =>
          notion.pages.update({
            page_id: existingPageId,
            properties,
          }),
        {
          onError: (e) =>
            new ChannelError({
              message: Predicate.isError(e)
                ? e.message
                : `Unknown error updating notion page with ID ${existingPageId}`,
            }),
          onTimeout: () =>
            new ChannelError({
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
          notion.pages.create({
            parent: {
              database_id: databaseId,
            },
            properties,
          }),
        {
          onError: (e) =>
            new ChannelError({
              message: Predicate.isError(e)
                ? e.message
                : `Unknown error creating notion page in database with ID ${databaseId}`,
            }),
          onTimeout: () =>
            new ChannelError({
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
        new ChannelError({
          message: Predicate.isError(e)
            ? e.message
            : `Unknown error querying notion database with ID ${databaseId}`,
        }),
      onTimeout: () =>
        new ChannelError({
          message: `Timed out querying notion database with ID ${databaseId}`,
        }),
    },
  );

function buildDatabaseProperties(
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
