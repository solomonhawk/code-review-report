import * as Effect from "effect/Effect";
import { NotImplementedError, type FormatterImpl } from "~/lib/format/types";
import { ReportSummary } from "../types";

// export class JsonFormatter extends Effect.Tag("Formatter")<
//   JsonFormatter,
//   FormatterImpl
// >() {
//   static Live = Layer.succeed(
//     JsonFormatter,
//     JsonFormatter.of({
//       format: (report) =>
//         Effect.succeed(JSON.stringify(report, null, 2)).pipe(
//           Effect.withSpan("format json"),
//         ),
//     }),
//   );
// }
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
