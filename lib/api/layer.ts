import * as Http from "@effect/platform/HttpClient";
import { Schema } from "@effect/schema";
import { pipe } from "effect";
import * as Array from "effect/Array";
import * as Chunk from "effect/Chunk";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Record from "effect/Record";
import * as Schedule from "effect/Schedule";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import parseLinkHeader from "parse-link-header";

import { stripPrefix } from "~/lib/helpers/string";
import {
  ApiError,
  ApiResponseErrorSchema,
  ApiResponseSchema,
  TimeoutError,
  type ApiResponseData,
  type ContributorStats,
  type SearchResults,
} from "./types";

type HttpClient = Http.client.Client<
  Http.response.ClientResponse,
  Http.error.HttpClientError,
  Scope.Scope
>;

const BASE_API_URL = "https://api.github.com";

export class Api extends Effect.Tag("Api")<
  Api,
  {
    getContributorStats: (
      contributorUsernames: string[],
      dateRange: readonly [Date, Date],
    ) => Effect.Effect<Record<string, ContributorStats>, ApiError>;
  }
>() {
  static Live = Layer.effect(
    Api,
    Effect.gen(function* () {
      const token = yield* Config.string("GH_TOKEN");
      const defaultClient = yield* Http.client.Client;

      const httpClient = defaultClient.pipe(
        Http.client.filterStatus((status) => status >= 200 && status < 500),
        Http.client.mapRequest(Http.request.prependUrl(BASE_API_URL)),
        Http.client.mapRequest(
          Http.request.setHeaders({
            Authorization: `Bearer ${token}`,
            accept: "application/vnd.github.v3+json",
          }),
        ),
      );

      return {
        getContributorStats: (contributorUsernames, dateRange) => {
          return Effect.gen(function* () {
            yield* Effect.logInfo(
              `Getting contributor stats for ${contributorUsernames.join(", ")} between ${dateRange[0]} and ${dateRange[1]}...`,
            );

            const contributorStats = yield* Effect.forEach(
              contributorUsernames,
              (username) => {
                return Effect.gen(function* () {
                  const [openedPrs, mergedPrs, reviews] = yield* Effect.all(
                    [
                      pullRequestsOpened(httpClient, username, dateRange),
                      pullRequestsMerged(httpClient, username, dateRange),
                      pullRequestReviews(httpClient, username, dateRange),
                    ],
                    { concurrency: "unbounded" },
                  );

                  yield* Effect.logInfo(`Fetched stats for ${username}`);

                  return {
                    username,
                    opened: openedPrs,
                    merged: mergedPrs,
                    reviews: reviews,
                  };
                });
              },
              { concurrency: "unbounded" },
            );

            yield* Effect.logInfo(
              "Successfully fetched contributor stats for all users",
            );

            return pipe(
              contributorStats,
              Array.map((stats) => [stats.username, stats] as const),
              Record.fromEntries,
            );
          }).pipe(Effect.withSpan("Api::getContributorStats"));
        },
      };
    }),
  );
}

export const pullRequestsOpened = (
  httpClient: HttpClient,
  author: string,
  dateRange: readonly [Date, Date],
): Effect.Effect<SearchResults, ApiError> => {
  return query(
    httpClient,
    `opened PRs by ${author}`,
    `/search/issues?q=type:pr+author:${author}`,
    `Getting pull requests opened by ${author}`,
    dateRange,
  );
};

export const pullRequestsMerged = (
  httpClient: HttpClient,
  author: string,
  dateRange: readonly [Date, Date],
): Effect.Effect<SearchResults, ApiError> => {
  return query(
    httpClient,
    `merged PRs by ${author}`,
    `/search/issues?q=type:pr+is:merged+author:${author}`,
    `Getting pull requests merged by ${author}`,
    dateRange,
  );
};

export const pullRequestReviews = (
  httpClient: HttpClient,
  commenter: string,
  dateRange: readonly [Date, Date],
): Effect.Effect<SearchResults, ApiError> => {
  return query(
    httpClient,
    `reviews by ${commenter}`,
    `/search/issues?q=type:pr+commenter:${commenter}+-author:${commenter}`,
    `Getting reviews by ${commenter}`,
    dateRange,
  );
};

const query = (
  httpClient: HttpClient,
  label: string,
  url: string,
  description: string,
  [startDate, endDate]: readonly [Date, Date],
): Effect.Effect<SearchResults, ApiError> => {
  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  const urlWithDateFilter = `${url}+created:${start}..${end}`;

  return streamQuery(httpClient, urlWithDateFilter, label).pipe(
    Stream.runFold<SearchResults, SearchResults>(
      {
        total_count: 0,
        items: [],
      },
      (acc, { total_count, items }) => {
        return {
          total_count: acc.total_count + total_count,
          items: acc.items.concat(items),
        };
      },
    ),
    Effect.timed,
    Effect.flatMap(([duration, searchResults]) =>
      Effect.succeed(searchResults).pipe(
        Effect.tap(() => Effect.logDebug(`${description} (in ${duration})`)),
      ),
    ),
    Effect.withSpan(`query ${description}`),
  );
};
/**
 * @NOTE(shawk): GitHub's search API returns up to 1000 results per page, so
 * in most cases we should be able to query all the data we need in a single
 * request. However, if we're querying for a large date range, we may need to
 * make multiple requests to get all the data (using the `Link` header to
 * traverse subsequent pages of results).
 */
