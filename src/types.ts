export const formatters: Format[] = [
  "text",
  "json",
  "slack-blocks",
  "markdown",
] as const;

export type Format = "text" | "json" | "slack-blocks" | "markdown";
