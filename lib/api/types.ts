import { Schema } from "@effect/schema";

export const ApiResponseDataSchema = Schema.mutable(
  Schema.TaggedStruct("ApiResponseData", {
    total_count: Schema.Int,
    items: Schema.mutable(
      Schema.Array(
        Schema.Struct({
          title: Schema.String,
          repository_url: Schema.String,
          user: Schema.Struct({
            login: Schema.String,
          }),
        }),
      ),
    ),
  }),
);

export type SearchResults = Schema.Schema.Type<typeof ApiResponseDataSchema>;

export const ApiResponseErrorSchema = Schema.mutable(
  Schema.TaggedStruct("ApiResponseError", {
    message: Schema.String,
    errors: Schema.mutable(
      Schema.Array(
        Schema.Struct({
          message: Schema.String,
        }),
      ),
    ),
  }),
);

export const ApiResponseSchema = Schema.Union(
  ApiResponseDataSchema,
  ApiResponseErrorSchema,
);
