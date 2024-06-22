import { it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Fiber from "effect/Fiber";
import * as TestClock from "effect/TestClock";
import { asyncWithRetryAndTimeout } from "./async";
import { Option } from "effect";

describe("async", () => {
  describe("asyncWithRetryAndTimeout", () => {
    it.effect("times out after 10 seconds", () =>
      Effect.gen(function* () {
        const cb = vi.fn().mockImplementation(() => new Promise(() => {}));

        const fiber = yield* asyncWithRetryAndTimeout(cb, {
          onError: vi.fn(),
          onTimeout: () => new Error("timeout"),
        }).pipe(Effect.either, Effect.fork);

        yield* TestClock.adjust("10 seconds");

        const result = yield* Fiber.join(fiber);

        expect(Either.getLeft(result)).toEqual(
          Option.some(new Error("timeout")),
        );
      }),
    );

    it.effect("returns `onError` result if promise rejects", () =>
      Effect.gen(function* () {
        const cb = vi.fn().mockRejectedValue(void 0);

        const fiber = yield* asyncWithRetryAndTimeout(cb, {
          onError: () => new Error("failure"),
          onTimeout: vi.fn(),
        }).pipe(Effect.either, Effect.fork);

        yield* TestClock.adjust("2 seconds");

        const result = yield* Fiber.join(fiber);

        expect(Either.getLeft(result)).toEqual(
          Option.some(new Error("failure")),
        );
      }),
    );

    it.effect("retries 5 times with exponential backoff and jitter", () =>
      it.flakyTest(
        Effect.gen(function* () {
          let count = 0;
          const start = Date.now();
          const timings: number[] = [];

          const cb = vi.fn().mockImplementation(() => {
            count++;

            timings.push(Date.now() - start);

            return new Promise((resolve, reject) => {
              if (count === 6) {
                resolve("success");
              } else {
                reject();
              }
            });
          });

          const fiber = yield* asyncWithRetryAndTimeout(cb, {
            onError: vi.fn(),
            onTimeout: () => new Error("timeout"),
          }).pipe(Effect.either, Effect.fork);

          yield* TestClock.adjust("5 seconds");

          const result = yield* Fiber.join(fiber);
          const expected = [0, 25, 50, 75, 100, 125];

          timings.forEach((timing, i) => {
            expect(timing / 100).toBeCloseTo(expected[i] / 100, 1);
          });

          expect(count).toEqual(6);
          expect(Either.getOrThrow(result)).toEqual("success");
        }),
      ),
    );
  });
});
