/**
 * strips the specified string prefix from the input string
 */
export function stripPrefix(
  str: string | undefined,
  prefix: string,
): string | undefined {
  return str && str.startsWith(prefix) ? str.slice(prefix.length) : str;
}

export function trimMultiline(str: string) {
  return str
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}
