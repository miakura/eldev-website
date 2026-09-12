import {
  createRuntime,
  isCompactViewport,
  loadThree,
  paintFallback,
  prefersReducedMotion,
  type Runtime,
} from "./kit";

type ThreeModule = typeof import("three");

type LabelDef = {
  text: string;
  color: string;
};

type LangTraveler = {
  sprite: InstanceType<ThreeModule["Sprite"]>;
  texture: InstanceType<ThreeModule["CanvasTexture"]>;
  material: InstanceType<ThreeModule["SpriteMaterial"]>;
  label: LabelDef;
  ring: number;
  angle: number;
  tilt: number;
  progress: number;
  speed: number;
  state: "travel" | "shatter" | "wait";
  shatterT: number;
  waitUntil: number;
  baseScale: number;
};

type LabelShard = {
  sprite: InstanceType<ThreeModule["Sprite"]>;
  texture: InstanceType<ThreeModule["CanvasTexture"]>;
  material: InstanceType<ThreeModule["SpriteMaterial"]>;
  vel: { x: number; y: number; z: number };
  spin: number;
  life: number;
  maxLife: number;
  baseScaleX: number;
  baseScaleY: number;
};

const LANG_LABELS: LabelDef[] = [
  { text: "JavaScript", color: "#f7df1e" },
  { text: "TypeScript", color: "#7dd3fc" },
  { text: "Python", color: "#86efac" },
  { text: "Go", color: "#67e8f9" },
  { text: "PHP", color: "#c4b5fd" },
  { text: "React", color: "#38bdf8" },
  { text: "Node.js", color: "#4ade80" },
  { text: "SQL", color: "#fda4af" },
  { text: "Docker", color: "#93c5fd" },
  { text: "REST", color: "#fdba74" },
  { text: "GraphQL", color: "#f9a8d4" },
  { text: "CSS", color: "#a5b4fc" },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function createMaterials(THREE: ThreeModule) {
  return {
    crystal: new THREE.MeshStandardMaterial({
      color: 0x3dffd0,
      emissive: 0x0a3d34,
      metalness: 0.55,
      roughness: 0.22,
      flatShading: true,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: 0x1a2430,
      emissive: 0x071018,
      metalness: 0.7,
      roughness: 0.35,
    }),
    wire: new THREE.MeshBasicMaterial({
      color: 0x7af0d4,
      transparent: true,
      opacity: 0.28,
      wireframe: true,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xffc857,
      emissive: 0x3a2a08,
      metalness: 0.6,
      roughness: 0.28,
    }),
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawLabelCanvas(label: LabelDef): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return canvas;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(6, 12, 16, 0.62)";
  roundRect(ctx, 10, 12, 236, 56, 14);
  ctx.fill();
  ctx.strokeStyle = `${label.color}66`;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 10, 12, 236, 56, 14);
  ctx.stroke();
  ctx.fillStyle = label.color;
  ctx.font = "700 26px Manrope, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = `${label.color}77`;
  ctx.shadowBlur = 10;
  ctx.fillText(label.text, canvas.width / 2, canvas.height / 2 + 1);
  return canvas;
}

function makeLabelSprite(
  THREE: ThreeModule,
  label: LabelDef,
): {
  sprite: InstanceType<ThreeModule["Sprite"]>;
  texture: InstanceType<ThreeModule["CanvasTexture"]>;
  material: InstanceType<ThreeModule["SpriteMaterial"]>;
} {
  const canvas = drawLabelCanvas(label);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: 0.88,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.42, 0.14, 1);
  return { sprite, texture, material };
}

function applyLabelToTraveler(THREE: ThreeModule, item: LangTraveler, label: LabelDef): void {
  item.texture.dispose();
  const canvas = drawLabelCanvas(label);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  item.texture = texture;
  item.material.map = texture;
  item.material.needsUpdate = true;
  item.label = label;
}

