import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      // Core is consumed as TypeScript source; no build step needed.
      "@sexdiary/core": fileURLToPath(
        new URL("../../packages/core/src/index.ts", import.meta.url),
      ),
    },
  },
  build: {
    // GitHub Pages serves from /docs on main.
    outDir: "../../docs",
    emptyOutDir: true,
  },
});
