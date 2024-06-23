/* v8 ignore start */
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "cr-report" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));
/* v8 ignore stop */
