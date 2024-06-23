/* v8 ignore start */
import * as Effect from "effect/Effect";
import type { AggregatorImpl } from "~/lib/aggregate/types";

export class Aggregator extends Effect.Tag("Aggregator")<
  Aggregator,
  AggregatorImpl
>() {}
/* v8 ignore stop */
