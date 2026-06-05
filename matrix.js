import { easeInOut, easeOut, fade, sleep, tween } from "./animate.js";

const startMatrix = [
  [1, 2, 3],
  [2, 5, 4],
  [3, 7, 7],
];

const reducedMatrix = [
  [1, 0, -1],
  [0, 1, 2],
  [0, 0, 0],
];

export function createMatrix({ root, onBegin, onDissolve }) {
  const grid = root.querySelector(".matrix-grid");
  const brackets = root.querySelectorAll(".bracket");
  let started = false;

  startMatrix.flat().forEach((value, index) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.type = "button";
    cell.textContent = value;
    cell.dataset.index = index;
    cell.setAttribute("aria-label", `Matrix value ${value}`);

    if (index === 5) {
      cell.classList.add("hot");
      cell.textContent = "0";
      cell.setAttribute("aria-label", "Begin animation");
    }

    grid.append(cell);
  });

  const cells = Array.from(grid.querySelectorAll(".cell"));

  root.addEventListener("click", () => {
    if (started) return;
    started = true;
    onBegin();
    morph(cells, brackets).then(() => dissolve(root, cells, brackets, onDissolve));
  });

  return { cells };
}

function morph(cells, brackets) {
  const targets = reducedMatrix.flat();
  const pivots = new Set([0, 4]);
  const tweens = [];

  cells.forEach((cell, index) => {
    const from = Number(cell.textContent);
    const to = targets[index];

    if (pivots.has(index)) {
      tweens.push(sleep(150 + index * 30).then(() => {
        cell.style.color = "#cc0000";
      }));
    }

    tweens.push(tween({
      delay: index * 80,
      duration: 1300,
      ease: easeInOut,
      onUpdate: (t) => {
        cell.textContent = String(Math.round(from + (to - from) * t));
      },
    }));

    tweens.push(sleep(1550).then(() => {
      cell.style.color = pivots.has(index) ? "#cc0000" : "#000";
    }));
  });

  tweens.push(sleep(500).then(async () => {
    brackets.forEach((bracket) => {
      bracket.animate([
        { transform: "scaleY(1)" },
        { transform: "scaleY(1.04)" },
        { transform: "scaleY(1)" },
      ], { duration: 400, easing: "ease-in-out" });
    });
  }));

  return Promise.all(tweens);
}

function dissolve(root, cells, brackets, onDissolve) {
  const rootBox = root.getBoundingClientRect();
  const clones = cells.map((cell) => {
    const box = cell.getBoundingClientRect();
    const clone = document.createElement("span");
    clone.className = "cell fly";
    clone.textContent = cell.textContent;
    clone.style.setProperty("--x", `${box.left - rootBox.left + box.width / 2}px`);
    clone.style.setProperty("--y", `${box.top - rootBox.top + box.height / 2}px`);
    root.append(clone);
    cell.style.visibility = "hidden";
    return clone;
  });

  const animations = [];

  animations.push(tween({
    duration: 1400,
    ease: easeInOut,
    onUpdate: (t) => {
      root.style.transform = `rotate(${360 * t}deg)`;
    },
  }));

  animations.push(Promise.all(Array.from(brackets).map((bracket) => fade(bracket, 0, 250, 620))));

  clones.forEach((clone, index) => {
    const angle = (index / clones.length) * Math.PI * 2 + 0.5;
    const distance = 420 + index * 28;
    animations.push(tween({
      delay: 820 + index * 25,
      duration: 950,
      ease: easeOut,
      onUpdate: (t) => {
        clone.style.transform = `translate(${Math.cos(angle) * distance * t}px, ${Math.sin(angle) * distance * t}px)`;
        clone.style.opacity = String(1 - t);
      },
    }));
  });

  Promise.all(animations).then(() => {
    root.parentElement.remove();
    onDissolve();
  });
}
