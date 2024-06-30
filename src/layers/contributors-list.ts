/* v8 ignore start */
import { Layer } from "effect";
import * as Effect from "effect/Effect";
import { usernames } from "~/data/usernames";

export class ContributorsList extends Effect.Tag("ContributorsList")<
  ContributorsList,
  {
    usernames: string[];
  }
>() {
  static Live = Layer.succeed(ContributorsList, { usernames });
}
/* v8 ignore stop */
