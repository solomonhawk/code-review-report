import type { KnownBlock } from "@slack/types";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { FormatterImpl } from "~/lib/format/types";
import { ReportSummary } from "~/lib/types";

export class SlackFormatter implements FormatterImpl {
  formatString(report: ReportSummary) {
    return Effect.succeed(
      JSON.stringify(createSlackBlocks(report), null, 2),
    ).pipe(Effect.withSpan("format slack"));
  }

  formatBlocks(report: ReportSummary) {
    return Effect.succeed(createSlackBlocks(report)).pipe(
      Effect.withSpan("formatBlocks slack"),
    );
  }
}

// https://app.slack.com/block-kit-builder/T024F9JB8#%7B%22blocks%22:%5B%7B%22block_id%22:%22text1%22,%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22Activity%20for%20Oct%2028,%202022%20through%20Nov%204,%202022%22%7D%7D,%7B%22type%22:%22divider%22%7D,%7B%22block_id%22:%22text2%22,%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22%F0%9F%91%80%20%20PRs%20opened:%20*25*%22%7D%5D%7D,%7B%22block_id%22:%22text3%22,%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22%E2%86%A9%20%20PRs%20merged:%20*20*%22%7D%5D%7D,%7B%22block_id%22:%22text4%22,%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22%E2%9C%85%20%20Approvals:%20*20*%22%7D%5D%7D,%7B%22block_id%22:%22text5%22,%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22%F0%9F%8F%93%20%20Overall%20Involvement:%20*25*%22%7D%5D%7D,%7B%22block_id%22:%22text6%22,%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22%F0%9F%91%91%20%20Most%20Active%20Project:%20%20*vigetlabs/radius-mvp*%20with%2019%20activity%22%7D%5D%7D,%7B%22block_id%22:%22text7%22,%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22%F0%9F%A5%87%20%20Most%20Active%20User:%20*nick-telsan*%20with%2010%20activity%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D%5D%7D
export function createSlackBlocks({
  dateRangeFormatted: [start, end],
  totalOpenedPrs,
  totalMergedPrs,
  totalReviews,
  mostActiveProject,
  mostActiveProjectActivity,
  mostActiveUser,
  mostActiveUserActivity,
}: ReportSummary): KnownBlock[] {
  return [
    {
      block_id: "activity_heading",
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Activity for ${start} through ${end}`,
      },
    },
    {
      type: "divider",
    },
    {
      block_id: "prs_opened",
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `👀  Total PRs opened: *${totalOpenedPrs}*`,
        },
      ],
    },
    {
      block_id: "prs_merged",
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `🚀  Total PRs merged: *${totalMergedPrs}*`,
        },
      ],
    },
    {
      block_id: "code_reviews_given",
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `✅  Code Reviews given: *${totalReviews}*`,
        },
      ],
    },
    {
      block_id: "most_active_project",
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `👑  Most Active Project:  *${mostActiveProject}* with ${mostActiveProjectActivity} contributions`,
        },
      ],
    },
    {
      block_id: "most_active_contributor",
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `🥇  Most Active User: *${mostActiveUser}* with ${mostActiveUserActivity} contributions`,
        },
      ],
    },
    {
      type: "divider",
    },
  ];
}
