type ThreeModule = typeof import("three");

export type Pointer = { x: number; y: number };

export type Runtime = {
  THREE: ThreeModule;
  renderer: InstanceType<ThreeModule["WebGLRenderer"]>;
  scene: InstanceType<ThreeModule["Scene"]>;
  camera: InstanceType<ThreeModule["PerspectiveCamera"]>;
  pointer: Pointer;
  setTick: (fn: ((t: number, pointer: Pointer) => void) | null) => void;
  dispose: () => void;
};

let threePromise: Promise<ThreeModule> | null = null;

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCompactViewport(): boolean {
  return window.matchMedia("(max-width: 760px)").matches;
}

export function loadThree(): Promise<ThreeModule> {
  if (!threePromise) {
    threePromise = import("three");
  }
  return threePromise;
}

export function paintFallback(canvas: HTMLCanvasElement, background: string): void {
  canvas.style.background = background;
}

export function whenVisible(el: Element, onShow: () => void): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        io.disconnect();
        onShow();
      }
    },
    { rootMargin: "140px 0px", threshold: 0.02 },
  );
  io.observe(el);
  return () => io.disconnect();
}

export function createRuntime(THREE: ThreeModule, canvas: HTMLCanvasElement): Runtime {
  const compact = isCompactViewport();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !compact,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.1 : 1.45));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0.1, 4);

  const target: Pointer = { x: 0, y: 0 };
  const pointer: Pointer = { x: 0, y: 0 };
  const damp = compact ? 0.035 : 0.045;
  const worldPointer = canvas.id === "worldCanvas";
  const onMove = (event: PointerEvent): void => {
    if (worldPointer) {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      target.x = (event.clientX / w) * 2 - 1;
      target.y = -((event.clientY / h) * 2 - 1);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) {
      return;
    }
    target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    target.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };
  const onLeave = (): void => {
    target.x = 0;
    target.y = 0;
  };
  const pointerRoot: Window | HTMLCanvasElement = worldPointer ? window : canvas;
  pointerRoot.addEventListener("pointermove", onMove as EventListener, { passive: true });
  if (!worldPointer) {
    canvas.addEventListener("pointerleave", onLeave, { passive: true });
  }

  const resize = (): void => {
    const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
    const height = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  let frame = 0;
  let running = false;
  let tick: ((t: number, pointer: Pointer) => void) | null = null;

  const loop = (): void => {
    frame = window.requestAnimationFrame(loop);
    pointer.x += (target.x - pointer.x) * damp;
    pointer.y += (target.y - pointer.y) * damp;
    tick?.(performance.now() * 0.001, pointer);
    renderer.render(scene, camera);
  };

  const start = (): void => {
    if (running) {
      return;
    }
    running = true;
    loop();
  };

  const stop = (): void => {
    running = false;
    window.cancelAnimationFrame(frame);
  };

  const onVisibility = (): void => {
    if (document.hidden) {
      stop();
    } else if (canvas.isConnected) {
      start();
    }
  };
  document.addEventListener("visibilitychange", onVisibility, { passive: true });

  const viewIo = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
        start();
      } else {
        stop();
      }
    },
    { threshold: 0.05 },
  );
  viewIo.observe(canvas);

  return {
    THREE,
    renderer,
    scene,
    camera,
    pointer,
    setTick(fn) {
      tick = fn;
    },
    dispose() {
      stop();
      viewIo.disconnect();
      window.removeEventListener("resize", resize);
      pointerRoot.removeEventListener("pointermove", onMove as EventListener);
      if (!worldPointer) {
        canvas.removeEventListener("pointerleave", onLeave);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((obj) => {
        const mesh = obj as {
          geometry?: { dispose: () => void };
          material?: { dispose: () => void } | Array<{ dispose: () => void }>;
        };
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((item) => item.dispose());
        } else {
          mesh.material?.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
