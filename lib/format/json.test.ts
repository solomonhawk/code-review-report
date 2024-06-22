import { it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { JsonFormatter } from "./json";
import { summary } from "~/test/fixtures/report-summary";

describe("JsonFormatter", () => {
  it("formatString returns a JSON-encoded string", () => {
    const formatter = new JsonFormatter();
    const result = Effect.runSync(formatter.formatString(summary));

    expect(result).toEqual(`{
  "dateRange": [
    "2024-01-01T05:00:00.000Z",
    "2024-01-01T05:00:00.000Z"
  ],
  "dateRangeFormatted": [
    "start",
    "end"
  ],
  "totalOpenedPrs": 10,
  "totalMergedPrs": 10,
  "totalReviews": 18,
  "mostActiveProject": "most-active-project",
  "mostActiveProjectActivity": 5,
  "mostActiveUser": "most-active-user",
  "mostActiveUserActivity": 3,
  "userStats": {
    "user-1": {
      "opened": 1,
      "merged": 2,
      "reviews": 3
    },
    "user-2": {
      "opened": 1,
      "merged": 2,
      "reviews": 3
    }
  },
  "projectStats": {
    "project-1": {
      "opened": 1,
      "merged": 2,
      "reviews": 3
    },
    "project-2": {
      "opened": 1,
      "merged": 2,
      "reviews": 3
    }
  }
}`);
  });

  it("formatBlocks throws", () => {
    const formatter = new JsonFormatter();

    expect(() => Effect.runSync(formatter.formatBlocks(summary))).toThrowError(
      "formatBlocks is not implemented for JsonFormatter",
    );
  });
});
