import { NodeRuntime } from "@effect/platform-node";
import { main } from "./main";
import { MainLive } from "./layers";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Cause from "effect/Cause";

try {
  NodeRuntime.runMain(
    main(process.argv).pipe(
      Effect.provide(MainLive),
      Effect.catchAllDefect((defect) => {
        if (Predicate.isError(defect)) {
          return Effect.logFatal(defect.message);
        }

        if (Cause.isRuntimeException(defect)) {
          return Effect.logFatal(
            `RuntimeException defect caught: ${defect.message}`,
          );
        }

        return Effect.all([
          Effect.logFatal("Unknown defect caught."),
          Effect.logFatal(defect),
        ]);
      }),
    ),
    {
      disableErrorReporting: true,
    },
  );
} catch (e) {
  console.error(e);
}
