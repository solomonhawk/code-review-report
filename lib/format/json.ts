import * as Effect from "effect/Effect";
import { NotImplementedError, type FormatterImpl } from "~/lib/format/types";
import { ReportSummary } from "../types";

export class JsonFormatter implements FormatterImpl {
  formatString(report: ReportSummary) {
    return Effect.succeed(JSON.stringify(report, null, 2)).pipe(
      Effect.withSpan("format json"),
    );
  }

  formatBlocks(_report: ReportSummary) {
    return new NotImplementedError({
      message: "formatBlocks is not implemented for JsonFormatter",
    });
  }
}
