import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as Schema from "@effect/schema/Schema";
import { days, offset, verbose } from "~/cli/options";
import { withoutDuplicates } from "~/lib/helpers";
import { channels } from "~/lib/types";

const channelSchema = Schema.asSchema(
  Schema.mutable(
    Schema.NonEmptyArray(Schema.Literal(...channels)).annotations({
      message: () => "At least 1 channel is required",
    }),
  ),
).pipe(withoutDuplicates);

export const channel = Options.choice("channel", channels).pipe(
  Options.withAlias("c"),
  Options.withDescription("Where to publish"),
  Options.repeated,
  Options.withSchema(channelSchema),
);

export const options = { days, offset, channel, verbose };

export type PublishOpts = Command.Command.ParseConfig<typeof options>;
