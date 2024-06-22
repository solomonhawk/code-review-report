import { KnownBlock } from "@slack/types";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { ReportSummary } from "~/lib/types";

export class NotImplementedError extends Data.TaggedError(
  "NotImplementedError",
)<{ message: string }> {}

export interface FormatterImpl {
  formatString: (
    report: ReportSummary,
  ) => Effect.Effect<string, NotImplementedError>;
  formatBlocks: (
    report: ReportSummary,
  ) => Effect.Effect<KnownBlock[], NotImplementedError>;
}
