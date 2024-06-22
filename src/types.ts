export const formatters = ["text", "json", "slack", "markdown"] as const;

export type Format = (typeof formatters)[number];

export const channels = ["slack", "notion"] as const;

export type Channel = (typeof channels)[number];
