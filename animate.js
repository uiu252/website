export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

export function easeOut(t) {
  return 1 - (1 - t) ** 3;
}

export function tween({ duration, delay = 0, ease = (t) => t, onUpdate, onComplete }) {
  const start = performance.now() + delay;

  return new Promise((resolve) => {
    function frame(now) {
      if (now < start) {
        requestAnimationFrame(frame);
        return;
      }

      const t = Math.min(1, (now - start) / duration);
      onUpdate(ease(t), t);

      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }

      onComplete?.();
      resolve();
    }

    requestAnimationFrame(frame);
  });
}

export function fade(element, to, duration, delay = 0) {
  const from = Number(getComputedStyle(element).opacity);
  return tween({
    duration,
    delay,
    ease: easeInOut,
    onUpdate: (t) => {
      element.style.opacity = String(from + (to - from) * t);
    },
  });
}
