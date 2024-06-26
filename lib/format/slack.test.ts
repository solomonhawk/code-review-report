import { it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { SlackFormatter } from "./slack";
import { summaryFixture } from "~/test/fixtures";

describe("SlackFormatter", () => {
  it("formatString returns a markdown string", () => {
    const formatter = new SlackFormatter();
    const result = Effect.runSync(formatter.formatString(summaryFixture));

    expect(result).toEqual(`[
  {
    "block_id": "activity_heading",
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Activity for start through end"
    }
  },
  {
    "type": "divider"
  },
  {
    "block_id": "prs_opened",
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "👀  Total PRs opened: *10*"
      }
    ]
  },
  {
    "block_id": "prs_merged",
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "🚀  Total PRs merged: *10*"
      }
    ]
  },
  {
    "block_id": "code_reviews_given",
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "✅  Code Reviews given: *18*"
      }
    ]
  },
  {
    "block_id": "most_active_project",
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "👑  Most Active Project:  *most-active-project* with 5 contributions"
      }
    ]
  },
  {
    "block_id": "most_active_contributor",
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "🥇  Most Active User: *most-active-user* with 3 contributions"
      }
    ]
  },
  {
    "type": "divider"
  }
]`);
  });

  it("formatBlocks returns a list of `KnownBlock`s", () => {
    const formatter = new SlackFormatter();

    const result = Effect.runSync(formatter.formatBlocks(summaryFixture));

    expect(result).toEqual([
      {
        block_id: "activity_heading",
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Activity for start through end",
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
            text: "👀  Total PRs opened: *10*",
          },
        ],
      },
      {
        block_id: "prs_merged",
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "🚀  Total PRs merged: *10*",
          },
        ],
      },
      {
        block_id: "code_reviews_given",
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "✅  Code Reviews given: *18*",
          },
        ],
      },
      {
        block_id: "most_active_project",
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "👑  Most Active Project:  *most-active-project* with 5 contributions",
          },
        ],
      },
      {
        block_id: "most_active_contributor",
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "🥇  Most Active User: *most-active-user* with 3 contributions",
          },
        ],
      },
      {
        type: "divider",
      },
    ]);
  });
});