function sliceLabelShards(
  THREE: ThreeModule,
  label: LabelDef,
  cols: number,
  rows: number,
): Array<{
  texture: InstanceType<ThreeModule["CanvasTexture"]>;
  material: InstanceType<ThreeModule["SpriteMaterial"]>;
  sprite: InstanceType<ThreeModule["Sprite"]>;
  u: number;
  v: number;
}> {
  const source = drawLabelCanvas(label);
  const pieceW = Math.floor(source.width / cols);
  const pieceH = Math.floor(source.height / rows);
  const out: Array<{
    texture: InstanceType<ThreeModule["CanvasTexture"]>;
    material: InstanceType<ThreeModule["SpriteMaterial"]>;
    sprite: InstanceType<ThreeModule["Sprite"]>;
    u: number;
    v: number;
  }> = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const piece = document.createElement("canvas");
      piece.width = pieceW;
      piece.height = pieceH;
      const ctx = piece.getContext("2d");
      if (!ctx) {
        continue;
      }
      ctx.drawImage(source, col * pieceW, row * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
      const texture = new THREE.CanvasTexture(piece);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: 1,
      });
      const sprite = new THREE.Sprite(material);
      out.push({
        texture,
        material,
        sprite,
        u: (col + 0.5) / cols - 0.5,
        v: 0.5 - (row + 0.5) / rows,
      });
    }
  }

  return out;
}

function orbitPoint(ring: number, angle: number, tilt: number, yBias: number): {
  x: number;
  y: number;
  z: number;
} {
  return {
    x: Math.cos(angle) * ring,
    y: Math.sin(angle * 0.55) * 0.12 + yBias,
    z: Math.sin(angle) * ring * Math.cos(tilt),
  };
}

