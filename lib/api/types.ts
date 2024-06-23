import { Schema } from "@effect/schema";
import * as Data from "effect/Data";

export class ApiError extends Data.TaggedError("ApiError")<{
  message: string;
  errors: {
    message: string;
  }[];
}> {}

export const ApiResponseDataSchema = Schema.Struct({
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
});

export const ApiResponseErrorSchema = Schema.Struct({
  message: Schema.String,
  errors: Schema.mutable(
    Schema.Array(
      Schema.Struct({
        message: Schema.String,
      }),
    ),
  ),
});

export const ApiResponseSchema = Schema.Union(
  ApiResponseDataSchema,
  ApiResponseErrorSchema,
);

export type ApiResponseData = Schema.Schema.Type<typeof ApiResponseDataSchema>;

export type SearchResults = {
  total_count: number;
  items: {
    title: string;
    repository_url: string;
    user: {
      login: string;
    };
  }[];
};

export type ContributorStats = {
  username: string;
  opened: SearchResults;
  merged: SearchResults;
  reviews: SearchResults;
};
