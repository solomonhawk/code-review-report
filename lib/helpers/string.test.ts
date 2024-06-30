import { trimMultiline } from "./string";
import { stripPrefix } from "./string";

describe("string", () => {
  describe("trimMultiline", () => {
    it("should trim multiline string", () => {
      expect(trimMultiline("  \na\n  b  \n  c\n\n")).toBe("a\nb\nc");
    });
  });

  describe("stripPrefix", () => {
    it("should strip prefix from the input string", () => {
      expect(stripPrefix("Hello, world!", "Hello, ")).toBe("world!");
    });

    it("should return undefined if the input string is undefined", () => {
      expect(stripPrefix(undefined, "prefix")).toBeUndefined();
    });

    it("should return the input string if the prefix is not found", () => {
      expect(stripPrefix("Hello, world!", "Goodbye, ")).toBe("Hello, world!");
    });
  });
});