export function buildWorld(THREE: ThreeModule, canvas: HTMLCanvasElement): Runtime {
  const runtime = createRuntime(THREE, canvas);
  const { scene, camera } = runtime;
  const compact = isCompactViewport();
  camera.fov = compact ? 48 : 42;
  camera.position.set(0, 0.2, compact ? 5.2 : 4.6);
  camera.updateProjectionMatrix();

  scene.fog = new THREE.FogExp2(0x05070a, 0.045);

  const hemi = new THREE.HemisphereLight(0xb7fff0, 0x0a1018, 0.85);
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(3.2, 4.2, 2.4);
  const rim = new THREE.PointLight(0x3dffd0, 2.2, 16);
  rim.position.set(-3, 1.2, 2);
  const warm = new THREE.PointLight(0xffc857, 1.4, 14);
  warm.position.set(2.4, -1.5, 1.5);
  scene.add(hemi, key, rim, warm);

  const mats = createMaterials(THREE);
  const root = new THREE.Group();
  scene.add(root);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, compact ? 1 : 2),
    mats.crystal,
  );
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 1), mats.wire);
  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.035, 10, compact ? 64 : 120),
    mats.gold,
  );
  ringA.rotation.x = Math.PI / 2.35;
  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(2.45, 0.02, 8, compact ? 48 : 100),
    mats.wire,
  );
  ringB.rotation.x = Math.PI / 2.8;
  ringB.rotation.y = 0.4;

  const satellites = new THREE.Group();
  const nodes: InstanceType<ThreeModule["Mesh"]>[] = [];
  const count = compact ? 6 : 10;
  for (let i = 0; i < count; i += 1) {
    const shape =
      i % 3 === 0
        ? new THREE.OctahedronGeometry(0.22, 0)
        : i % 3 === 1
          ? new THREE.BoxGeometry(0.28, 0.28, 0.28)
          : new THREE.TetrahedronGeometry(0.26, 0);
    const node = new THREE.Mesh(shape, i % 2 === 0 ? mats.crystal : mats.dark);
    satellites.add(node);
    nodes.push(node);
  }

  const labels = new THREE.Group();
  const shardGroup = new THREE.Group();
  const travelers: LangTraveler[] = [];
  const activeShards: LabelShard[] = [];
  const labelCount = compact ? 3 : 5;
  const shardCols = compact ? 3 : 4;
  const shardRows = 2;
  let labelCursor = 0;

  const nextLabel = (): LabelDef => {
    const label = LANG_LABELS[labelCursor % LANG_LABELS.length] ?? LANG_LABELS[0];
    labelCursor += 1;
    return label;
  };

  const resetTraveler = (item: LangTraveler, t: number, stagger = 0): void => {
    applyLabelToTraveler(THREE, item, nextLabel());
    item.ring = Math.random() > 0.5 ? 2.05 : 2.45;
    item.angle = Math.random() * Math.PI * 2;
    item.tilt = item.ring < 2.2 ? 0.42 : 0.55;
    item.progress = 0;
    item.speed = 0.22 + Math.random() * 0.12;
    item.state = "wait";
    item.shatterT = 0;
    item.waitUntil = t + stagger;
    item.sprite.visible = false;
    item.material.opacity = 0;
    item.sprite.scale.set(item.baseScale * 0.42, item.baseScale * 0.14, 1);
  };

  for (let i = 0; i < labelCount; i += 1) {
    const seed = LANG_LABELS[0] ?? { text: "TypeScript", color: "#7dd3fc" };
    const made = makeLabelSprite(THREE, seed);
    labels.add(made.sprite);
    const traveler: LangTraveler = {
      sprite: made.sprite,
      texture: made.texture,
      material: made.material,
      label: seed,
      ring: i % 2 === 0 ? 2.05 : 2.45,
      angle: (i / labelCount) * Math.PI * 2,
      tilt: i % 2 === 0 ? 0.42 : 0.55,
      progress: 0,
      speed: 0.24,
      state: "wait",
      shatterT: 0,
      waitUntil: 0,
      baseScale: compact ? 0.85 : 1,
    };
    resetTraveler(traveler, 0, i * 0.55);
    travelers.push(traveler);
  }

  const spawnShatter = (item: LangTraveler, x: number, y: number, z: number): void => {
    const pieces = sliceLabelShards(THREE, item.label, shardCols, shardRows);
    const fullW = item.baseScale * 0.42;
    const fullH = item.baseScale * 0.14;
    for (const piece of pieces) {
      const scaleX = fullW / shardCols;
      const scaleY = fullH / shardRows;
      piece.sprite.scale.set(scaleX, scaleY, 1);
      piece.sprite.position.set(x + piece.u * fullW, y + piece.v * fullH, z);
      shardGroup.add(piece.sprite);
      const angle = Math.atan2(piece.v, piece.u || 0.001) + (Math.random() - 0.5) * 0.85;
      const speed = 0.7 + Math.random() * 1.15;
      activeShards.push({
        sprite: piece.sprite,
        texture: piece.texture,
        material: piece.material,
        vel: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed + 0.25,
          z: (Math.random() - 0.5) * 0.85,
        },
        spin: (Math.random() - 0.5) * 5,
        life: 1,
        maxLife: 0.55 + Math.random() * 0.35,
        baseScaleX: scaleX,
        baseScaleY: scaleY,
      });
    }
  };

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2.1, 0.08, compact ? 32 : 48),
    mats.dark,
  );
  platform.position.y = -1.55;

  root.add(core, shell, ringA, ringB, satellites, labels, shardGroup, platform);

  let scrollTarget = 0;
  let scrollSmooth = 0;
  const onScroll = (): void => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollTarget = window.scrollY / max;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const damp = 0.032;
  let lastT = 0;

  runtime.setTick((t, pointer) => {
    const dt = Math.min(0.05, lastT ? t - lastT : 0.016);
    lastT = t;

    scrollSmooth += (scrollTarget - scrollSmooth) * 0.032;
    const s = scrollSmooth;

    const camX = pointer.x * 0.28 + Math.sin(s * Math.PI) * 0.6;
    const camY = 0.15 + pointer.y * 0.16 + s * 0.42;
    const camZ = lerp(compact ? 5.2 : 4.6, compact ? 3.9 : 3.35, s);
    camera.position.x += (camX - camera.position.x) * damp;
    camera.position.y += (camY - camera.position.y) * damp;
    camera.position.z += (camZ - camera.position.z) * damp;
    camera.lookAt(0, lerp(0.1, 0.32, s), 0);

    const rotY = t * 0.1 + pointer.x * 0.18 + s * 0.95;
    const rotX = pointer.y * 0.1 + s * 0.24;
    root.rotation.y += (rotY - root.rotation.y) * damp;
    root.rotation.x += (rotX - root.rotation.x) * damp;

    core.rotation.y = -t * 0.18;
    shell.rotation.y = t * 0.12;
    shell.rotation.z = t * 0.04;
    ringA.rotation.z = t * 0.22 + s * 0.55;
    ringB.rotation.z = -t * 0.15 - s * 0.28;
    platform.rotation.y = t * 0.05;

    const radius = lerp(2.15, 1.45, s);
    nodes.forEach((node, index) => {
      const a = (index / nodes.length) * Math.PI * 2 + t * 0.18;
      const y = Math.sin(t * 0.7 + index) * 0.24 + lerp(-0.15, 0.6, s) * Math.sin(index * 0.7);
      node.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
      node.rotation.x = t * 0.32 + index;
      node.rotation.y = -t * 0.22 + index * 0.2;
    });

    travelers.forEach((item) => {
      const yBias = item.ring < 2.2 ? 0.12 : -0.08;
      const target = orbitPoint(item.ring, item.angle + t * 0.08, item.tilt, yBias);
      const spawn = orbitPoint(item.ring * 1.55, item.angle + 0.85, item.tilt, yBias + 0.35);

      if (item.state === "wait") {
        if (t >= item.waitUntil) {
          item.state = "travel";
          item.progress = 0;
          item.sprite.visible = true;
          item.material.opacity = 0;
        }
        return;
      }

      if (item.state === "travel") {
        item.progress = Math.min(1, item.progress + dt * item.speed);
        const p = easeOutCubic(item.progress);
        item.sprite.position.set(
          lerp(spawn.x, target.x, p),
          lerp(spawn.y, target.y, p),
          lerp(spawn.z, target.z, p),
        );
        item.material.opacity = Math.min(0.92, p * 1.35);
        const swell = item.baseScale * (0.92 + Math.sin(p * Math.PI) * 0.08);
        item.sprite.scale.set(swell * 0.42, swell * 0.14, 1);
        if (item.progress >= 1) {
          item.state = "shatter";
          item.shatterT = 0;
          item.sprite.visible = false;
          item.material.opacity = 0;
          spawnShatter(item, target.x, target.y, target.z);
        }
        return;
      }

      item.shatterT = Math.min(1, item.shatterT + dt * 2.1);
      if (item.shatterT >= 1) {
        resetTraveler(item, t, 0.45 + Math.random() * 0.9);
      }
    });

    for (let i = activeShards.length - 1; i >= 0; i -= 1) {
      const shard = activeShards[i];
      if (!shard) {
        continue;
      }
      shard.life -= dt / shard.maxLife;
      shard.sprite.position.x += shard.vel.x * dt;
      shard.sprite.position.y += shard.vel.y * dt;
      shard.sprite.position.z += shard.vel.z * dt;
      shard.vel.y -= dt * 1.35;
      shard.material.rotation += shard.spin * dt;
      const fade = Math.max(0, shard.life);
      shard.material.opacity = fade;
      const shrink = 0.75 + fade * 0.25;
      shard.sprite.scale.set(shard.baseScaleX * shrink, shard.baseScaleY * shrink, 1);
      if (shard.life <= 0) {
        shardGroup.remove(shard.sprite);
        shard.texture.dispose();
        shard.material.dispose();
        activeShards.splice(i, 1);
      }
    }

    rim.intensity = 1.8 + Math.sin(t * 0.8) * 0.18;
  });

  const originalDispose = runtime.dispose.bind(runtime);
  runtime.dispose = () => {
    window.removeEventListener("scroll", onScroll);
    Object.values(mats).forEach((mat) => mat.dispose());
    travelers.forEach((item) => {
      item.texture.dispose();
      item.material.dispose();
    });
    activeShards.forEach((shard) => {
      shard.texture.dispose();
      shard.material.dispose();
    });
    originalDispose();
  };

  return runtime;
}

export async function mountWorld(): Promise<void> {
  const canvas = document.getElementById("worldCanvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  if (prefersReducedMotion()) {
    document.body.classList.add("reduced-3d");
    paintFallback(
      canvas,
      "radial-gradient(circle at 35% 30%, rgba(61,255,208,.2), transparent 42%), radial-gradient(circle at 70% 65%, rgba(255,200,87,.12), transparent 40%), #05070a",
    );
    return;
  }

  try {
    const THREE = await loadThree();
    const runtime = buildWorld(THREE, canvas);
    window.addEventListener(
      "pagehide",
      () => {
        runtime.dispose();
      },
      { once: true },
    );
  } catch {
    document.body.classList.add("reduced-3d");
    paintFallback(canvas, "#05070a");
  }
}
