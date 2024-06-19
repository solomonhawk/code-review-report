export const formatters = ["text", "json", "slack", "markdown"] as const;

export type Format = (typeof formatters)[number];
