/**
 * Einstiegspunkt der Doku-Seite: Stylesheet, Themes als Custom
 * Properties, und der Umschalter. Der Inhalt liegt in `page.ts`.
 */
import { render, themeStyles } from "./page";
import "./design.css";

const style = document.createElement("style");
style.textContent = themeStyles();
document.head.append(style);

const root = document.getElementById("root")!;

function mount(scheme: "light" | "dark") {
  document.documentElement.dataset.theme = scheme;
  root.innerHTML = render(scheme);
  document.getElementById("theme")!.addEventListener("click", () => {
    mount(scheme === "dark" ? "light" : "dark");
  });
}

mount(
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);
