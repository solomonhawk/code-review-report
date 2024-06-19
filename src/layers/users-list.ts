import { Layer } from "effect";
import * as Effect from "effect/Effect";
import { usernames } from "~/data/usernames";

export class UsersList extends Effect.Tag("UsersList")<
  UsersList,
  {
    usernames: string[];
  }
>() {
  static Live = Layer.succeed(UsersList, UsersList.of({ usernames }));
}
