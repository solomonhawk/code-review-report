import { ConsolaInstance } from "consola";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeConsola } from "~/lib/format";

export type ConsolaImpl = {
  instance: ConsolaInstance;
  start: (label: string) => Effect.Effect<void>;
  fail: (label: string) => Effect.Effect<void>;
  success: (label: string) => Effect.Effect<void>;
};

export class Consola extends Effect.Tag("Consola")<Consola, ConsolaImpl>() {
  static Live = Layer.suspend(() => {
    const consola = makeConsola();

    return Layer.succeed(Consola, {
      instance: consola,
      start: (label: string) => Effect.sync(() => consola.start(label)),
      fail: (label: string) => Effect.sync(() => consola.fail(label)),
      success: (label: string) => Effect.sync(() => consola.success(label)),
    });
  });
}
