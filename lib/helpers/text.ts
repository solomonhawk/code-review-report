export function trimMultiline(str: string) {
  return str
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}
