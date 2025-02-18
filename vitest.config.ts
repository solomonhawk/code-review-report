import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    mockReset: true,
    globals: true,
    reporters: ["dot"],
    sequence: {
      concurrent: true,
    },
  },
});
