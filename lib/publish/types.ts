import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Scope from "effect/Scope";

import { Consola } from "~/layers/consola";
import { Formatter } from "~/layers/formatter";
import { ReportSummary } from "~/lib/types";

export class PublishError extends Data.TaggedError("PublishError")<{
  message: string;
}> {}

export type PublisherImpl = {
  publish: (
    summary: ReportSummary,
  ) => Effect.Effect<void, PublishError, Consola | Formatter>;
};

export type PublisherLayerImpl = {
  publishAll: (summary: ReportSummary) => Effect.Effect<void, PublishError>;
  subscribe: () => Effect.Effect<
    Queue.Dequeue<ReportSummary>,
    never,
    Scope.Scope
  >;
};
