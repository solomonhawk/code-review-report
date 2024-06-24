import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";

import { Channel, ReportSummary } from "~/lib/types";
import { NotionPublisher } from "./notion";
import { SlackPublisher } from "./slack";
import { PublisherLayerImpl } from "./types";

export class DefaultPublisher extends Effect.Tag("Publisher")<
  DefaultPublisher,
  PublisherLayerImpl
>() {
  static Live = Layer.effect(
    DefaultPublisher,
    Effect.gen(function* () {
      const publishChannel = yield* PubSub.unbounded<ReportSummary>();

      return {
        publishAll: (summary) => PubSub.publish(publishChannel, summary),
        subscribe: () => PubSub.subscribe(publishChannel),
      };
    }),
  );
}

export const withPublishers =
  (channels: Channel[]) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    Effect.all([
      NotionPublisher.registerPublisher.pipe(
        Effect.when(() => channels.includes("notion")),
      ),
      SlackPublisher.registerPublisher.pipe(
        Effect.when(() => channels.includes("slack")),
      ),
      effect,
    ]);
