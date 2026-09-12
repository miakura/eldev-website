import { createRuntime, isCompactViewport, type Runtime } from "./kit";

type ThreeModule = typeof import("three");

function addLights(
  THREE: ThreeModule,
  scene: Runtime["scene"],
  accent: number,
  fill: number,
): void {
  scene.add(new THREE.AmbientLight(0xb7a0ff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.position.set(2.2, 2.8, 3.4);
  const rim = new THREE.PointLight(accent, 1.8, 10);
  rim.position.set(-2, -0.4, 2.2);
  const cool = new THREE.PointLight(fill, 1.2, 10);
  cool.position.set(1.6, -1.2, 1.4);
  scene.add(key, rim, cool);
}

export function buildHeroScene(THREE: ThreeModule, canvas: HTMLCanvasElement): Runtime {
  const runtime = createRuntime(THREE, canvas);
  const { scene, camera } = runtime;
  camera.position.set(0, 0.12, 4.1);
  addLights(THREE, scene, 0x52dfff, 0x8a5cff);

  const group = new THREE.Group();
  scene.add(group);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.02, 2),
    new THREE.MeshStandardMaterial({
      color: 0x8a5cff,
      emissive: 0x24124a,
      metalness: 0.4,
      roughness: 0.28,
      flatShading: true,
    }),
  );
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.32, 1),
    new THREE.MeshStandardMaterial({
      color: 0x52dfff,
      transparent: true,
      opacity: 0.16,
      wireframe: true,
    }),
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.62, 0.03, 12, isCompactViewport() ? 64 : 96),
    new THREE.MeshBasicMaterial({ color: 0xb7a0ff, transparent: true, opacity: 0.6 }),
  );
  ring.rotation.x = Math.PI / 2.55;
  group.add(core, shell, ring);

  runtime.setTick((t, pointer) => {
    const ty = t * 0.22 + pointer.x * 0.28;
    const tx = pointer.y * 0.18;
    group.rotation.y += (ty - group.rotation.y) * 0.08;
    group.rotation.x += (tx - group.rotation.x) * 0.08;
    core.rotation.y = -t * 0.28;
    shell.rotation.y = t * 0.16;
    ring.rotation.z = t * 0.3;
  });

  return runtime;
}

export function buildProjectsScene(THREE: ThreeModule, canvas: HTMLCanvasElement): Runtime {
  const runtime = createRuntime(THREE, canvas);
  const { scene, camera } = runtime;
  camera.position.set(0, 0, 3.6);
  addLights(THREE, scene, 0x8a5cff, 0x52dfff);

  const group = new THREE.Group();
  scene.add(group);

  const rings = [1.05, 1.35, 1.65].map((radius, index) => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.028, 10, isCompactViewport() ? 48 : 80),
      new THREE.MeshStandardMaterial({
        color: index === 1 ? 0x52dfff : 0xb7a0ff,
        metalness: 0.55,
        roughness: 0.3,
        emissive: index === 1 ? 0x12333a : 0x1a1240,
      }),
    );
    mesh.rotation.x = Math.PI / 2.2 + index * 0.18;
    mesh.rotation.y = index * 0.4;
    group.add(mesh);
    return mesh;
  });

  const hub = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.42, 0),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x4a2ea8,
      metalness: 0.2,
      roughness: 0.35,
    }),
  );
  group.add(hub);

  runtime.setTick((t, pointer) => {
    const ty = t * 0.28 + pointer.x * 0.3;
    const tx = 0.22 + pointer.y * 0.2;
    group.rotation.y += (ty - group.rotation.y) * 0.08;
    group.rotation.x += (tx - group.rotation.x) * 0.08;
    rings.forEach((ring, index) => {
      ring.rotation.z = t * (0.2 + index * 0.1);
    });
    hub.rotation.y = -t * 0.65;
    hub.rotation.x = t * 0.35;
  });

  return runtime;
}

export function buildAboutScene(THREE: ThreeModule, canvas: HTMLCanvasElement): Runtime {
  const runtime = createRuntime(THREE, canvas);
  const { scene, camera } = runtime;
  camera.position.set(0, 0.2, 4.2);
  addLights(THREE, scene, 0xb7a0ff, 0x52dfff);

  const group = new THREE.Group();
  scene.add(group);

  const span = isCompactViewport() ? 1 : 2;
  for (let x = -span; x <= span; x += 1) {
    for (let y = -span; y <= span; y += 1) {
      for (let z = -span; z <= span; z += 1) {
        if (Math.abs(x) + Math.abs(y) + Math.abs(z) < 2) {
          continue;
        }
        if ((x + y + z) % 2 !== 0) {
          continue;
        }
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.28, 0.28),
          new THREE.MeshStandardMaterial({
            color: Math.abs(z) === span ? 0x52dfff : 0x8a5cff,
            metalness: 0.45,
            roughness: 0.32,
            emissive: 0x140c28,
          }),
        );
        cube.position.set(x * 0.48, y * 0.48, z * 0.48);
        group.add(cube);
      }
    }
  }

  runtime.setTick((t, pointer) => {
    const ty = t * 0.18 + pointer.x * 0.32;
    const tx = 0.3 + pointer.y * 0.22;
    group.rotation.y += (ty - group.rotation.y) * 0.08;
    group.rotation.x += (tx - group.rotation.x) * 0.08;
    group.position.y = Math.sin(t * 1.1) * 0.05;
  });

  return runtime;
}

export function buildContactScene(THREE: ThreeModule, canvas: HTMLCanvasElement): Runtime {
  const runtime = createRuntime(THREE, canvas);
  const { scene, camera } = runtime;
  camera.position.set(0, 0.05, 3.8);
  addLights(THREE, scene, 0x52dfff, 0xb7a0ff);

  const group = new THREE.Group();
  scene.add(group);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, isCompactViewport() ? 20 : 32, isCompactViewport() ? 20 : 32),
    new THREE.MeshStandardMaterial({
      color: 0x6b4dff,
      emissive: 0x2a1860,
      metalness: 0.25,
      roughness: 0.35,
    }),
  );
  group.add(core);

  const orbit = new THREE.Group();
  group.add(orbit);
  const satellites = [0x52dfff, 0xb7a0ff, 0xffffff].map((color, index) => {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        metalness: 0.1,
        roughness: 0.4,
      }),
    );
    const angle = (index / 3) * Math.PI * 2;
    node.position.set(Math.cos(angle) * 1.35, Math.sin(angle * 1.4) * 0.35, Math.sin(angle) * 1.35);
    orbit.add(node);
    return node;
  });

  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.018, 8, isCompactViewport() ? 48 : 72),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }),
  );
  belt.rotation.x = Math.PI / 2.4;
  group.add(belt);

  runtime.setTick((t, pointer) => {
    const ty = t * 0.24 + pointer.x * 0.26;
    const tx = pointer.y * 0.16;
    group.rotation.y += (ty - group.rotation.y) * 0.08;
    group.rotation.x += (tx - group.rotation.x) * 0.08;
    core.scale.setScalar(1 + Math.sin(t * 1.8) * 0.02);
    orbit.rotation.y = t * 0.55;
    orbit.rotation.z = t * 0.15;
    belt.rotation.z = -t * 0.32;
    satellites.forEach((node, index) => {
      node.position.y = Math.sin(t * 1.5 + index) * 0.36;
    });
  });

  return runtime;
}
