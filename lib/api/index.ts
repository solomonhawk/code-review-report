import { Schema } from "@effect/schema";
import * as Effect from "effect/Effect";
import parseLinkHeader from "parse-link-header";
import type { Stats } from "~/lib/types";
import { ApiError } from "./error";
import { ApiResponseSchema, type SearchResults } from "./types";
import * as Layer from "effect/Layer";
import * as Config from "effect/Config";
// import * as ConfigError from "effect/ConfigError";

export class Api extends Effect.Tag("Api")<
  Api,
  {
    getStats: (
      author: string,
      dateRange: readonly [Date, Date],
    ) => Effect.Effect<Stats, ApiError>;
    // ) => Effect.Effect<Stats, ApiError | ConfigError.ConfigError>;
  }
>() {
  static Live = Layer.effect(
    Api,
    Effect.gen(function* () {
      const token = yield* Config.string("GH_TOKEN");

      return {
        getStats: (author, dateRange) => {
          return Effect.promise(async () => {
            const [openedPromise, mergedPromise, reviewsPromise] =
              await Promise.all([
                pullRequestsOpened(token, author, dateRange),
                pullRequestsMerged(token, author, dateRange),
                pullRequestReviews(token, author, dateRange),
              ]);

            return {
              opened: openedPromise.total_count,
              merged: mergedPromise.total_count,
              reviews: reviewsPromise.total_count,
            };
          });
        },
      };
    }),
  );
}

export const pullRequestsOpened = async (
  token: string,
  author: string,
  dateRange: readonly [Date, Date],
): Promise<SearchResults> => {
  return query(
    `https://api.github.com/search/issues?q=type:pr+author:${author}`,
    token,
    dateRange,
  );
};

export const pullRequestsMerged = async (
  token: string,
  author: string,
  dateRange: readonly [Date, Date],
): Promise<SearchResults> => {
  return query(
    `https://api.github.com/search/issues?q=type:pr+is:merged+author:${author}`,
    token,
    dateRange,
  );
};

export const pullRequestReviews = async (
  token: string,
  commenter: string,
  dateRange: readonly [Date, Date],
): Promise<SearchResults> => {
  return query(
    `https://api.github.com/search/issues?q=type:pr+commenter:${commenter}+-author:${commenter}`,
    token,
    dateRange,
  );
};

/**
 * @NOTE(shawk): GitHub's search API returns up to 1000 results per page, so
 * in most cases we should be able to query all the data we need in a single
 * request. However, if we're querying for a large date range, we may need to
 * make multiple requests to get all the data (using the `Link` header to
 * traverse subsequent pages of results).
 *
 * @NOTE(shawk): GitHub's search API is rate limited to 30 requests per minute.
 * If we're querying for a large date range, we may need to account for an API
 * response that indicates we've exceeded the rate limit (status 403 with
 * `x-ratelimit-remaining` header set to 0). In that case, we'll wait until the
 * time indicated in `x-ratelimit-reset` and try again (up to 3 times, before
 * giving up entirely).
 */
async function query(
  url: string,
  token: string,
  [startDate, endDate]: readonly [Date, Date],
): Promise<SearchResults> {
  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  const results: SearchResults["items"] = [];
  let total_count = 0;
  let page = 1;
  let lastPage = 1;
  let nextUrl = `${url}+created:${start}..${end}&per_page=1000&page=${page}`;

  while (nextUrl && lastPage >= page) {
    if (process.env.DEBUG) {
      console.log(`Fetching page ${page} of ${lastPage}... (${nextUrl})`);
    }

    const { links, data } = await queryPage(nextUrl, token);

    total_count = data.total_count;
    results.push(...data.items);

    if (links) {
      lastPage = Number(links.last?.page || lastPage);
      nextUrl = links.next?.url;
    }

    page++;
  }

  return {
    _tag: "ApiResponseData",
    total_count,
    items: results,
  };
}

async function queryPage(
  url: string,
  token: string,
  retries = 0,
): Promise<{
  links: ReturnType<typeof parseLinkHeader>;
  data: SearchResults;
}> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    // we got rate limited and retried too many times, so we give up
    if (retries > 3) {
      throw new Error("Retried 3 times, giving up.");
    }

    // we got rate limited, so we wait until the rate limit resets and try again
    if (exceededRateLimit(response)) {
      await waitForRateLimitReset(response);
      return queryPage(url, token, retries + 1);
    }

    // something went horribly wrong :(
    throw new Error("Failed to get a response!");
  }

  const json = await response.json();
  const responseData = Schema.decodeUnknownSync(ApiResponseSchema)(json);

  if ("errors" in responseData) {
    throw new Error(responseData.errors[0].message);
  }

  return {
    links: parseLinkHeader(response.headers.get("Link")),
    data: responseData,
  };
}

function exceededRateLimit(response: Response) {
  return (
    response.status === 403 &&
    response.headers.get("x-ratelimit-remaining") === "0"
  );
}

async function waitForRateLimitReset(response: Response) {
  const reset = new Date(
    Number(response.headers.get("x-ratelimit-reset")) * 1000,
  );

  const waitTimeMs = reset.getTime() - Date.now();

  if (process.env.DEBUG) {
    console.log(
      `Rate limit exceeded. Waiting ${
        waitTimeMs / 1000
      } seconds to try again...`,
    );
  }

  await sleep(waitTimeMs + 1000);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
