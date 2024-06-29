import {
  NodeContext,
  NodeFileSystem,
  NodeRuntime,
} from "@effect/platform-node";
import { it } from "@effect/vitest";
import { Layer } from "effect";
import * as Effect from "effect/Effect";
import { Consola } from "~/layers/consola";
import { ContributorsList } from "~/layers/contributors-list";
import * as CustomLogger from "~/layers/logger";
import { DefaultAggregator } from "~/lib/aggregate";
import { Api } from "~/lib/api";
import { DefaultPublisher } from "~/lib/publish";
import { main } from "~/main";

describe("CLI Options", () => {
  it("should require a subcommand", () =>
    new Promise<void>((done) => {
      const spy = vi.spyOn(process.stderr, "write");
      const log = vi.spyOn(process.stdout, "write").mockImplementation(vi.fn());

      NodeRuntime.runMain(
        main([]).pipe(
          Effect.provide(
            Layer.mergeAll(
              ContributorsList.Live,
              DefaultPublisher.Live,
              DefaultAggregator.Live,
              Api.Test,
              NodeContext.layer,
              NodeFileSystem.layer,
              CustomLogger.Live,
            ).pipe(Layer.provideMerge(Consola.Live)),
          ),
        ),
        {
          disableErrorReporting: true,
          teardown: () => {
            expect(spy).toHaveBeenCalledWith(
              expect.stringContaining("A subcommand is required"),
            );

            expect(log).toHaveBeenCalledWith(expect.stringMatching("generate"));
            expect(log).toHaveBeenCalledWith(expect.stringMatching("publish"));

            log.mockRestore();
            done();
          },
        },
      );
    }));
});
