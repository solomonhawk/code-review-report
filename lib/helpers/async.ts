import { pipe } from "effect";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

export function asyncWithRetryAndTimeout<T, E>(
  fn: () => Promise<T>,
  {
    onError,
    onTimeout,
    retries,
    timeoutSeconds,
  }: {
    onError: (e: unknown) => E;
    onTimeout: () => E;
    retries?: number;
    timeoutSeconds?: number;
  },
) {
  return pipe(
    Effect.tryPromise({ try: fn, catch: onError }),
    Effect.retry({
      schedule: Schedule.compose(
        Schedule.jittered(Schedule.exponential("50 millis")),
        Schedule.recurs(retries ?? 5),
      ),
    }),
    Effect.timeoutFail({
      duration: Duration.seconds(timeoutSeconds ?? 10),
      onTimeout,
    }),
  );
}
