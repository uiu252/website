import { createMatrix } from "./matrix.js";
import { createTornado } from "./tornado.js";

const canvas = document.querySelector("#tornado-canvas");
const labelLayer = document.querySelector("#label-layer");
const nav = document.querySelector("#site-nav");
const caption = document.querySelector("#caption");
const greeting = document.querySelector("#greeting");
const greetingWord = document.querySelector(".greeting-word");
const tornado = createTornado({ canvas, labelLayer, nav, caption, greeting });

const resumeLink = document.querySelector('[data-action="resume"]');
const contactLink = document.querySelector('[data-action="contact"]');

resumeLink.addEventListener("click", () => {
  sessionStorage.setItem("matrixTornadoReturnToFinal", "1");
});

contactLink.addEventListener("click", (event) => {
  event.preventDefault();
  greetingWord.textContent = "usmanrashid.7865@gmail.com";
  greetingWord.classList.add("email");
});

if (sessionStorage.getItem("matrixTornadoReturnToFinal") === "1") {
  sessionStorage.removeItem("matrixTornadoReturnToFinal");
  document.querySelector("#matrix-screen")?.remove();
  caption.textContent = "";
  greetingWord.textContent = "welcome";
  greetingWord.classList.remove("email");
  tornado.showFinal();
} else {
  createMatrix({
    root: document.querySelector("#matrix"),
    onBegin: () => {
      caption.textContent = "";
    },
    onDissolve: () => {
      tornado.begin();
    },
  });
}
