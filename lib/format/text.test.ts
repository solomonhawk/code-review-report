import { it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { TextFormatter } from "./text";
import { summaryFixture } from "~/test/fixtures";

describe("TextFormatter", () => {
  it("formatString returns a plain text string", () => {
    const formatter = new TextFormatter();
    const result = Effect.runSync(formatter.formatString(summaryFixture));

    expect(result).toEqual(`Code Review Activity for start through end

Summary by user:
user-1: PRs opened: 1, PRs merged: 2, Reviews given: 3
user-2: PRs opened: 1, PRs merged: 2, Reviews given: 3

Summary by project:
project-1: PRs opened: 1, PRs merged: 2, Reviews given: 3
project-2: PRs opened: 1, PRs merged: 2, Reviews given: 3

👀 Total PRs opened: 10
🚀 Total PRs merged: 10
✅ Code Reviews given: 18

👑 Most Active Project: most-active-project with 5 contributions
🥇 Most Active User: most-active-user with 3 contributions`);
  });

  it("formatBlocks throws", () => {
    const formatter = new TextFormatter();

    expect(() =>
      Effect.runSync(formatter.formatBlocks(summaryFixture)),
    ).toThrowError("formatBlocks is not implemented for TextFormatter");
  });
});
