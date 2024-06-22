import { it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { MarkdownFormatter } from "./markdown";
import { summary } from "~/test/fixtures/report-summary";

describe("MarkdownFormatter", () => {
  it("formatString returns a markdown string", () => {
    const formatter = new MarkdownFormatter();
    const result = Effect.runSync(formatter.formatString(summary));

    expect(result).toEqual(`# Code Review Activity for start through end


## Summary by user:

| User | PRs Opened | PRs Merged | Reviews Given |
| --- | --- | --- | --- |
| user-1 | 1 | 2 | 3 |
| user-2 | 1 | 2 | 3 |

## Summary by project:

| Project | PRs Opened | PRs Merged | Reviews Given |
| --- | --- | --- | --- |
| project-1 | 1 | 2 | 3 |
| project-2 | 1 | 2 | 3 |


## Aggregates and Accolades:

| Metric | Value |
| --- | --- |
| 👀 PRs opened: | 10 |
| 🚀 PRs merged: | 10 |
| ✅ Reviews given: | 18 |
| 👑 Most Active Project: | most-active-project (5 contributions) |
| 🥇 Most Active User: | most-active-user (3 contributions) |`);
  });

  it("formatBlocks throws", () => {
    const formatter = new MarkdownFormatter();

    expect(() => Effect.runSync(formatter.formatBlocks(summary))).toThrowError(
      "formatBlocks is not implemented for MarkdownFormatter",
    );
  });
});
