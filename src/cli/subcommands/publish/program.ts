import * as Effect from "effect/Effect";

import { Aggregator } from "~/layers/aggregator";
import { ContributorsList } from "~/layers/contributors-list";
import { Api } from "~/lib/api";
import { Channels } from "~/lib/channel";
import { dateRange } from "~/lib/helpers/date";
import type { PublishOpts } from "./options";

export const program = (opts: PublishOpts) =>
  Effect.gen(function* () {
    const api = yield* Api;
    const channels = yield* Channels;
    const aggregator = yield* Aggregator;
    const { usernames } = yield* ContributorsList;
    const dr = dateRange(opts.days, opts.offset);

    // fetch data
    const stats = yield* api.getContributorStats(usernames, dr);

    // aggregate summary
    const summary = yield* aggregator.aggregate(stats, dr);

    // output
    yield* channels.publish(summary);
  });
