import { NodeRuntime } from "@effect/platform-node";
import { main } from "./main";
import { MainLive } from "./layers";
import { Effect } from "effect";

try {
  NodeRuntime.runMain(main(process.argv).pipe(Effect.provide(MainLive)), {
    disableErrorReporting: true,
  });
} catch (e) {
  console.error(e);
}
