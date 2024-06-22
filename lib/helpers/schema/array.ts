import { Schema } from "@effect/schema";

export const withoutDuplicates = <U, A extends Array<U>, I, R>(
  self: Schema.Schema<A, I, R>,
) =>
  Schema.transform(
    self,
    self.pipe(
      Schema.typeSchema,
      Schema.filter((a) => a.length === new Set(a).size),
    ),
    {
      strict: false,
      decode: (a) => Array.from(new Set(a)),
      encode: (a) => a,
    },
  );
