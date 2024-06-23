import { NodeContext } from "@effect/platform-node";
import { Layer } from "effect";
import { HttpClient } from "@effect/platform";
import { DefaultAggregator } from "~/lib/aggregate/layer";
import { Api } from "~/lib/api";
import { Consola } from "./consola";
import { ContributorsList } from "./contributors-list";
import { NodeSdkLive } from "./node-sdk";

export const MainLive = Layer.mergeAll(
  ContributorsList.Live,
  DefaultAggregator.Live,
  Api.Live,
  NodeSdkLive,
  NodeContext.layer,
).pipe(
  Layer.provideMerge(Consola.Live),
  Layer.provideMerge(HttpClient.client.layer),
);
