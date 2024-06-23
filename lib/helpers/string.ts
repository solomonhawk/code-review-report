/**
 * strips the specified string prefix from the input string
 */
export function stripPrefix(
  str: string | undefined,
  prefix: string,
): string | undefined {
  return str && str.startsWith(prefix) ? str.slice(prefix.length) : str;
}
