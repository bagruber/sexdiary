import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    // GitHub Pages serves from /docs on main.
    outDir: "../../docs",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // design.html is an internal reference page, deliberately not
        // linked from anywhere and marked noindex. It shares nothing with
        // the tracker but the build, so it survives wave 4.
        index: fileURLToPath(new URL("index.html", import.meta.url)),
        design: fileURLToPath(new URL("design.html", import.meta.url)),
      },
    },
  },
});
