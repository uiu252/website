import * as THREE from "three";
import { easeInOut, sleep, tween } from "./animate.js";

export function createTornado({ canvas, labelLayer, nav, caption, greeting }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 1, 3000);
  const target = new THREE.Vector3(0, 0, 0);
  const symbols = [];
  const world = new THREE.Group();
  const motion = { spin: 0.0025 };
  scene.add(world);

  for (let i = 0; i < 310; i += 1) {
    const item = makeSymbol(i);
    labelLayer.append(item.element);
    symbols.push(item);
    world.add(item.anchor);
  }

  camera.position.set(0, 0, 820);
  camera.lookAt(target);

  function resize() {
    const { innerWidth, innerHeight } = window;
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }

  function render() {
    world.rotation.z += motion.spin;
    renderer.render(scene, camera);
    placeLabels(symbols, camera, renderer.domElement);
    requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize);
  resize();
  render();

  function begin() {
    canvas.style.opacity = "1";
    labelLayer.style.opacity = "1";
    caption.style.opacity = "0";
    greeting.classList.remove("visible");
    nav.classList.remove("visible");
    const jobs = [];

    symbols.forEach((item) => {
      if (!item.anchor.userData.final) return;
      const final = item.anchor.userData.final;
      const start = item.anchor.userData.scatter;
      item.anchor.position.copy(start);
      jobs.push(tween({
        delay: item.anchor.userData.delay * 1000,
        duration: 2000,
        ease: easeInOut,
        onUpdate: (t) => {
          item.anchor.position.set(
            start.x + (final.x - start.x) * t,
            start.y + (final.y - start.y) * t,
            start.z + (final.z - start.z) * t,
          );
        },
      }));
    });

    jobs.push(sleep(1900).then(() => tween({
      duration: 6000,
      ease: easeInOut,
      onUpdate: (t) => {
        camera.position.z = 820 + (-330 - 820) * t;
        target.set(0, 0, camera.position.z - 110);
        camera.lookAt(target);
      },
    })));

    jobs.push(sleep(7950).then(() => {
      const startCamera = camera.position.clone();
      const startUp = camera.up.clone();
      return tween({
        duration: 1550,
        ease: easeInOut,
        onUpdate: (t) => {
          camera.up.set(
            startUp.x + (0 - startUp.x) * t,
            startUp.y + (0 - startUp.y) * t,
            startUp.z + (1 - startUp.z) * t,
          ).normalize();
          camera.position.set(
            startCamera.x + (0 - startCamera.x) * t,
            startCamera.y + (-1250 - startCamera.y) * t,
            startCamera.z + (-300 - startCamera.z) * t,
          );
          motion.spin = 0.0025 * (1 - t);
          target.set(0, 0, -300);
          camera.lookAt(target);
        },
      });
    }));

    sleep(10350).then(() => {
      greeting.classList.add("visible");
      nav.classList.add("visible");
    });
    return Promise.all(jobs);
  }

  function showFinal() {
    symbols.forEach((item) => {
      if (item.anchor.userData.final) {
        item.anchor.position.copy(item.anchor.userData.final);
      }
    });
    canvas.style.opacity = "1";
    labelLayer.style.opacity = "1";
    caption.style.opacity = "0";
    camera.up.set(0, 0, 1);
    camera.position.set(0, -1250, -300);
    target.set(0, 0, -300);
    camera.lookAt(target);
    motion.spin = 0;
    greeting.classList.add("visible");
    nav.classList.add("visible");
  }

  return { begin, showFinal };
}

function makeSymbol(index) {
  const element = document.createElement("span");
  element.className = "symbol";
  element.textContent = index % 7 === 0 ? "1" : "0";
  if (index === 262) element.classList.add("red");

  const anchor = new THREE.Object3D();
  const t = index / 309;
  const z = 300 - t * 830;
  const theta = t * Math.PI * 15.5;
  const radius = 285 - t * 235 + Math.sin(t * Math.PI * 5) * 26;
  const wobble = Math.sin(index * 2.13) * 14;
  const x = (radius + wobble) * Math.cos(theta);
  const y = (radius + wobble) * Math.sin(theta);

  anchor.userData.final = new THREE.Vector3(x, y, z);
  anchor.userData.scatter = new THREE.Vector3(
    (Math.random() - 0.5) * 520,
    (Math.random() - 0.5) * 380,
    (Math.random() - 0.5) * 360,
  );
  anchor.userData.delay = Math.random() * 0.65;
  anchor.position.copy(anchor.userData.final);

  return { element, anchor, scale: 1 };
}

function placeLabels(items, camera, canvas) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const cameraPosition = camera.position;

  items.forEach((item) => {
    const pos = item.anchor.getWorldPosition(new THREE.Vector3());
    const projected = pos.clone().project(camera);
    const visible = projected.z > -1 && projected.z < 1;
    const x = (projected.x * 0.5 + 0.5) * width;
    const y = (-projected.y * 0.5 + 0.5) * height;
    const distance = cameraPosition.distanceTo(pos);
    const scale = Math.max(0.55, Math.min(1.6, 700 / distance)) * item.scale;

    item.element.style.opacity = visible ? "1" : "0";
    item.element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
  });
}
