import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

export function asyncWithRetryAndTimeout<T, E>(
  fn: () => Promise<T>,
  {
    onError,
    onTimeout,
  }: {
    onError: (e: unknown) => E;
    onTimeout: () => E;
  },
) {
  return Effect.tryPromise({
    try: fn,
    catch: onError,
  }).pipe(
    Effect.retry({
      times: 5,
      schedule: Schedule.jittered(Schedule.exponential("50 millis")),
    }),
    Effect.timeoutFail({
      duration: Duration.seconds(10),
      onTimeout,
    }),
  );
}
