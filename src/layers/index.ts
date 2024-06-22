import { NodeContext } from "@effect/platform-node";
import { Layer } from "effect";

import { Consola } from "./consola";
import { ContributorsList } from "./contributors-list";
import { NodeSdkLive } from "./node-sdk";

export const MainLive = Layer.mergeAll(
  ContributorsList.Live,
  NodeSdkLive,
  NodeContext.layer,
).pipe(Layer.provideMerge(Consola.Live));