const streamQuery = (
  httpClient: HttpClient,
  url: string,
  label: string,
): Stream.Stream<SearchResults, ApiError> => {
  const initialUrl = `${url}&per_page=1000&page=1`;

  return Stream.paginateChunkEffect(initialUrl, (currentUrl) => {
    return queryPage(httpClient, currentUrl, label).pipe(
      Effect.andThen((page) => {
        return [
          Chunk.of(page.data),
          Option.isSome(page.nextUrl) ? page.nextUrl : Option.none<string>(),
        ];
      }),
    );
  });
};

/**
 * @NOTE(shawk): GitHub's search API is rate limited to 30 requests per minute.
 * If we're querying for a large date range, we may need to account for an API
 * response that indicates we've exceeded the rate limit (status 403 with
 * `x-ratelimit-remaining` header set to 0). In that case, we'll wait until the
 * time indicated in `x-ratelimit-reset` and try again (up to 5 times, before
 * giving up entirely).
 */
const queryPage = (
  httpClient: HttpClient,
  url: string,
  label: string,
): Effect.Effect<
  { data: ApiResponseData; nextUrl: Option.Option<string> },
  ApiError
> => {
  return pipe(
    Http.request.get(url),
    httpClient,

    Effect.timeoutFail({
      duration: "10 seconds",
      onTimeout: () =>
        new TimeoutError({
          message: "Timed out fetching data",
        }),
    }),

    Effect.tap(() =>
      Effect.logInfo(
        `Querying ${label}, page: ${new URL(url, BASE_API_URL).searchParams.get("page")}`,
      ),
    ),

    Effect.tap(() => Effect.logDebug(`URL: ${url}`)),

    Effect.flatMap((res) => {
      return Effect.gen(function* () {
        if (exceededRateLimit(res)) {
          yield* waitForRateLimitReset(res);

          // after waiting for the rate limit to reset, try again
          return yield* Effect.suspend(() => queryPage(httpClient, url, label));
        }

        if (res.status > 200) {
          return yield* new ApiError({
            message: "Response error",
            errors: [],
          });
        }

        return yield* Effect.succeed(res).pipe(
          // Effect.tapError(() =>
          //   Http.response.json(Effect.succeed(res)).pipe(Effect.logDebug),
          // ),
          // Effect.tapError(() => {
          //   console.log("res", res);
          //   return Effect.void;
          // }),
          Http.response.schemaBodyJsonScoped(ApiResponseSchema),
          Effect.flatMap((data) => {
            return Effect.gen(function* () {
              if (Schema.is(ApiResponseErrorSchema)(data)) {
                return yield* new ApiError(data);
              }

              return yield* Effect.succeed({
                data,
                nextUrl: Option.fromNullable(
                  stripPrefix(
                    parseLinkHeader(res.headers["link"])?.next?.url,
                    BASE_API_URL,
                  ),
                ),
              });
            });
          }),
        );
      });
    }),

    Effect.retry(
      pipe(
        Schedule.compose(Schedule.exponential(1000), Schedule.recurs(5)),
        Schedule.jittered,
      ),
    ),

    // @TODO(shawk): remove this once I figure out wtf I'm doing wrong with error handling
    Effect.tapErrorCause((cause) => {
      return Console.error(cause);
    }),

    Effect.catchTags({
      ResponseError: (e) => {
        return new ApiError({
          message: "There was a problem with the response",
          errors: [e],
        });
      },
      RequestError: (e) => {
        return new ApiError({
          message: "There was a problem sending the request",
          errors: [e],
        });
      },
      ParseError: (e) => {
        return new ApiError({
          message: "The response data does not match the schema",
          errors: [e],
        });
      },
      TimeoutError: (e) =>
        new ApiError({
          message: e.message,
          errors: [e],
        }),
    }),

    Effect.withSpan(`queryPage ${url}`),
    Effect.scoped,
  );
};

function exceededRateLimit(response: Http.response.ClientResponse) {
  return (
    response.status === 403 && response.headers["x-ratelimit-remaining"] === "0"
  );
}

function waitForRateLimitReset(response: Http.response.ClientResponse) {
  const reset = new Date(Number(response.headers["x-ratelimit-reset"]) * 1000);

  const waitTimeMs = reset.getTime() - Date.now();

  return Effect.logInfo(
    `Rate limit exceeded. Waiting ${waitTimeMs / 1000} seconds to try again...`,
  ).pipe(Effect.zipRight(Effect.sleep(waitTimeMs + 1000)));
}
