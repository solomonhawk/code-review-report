import * as Effect from "effect/Effect";
import { Channels } from "~/lib/channel";
import { summary } from "~/test/fixtures/report-summary";
import type { PublishOpts } from "./options";

export const program = (opts: PublishOpts) =>
  Effect.gen(function* () {
    const channels = yield* Channels;
    // fetch data (fire off requests in parallel)

    // aggregate summary

    // output
    yield* channels.publish(summary);
  });
