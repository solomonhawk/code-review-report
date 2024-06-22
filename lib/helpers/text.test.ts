import { trimMultiline } from "./text";

describe("text", () => {
  describe("trimMultiline", () => {
    it("should trim multiline string", () => {
      expect(trimMultiline("  \na\n  b  \n  c\n\n")).toBe("a\nb\nc");
    });
  });
});
