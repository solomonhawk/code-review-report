import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type FormatterImpl } from "~/lib/format/types";

export class JsonFormatter extends Effect.Tag("Formatter")<
  JsonFormatter,
  FormatterImpl
>() {
  static Live = Layer.succeed(
    JsonFormatter,
    JsonFormatter.of({
      format: (report) => JSON.stringify(report, null, 2),
    }),
  );
}
