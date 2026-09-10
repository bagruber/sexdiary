import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { render, themeStyles } from "./src/info/page.ts";
import { beispielQrs } from "./src/info/beispiele.ts";

/**
 * Rendert die Informationsseite zur Bauzeit in index.html.
 *
 * Sie traegt Impressum und Datenschutzerklaerung; eine Seite, die dafuer
 * erst JavaScript ausfuehren muss, zeigt ohne JavaScript nichts. Genau
 * dafuer ist `render()` ohne DOM gebaut. Das Skript bleibt geladen, es
 * hat danach nur noch den Umschalter zu tun.
 */
const prerenderInfo = {
  name: "prerender-info",
  transformIndexHtml: {
    order: "pre" as const,
    handler(html: string, ctx: { filename: string }) {
      if (!ctx.filename.endsWith("index.html")) return html;
      return html
        .replace("</head>", `<style>${themeStyles()}</style></head>`)
        .replace('<div id="root"></div>', `<div id="root">${render(beispielQrs())}</div>`);
    },
  },
};

export default defineConfig({
  base: "./",
  plugins: [react(), prerenderInfo],
  build: {
    // GitHub Pages serves from /docs on main.
    outDir: "../../docs",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // index.html is the public information page (ADR-0001): no user,
        // no health data, no connection to the app.
        index: fileURLToPath(new URL("index.html", import.meta.url)),
        // demo.html is the tracker, kept as a labelled demonstration that
        // stores nothing. It used to be index.html.
        demo: fileURLToPath(new URL("demo.html", import.meta.url)),
        // design.html is an internal reference page, deliberately not
        // linked from anywhere and marked noindex.
        design: fileURLToPath(new URL("design.html", import.meta.url)),
      },
    },
  },
});
