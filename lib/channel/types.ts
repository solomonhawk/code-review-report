import * as Data from "effect/Data";

export class ChannelError extends Data.TaggedError("ChannelError")<{
  message: string;
}> {}
