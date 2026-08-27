import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    // GitHub Pages serves from /docs on main.
    outDir: "../../docs",
    emptyOutDir: true,
  },
});
