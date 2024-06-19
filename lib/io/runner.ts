import * as core from "@actions/core";
import * as Effect from "effect/Effect";

export const setFailed = (message: string) => {
  return Effect.sync(() => {
    core.setFailed(message);
  });
};
