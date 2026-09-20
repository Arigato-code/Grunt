import * as THREE from "three";

/* Acid lime on porcelain — energy from the dark site, readable on light */
const LIME = 0xb6f000;
const STEEL = 0x8a8a82;
const CORE = 0x1a1a18;

/**
 * Adaptive WebGL hero: one scene, FPS-aware quality, pause when offscreen/hidden.
 */
export function createScene(canvas) {
  const reduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(max-width: 640px)").matches;

  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  let quality = reduced ? "low" : isMobile ? "medium" : "high";
  let particleCount = quality === "high" ? 2200 : quality === "medium" ? 900 : 280;
  let running = true;
  let visible = true;
  let frame = 0;
  let last = performance.now();
  let fpsEma = 60;
  let pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality === "high",
    alpha: true,
    powerPreference: "high-performance",
    stencil: false,
    depth: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.5 : 1));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.2, 6.2);

  const root = new THREE.Group();
  scene.add(root);

  // Crystalline core — icosahedron that morphs between wire and solid
  const geo = new THREE.IcosahedronGeometry(1.35, quality === "low" ? 0 : 1);
  const matWire = new THREE.MeshBasicMaterial({
    color: LIME,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  const matSolid = new THREE.MeshBasicMaterial({
    color: CORE,
    transparent: true,
    opacity: 0.12,
  });
  const coreSolid = new THREE.Mesh(geo, matSolid);
  const coreWire = new THREE.Mesh(geo.clone(), matWire);
  coreWire.scale.setScalar(1.02);
  root.add(coreSolid, coreWire);

  // Inner shard ring
  const ringGeo = new THREE.TorusGeometry(2.15, 0.015, 8, quality === "low" ? 48 : 120);
  const ring = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.35 })
  );
  ring.rotation.x = Math.PI / 2.4;
  root.add(ring);

  if (quality !== "low") {
    const ring2 = ring.clone();
    ring2.scale.setScalar(1.18);
    ring2.rotation.x = Math.PI / 1.7;
    ring2.material = ring.material.clone();
    ring2.material.opacity = 0.18;
    root.add(ring2);
  }

  // Particle field
  const positions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const r = 2.8 + Math.random() * 5.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
    positions[i * 3 + 2] = r * Math.cos(phi);
    speeds[i] = 0.15 + Math.random() * 0.55;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: STEEL,
      size: quality === "high" ? 0.028 : 0.04,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  root.add(particles);

  // Soft ambient glow sprite via large faint sphere
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 16, 16),
    new THREE.MeshBasicMaterial({
      color: LIME,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
    })
  );
  root.add(glow);

  // Desktop: park core in the open right half; mobile: behind copy, dimmer via CSS
  root.position.set(isMobile ? 0 : 2.1, isMobile ? -0.1 : 0.05, 0);
  if (!isMobile) {
    root.scale.setScalar(1.15);
  }

  function onPointer(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    pointer.tx = (x / window.innerWidth) * 2 - 1;
    pointer.ty = -(y / window.innerHeight) * 2 + 1;
  }

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("touchmove", onPointer, { passive: true });

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", onResize, { passive: true });

  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
  });

  // Pause when canvas scrolled far below fold (hero mostly covered)
  const io = new IntersectionObserver(
    ([entry]) => {
      running = entry.isIntersecting && entry.intersectionRatio > 0.05;
    },
    { threshold: [0, 0.05, 0.2] }
  );
  io.observe(canvas);

  let scrollBoost = 0;
  function setScrollProgress(p) {
    // 0 at top → dampen core as user descends
    scrollBoost = Math.min(1, Math.max(0, p));
  }

  function degrade() {
    if (quality === "low") return;
    quality = quality === "high" ? "medium" : "low";
    renderer.setPixelRatio(1);
    renderer.antialias = false;
    document.body.classList.add("is-reduced");
  }

  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible || !running) return;

    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const fps = 1 / (dt || 0.016);
    fpsEma = fpsEma * 0.9 + fps * 0.1;
    frame++;

    // Adaptive quality after warm-up
    if (frame === 90 && fpsEma < 40) degrade();
    if (frame === 180 && fpsEma < 32) degrade();

    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    const t = now * 0.001;
    const damp = 1 - scrollBoost * 0.55;

    root.rotation.y = t * 0.18 * damp + pointer.x * 0.35;
    root.rotation.x = Math.sin(t * 0.35) * 0.12 + pointer.y * 0.2;
    coreWire.rotation.y = -t * 0.25;
    coreSolid.rotation.z = t * 0.12;
    ring.rotation.z = t * 0.4;

    const breathe = 1 + Math.sin(t * 1.4) * 0.025;
    coreSolid.scale.setScalar(breathe);
    glow.scale.setScalar(breathe * 1.05);
    matWire.opacity = 0.4 + Math.sin(t * 2) * 0.12;

    // Orbit particles slowly
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3;
      const s = speeds[i] * dt * damp;
      const x = pos[ix];
      const z = pos[ix + 2];
      pos[ix] = x * Math.cos(s) - z * Math.sin(s);
      pos[ix + 2] = x * Math.sin(s) + z * Math.cos(s);
      pos[ix + 1] += Math.sin(t + i) * 0.0008;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    camera.position.x = pointer.x * 0.25;
    camera.position.y = 0.2 + pointer.y * 0.15;
    camera.lookAt(root.position.x * 0.4, root.position.y, 0);

    renderer.render(scene, camera);
  }

  requestAnimationFrame(tick);
  canvas.classList.add("is-ready");

  return {
    setScrollProgress,
    destroy() {
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onPointer);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      ringGeo.dispose();
      pGeo.dispose();
      renderer.dispose();
    },
  };
}
