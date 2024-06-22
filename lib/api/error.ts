import * as Data from "effect/Data";

export class ApiError extends Data.TaggedError("ApiError")<{
  message: string;
  errors: {
    message: string;
  }[];
}> {}
