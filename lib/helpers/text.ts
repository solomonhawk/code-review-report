export function trimMultiline(str: string) {
  return str
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}
