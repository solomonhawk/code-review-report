import * as Effect from "effect/Effect";
import { PublisherLayerImpl } from "~/lib/publish";

export class Publisher extends Effect.Tag("Publisher")<
  Publisher,
  PublisherLayerImpl
>() {}
