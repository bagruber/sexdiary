/**
 * Einstiegspunkt der Informationsseite. Wie bei der Designseite liegt
 * der Inhalt in `page.ts`, damit er ohne Browser gerendert werden kann.
 */
import { render, themeStyles } from "./page";
import "./info.css";

const root = document.getElementById("root")!;

// Der Build hat Markup und Theme-Variablen bereits hineingeschrieben.
// Fehlt beides — etwa im Dev-Server —, wird hier nachgeholt.
if (!root.firstElementChild) {
  const style = document.createElement("style");
  style.textContent = themeStyles();
  document.head.append(style);
  root.innerHTML = render();
}

function mount(scheme: "light" | "dark") {
  document.documentElement.dataset.theme = scheme;
  document.getElementById("theme")!.onclick = () => {
    mount(scheme === "dark" ? "light" : "dark");
  };
}

mount(
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);
