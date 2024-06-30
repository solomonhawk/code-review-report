import { HttpClient } from "@effect/platform";
import { NodeContext, NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";
import { DefaultAggregator } from "~/lib/aggregate/layer";
import { Api } from "~/lib/api";
import { DefaultPublisher } from "~/lib/publish";
import { Consola } from "./consola";
import { ContributorsList } from "./contributors-list";
import { NodeSdkLive } from "./node-sdk";

export const MainLive = Layer.mergeAll(
  Api.Live,
  ContributorsList.Live,
  DefaultAggregator.Live,
  DefaultPublisher.Live,
  NodeSdkLive,
  NodeContext.layer,
  NodeFileSystem.layer,
).pipe(
  Layer.provideMerge(Consola.Live),
  Layer.provideMerge(HttpClient.client.layer),
);
