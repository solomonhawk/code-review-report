import * as Effect from "effect/Effect";
import { ReportSummary } from "~/lib/types";
import { ContributorStats } from "../api/types";

export interface AggregatorImpl {
  aggregate: (
    stats: Record<string, ContributorStats>,
    dateRange: readonly [Date, Date],
  ) => Effect.Effect<ReportSummary>;
}
