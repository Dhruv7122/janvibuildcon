import * as THREE from 'three';
import gsap from 'gsap';
import { createCameraPath, POSITIONS } from './cameraPath.js';
import { createDirector, createState } from './director.js';
import { LIGHT, LIGHT_THEMES } from './materials.js';

/** Dark "showroom" used to bake the environment map: strip lights give glossy floors something to mirror. */
function createEnvScene() {
  const s = new THREE.Scene();
  const basic = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), side: THREE.DoubleSide });
  const room = new THREE.Mesh(new THREE.BoxGeometry(40, 14, 40), basic(0.012, 0.016, 0.024));
  room.material.side = THREE.BackSide;
  s.add(room);
  const strip = new THREE.PlaneGeometry(0.8, 26);
  const warm = basic(3.2, 2.9, 2.6);
  for (let i = -2; i <= 2; i++) {
    const m = new THREE.Mesh(strip, warm);
    m.rotation.x = Math.PI / 2;
    m.position.set(i * 6, 6.8, 0);
    s.add(m);
  }
  const panel = new THREE.PlaneGeometry(14, 2.5);
  const cyan = new THREE.Mesh(panel, basic(0.06, 0.4, 0.65));
  cyan.position.set(-19.8, 2, 0);
  cyan.rotation.y = Math.PI / 2;
  const amber = new THREE.Mesh(panel, basic(0.7, 0.38, 0.03));
  amber.position.set(19.8, 2, 0);
  amber.rotation.y = -Math.PI / 2;
  s.add(cyan, amber);
  return s;
}

/**
 * The persistent WebGL world: renderer, camera, environment, all scene modules,
 * scroll director and the render loop (driven by gsap.ticker, shared with Lenis).
 * Loaded with a dynamic import so the initial JS bundle stays small.
 */
export async function createWorld({ canvas, device, theme = 'dark', onProgress, onGroutState }) {
  // Real loading progress: each build step is registered with a THREE.LoadingManager.
  const manager = new THREE.LoadingManager();
  // Optional scenes are only built when their section is on the page (e.g. hidden services).
  const hasSection = (id) => !!document.querySelector(`[data-section]#${id}`);
  const hasEpoxy = hasSection('epoxy');
  const steps = ['renderer', 'environment', 'hero', 'leak', 'waterproofing', 'crack', 'grouting', 'epoxy', 'tile', 'outro', 'postfx', 'compile'].filter(
    (s) => s !== 'epoxy' || hasEpoxy
  );
  manager.onProgress = (_url, loaded, total) => onProgress?.(loaded / total);
  steps.forEach((s) => manager.itemStart(s));
  const done = (s) => manager.itemEnd(s);
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

  // --- Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: device.tier !== 'low',
    powerPreference: 'high-performance',
    alpha: false,
  });
  let pixelRatio = device.pixelRatio;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const state = createState();
  // Background actually shown = dark look blended toward the light look by themeMix.
  const bgMixed = state.bg.clone();
  const themeMix = { v: theme === 'light' ? 1 : 0 };
  scene.background = bgMixed;
  scene.fog = new THREE.FogExp2(state.bg.clone(), state.fogDensity);

  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 140);
  done('renderer');
  await nextFrame();

  // --- Lights + procedural environment map (no HDR download)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = createEnvScene();
  const env = pmrem.fromScene(envScene, 0.03).texture;
  envScene.traverse((o) => {
    o.geometry?.dispose();
    o.material?.dispose();
  });
  scene.environment = env;
  pmrem.dispose();
  const hemi = new THREE.HemisphereLight(0x9cc4ff, 0x0a0c10, 0.35);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff2e0, 1.4);
  key.position.set(-6, 10, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x2ec4f1, 1.2);
  rim.position.set(8, 2, -6);
  scene.add(rim);
  done('environment');

  // --- Scenes (each module is its own chunk)
  const ctx = { device, positions: POSITIONS, pixelRatio };
  // [name, loader, section id, visible window relative to that section's time]
  const defs = [
    ['hero', () => import('../scenes/hero.js').then((m) => m.createHero(ctx)), 'hero', [-1, 1.25]],
    ['leak', () => import('../scenes/leak.js').then((m) => m.createLeak(ctx)), 'leak', [-0.7, 1.3]],
    ['waterproofing', () => import('../scenes/waterproofing.js').then((m) => m.createWaterproofing(ctx)), 'waterproofing', [-0.7, 1.3]],
    ['crack', () => import('../scenes/crack.js').then((m) => m.createCrack(ctx)), 'crack', [-0.5, 1.2]],
    ['grouting', () => import('../scenes/grouting.js').then((m) => m.createGrouting(ctx)), 'grouting', [-0.5, 1.3]],
    ['epoxy', () => import('../scenes/epoxy.js').then((m) => m.createEpoxy(ctx)), 'epoxy', [-0.5, 1.4]],
    ['tile', () => import('../scenes/tile.js').then((m) => m.createTile(ctx)), 'tile', [-0.5, 1.3]],
    ['outro', () => import('../scenes/outro.js').then((m) => m.createOutro(ctx)), 'contact', [-1.2, 0.5]],
  ].filter(([name]) => name !== 'epoxy' || hasEpoxy);
  const scenes = {};
  for (const [name, load] of defs) {
    scenes[name] = await load();
    scene.add(scenes[name].group);
    done(name);
    await nextFrame();
  }

  // --- Optional post-processing
  let post = null;
  if (device.postfx) {
    try {
      const { createPostFX } = await import('./postfx.js');
      post = createPostFX({ renderer, scene, camera });
      post.setSize(innerWidth, innerHeight, pixelRatio);
    } catch (err) {
      console.warn('[world] post-processing disabled:', err);
    }
  }
  done('postfx');

  // --- Director
  const path = createCameraPath({ skip: hasEpoxy ? [] : ['toEpoxy', 'epoxy', 'epoxyEnd'] });
  const sections = [...document.querySelectorAll('[data-section]')];
  const director = createDirector({ state, path, sections, reducedMotion: device.reducedMotion });
  for (const [name, , sectionId, [a, b]] of defs) {
    scenes[name].visibleRange = [director.sectionTime(sectionId, a), director.sectionTime(sectionId, b)];
  }

  // --- Theme (0 = dark, 1 = light): exposure, ambient light, scene/post tweaks.
  function applyTheme() {
    const m = themeMix.v;
    renderer.toneMappingExposure = 1.05 + m * 0.3;
    hemi.intensity = 0.35 + m * 0.65;
    LIGHT.sky.lerpColors(LIGHT_THEMES.dark.sky, LIGHT_THEMES.light.sky, m);
    LIGHT.ground.lerpColors(LIGHT_THEMES.dark.ground, LIGHT_THEMES.light.ground, m);
    Object.values(scenes).forEach((s) => s.setTheme?.(m));
    post?.setTheme?.(m);
  }
  applyTheme();

  // --- Pre-compile every shader while the preloader is still visible.
  try {
    if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
    else renderer.compile(scene, camera);
  } catch {
    /* compile is an optimisation only */
  }
  done('compile');

  // --- HTML overlays driven by the 3D state
  const labelRoot = document.querySelector('[data-layer-labels]');
  const labelEls = labelRoot ? [...labelRoot.children] : [];
  const anchors = [];
  const projected = new THREE.Vector3();
  const bars = sections.map((s) => s.querySelector('[data-scene-bar]'));
  const leakMarker = document.querySelector('[data-leak-marker]');
  const markerPos = new THREE.Vector3();
  let groutSealed = null;

  // --- Pointer (lerped for parallax)
  const pointer = { x: 0, y: 0 };
  const pointerSmooth = { x: 0, y: 0 };
  if (!device.touch) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / innerHeight) * 2 - 1);
    });
  }

  // --- Resize
  let width = innerWidth;
  let height = innerHeight;
  function resize() {
    width = innerWidth;
    height = innerHeight;
    camera.aspect = width / height;
    camera.fov = camera.aspect < 0.8 ? 55 : 40;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    post?.setSize(width, height, pixelRatio);
    Object.values(scenes).forEach((s) => s.setPixelRatio?.(pixelRatio));
  }
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  });
  resize();

  // --- Adaptive quality: drop bloom, then resolution, if frames are slow.
  let slowTime = 0;
  function adapt(dt) {
    if (dt > 1 / 42) slowTime += dt;
    else slowTime = Math.max(0, slowTime - dt * 0.5);
    if (slowTime < 2.5) return;
    slowTime = 0;
    if (post) {
      post.dispose();
      post = null;
    } else if (pixelRatio > 1) {
      pixelRatio = 1;
      resize();
    }
  }

  // --- Loop
  const camPos = new THREE.Vector3();
  const camTgt = new THREE.Vector3();
  let elapsed = 0;
  let running = true;
  let lastPoster = -1;
  const frame = { dt: 0, elapsed: 0, state, pointer: pointerSmooth };

  function tick(_time, deltaMs) {
    if (!running || document.hidden) return;
    const dt = Math.min(deltaMs / 1000, 0.05);
    elapsed += dt;

    const covered = director.update(dt);

    if (device.reducedMotion && director.posterIndex !== lastPoster) {
      lastPoster = director.posterIndex;
      gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power3.out' });
    }

    pointerSmooth.x += (pointer.x - pointerSmooth.x) * (1 - Math.exp(-dt * 4));
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * (1 - Math.exp(-dt * 4));

    // Section HUD progress bars
    for (let i = 0; i < bars.length; i++) {
      if (bars[i]) bars[i].style.transform = `scaleX(${THREE.MathUtils.clamp((state.time - i) / 0.62, 0, 1)})`;
    }

    // Grouting before/after state
    const sealed = state.grout.flow > 0.97;
    if (sealed !== groutSealed) {
      groutSealed = sealed;
      onGroutState?.(sealed);
    }

    if (covered) return; // An opaque section hides the canvas: skip GPU work.

    // Camera
    path.sample(state.camT, camPos, camTgt);
    // Portrait screens: pull back along the view direction so subjects fit the narrow frame.
    if (camera.aspect < 0.8) camPos.sub(camTgt).multiplyScalar(1.4).add(camTgt);
    const par = device.reducedMotion ? 0 : 1;
    camPos.x += pointerSmooth.x * 0.45 * par;
    camPos.y += pointerSmooth.y * 0.25 * par + state.intro * 2.5;
    camPos.z += state.intro * 5;
    camera.position.copy(camPos);
    camera.lookAt(camTgt);

    // Shift the subject away from the text panel (horizontal on desktop, upward on mobile).
    if (width >= 768) camera.setViewOffset(width, height, -state.shift * width, 0, width, height);
    else camera.setViewOffset(width, height, 0, state.lift * height * 0.2, width, height);

    // Atmosphere
    bgMixed.lerpColors(state.bg, state.bgLight, themeMix.v);
    scene.fog.color.copy(bgMixed);
    scene.fog.density = state.fogDensity;

    // Scenes
    frame.dt = dt;
    frame.elapsed = elapsed;
    for (const s of Object.values(scenes)) {
      const [a, b] = s.visibleRange;
      s.group.visible = state.time >= a && state.time <= b;
      if (s.group.visible) s.update(frame);
    }

    // Waterproofing layer labels follow their 3D layers.
    if (labelRoot) {
      const o = state.water.labels;
      labelRoot.style.opacity = o;
      if (o > 0.001) {
        const center = width < 768;
        labelRoot.classList.toggle('is-center', center);
        scenes.waterproofing.labelAnchors(anchors, center ? 0 : 1);
        anchors.forEach((p, i) => {
          projected.copy(p).project(camera);
          const x = (projected.x * 0.5 + 0.5) * width;
          const y = (-projected.y * 0.5 + 0.5) * height;
          labelEls[i].style.transform = `translate3d(${x.toFixed(1)}px, ${(y - 10).toFixed(1)}px, 0)${center ? ' translateX(-50%)' : ''}`;
        });
      }
    }

    // Leak detection: crosshair locks onto the leak source.
    if (leakMarker) {
      const o = state.leak.marker;
      leakMarker.style.opacity = o;
      if (o > 0.001) {
        scenes.leak.markerAnchor(markerPos).project(camera);
        const x = (markerPos.x * 0.5 + 0.5) * width;
        const y = (-markerPos.y * 0.5 + 0.5) * height;
        leakMarker.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    }

    if (post) post.render(elapsed);
    else renderer.render(scene, camera);

    if (!device.reducedMotion) adapt(dt);
  }

  gsap.ticker.add(tick);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    running = false;
    document.documentElement.classList.add('no-webgl');
  });

  return {
    state,
    /** Camera dolly-in played when the preloader exits. */
    intro() {
      if (device.reducedMotion) return;
      gsap.fromTo(state, { intro: 1 }, { intro: 0, duration: 1.2, ease: 'expo.out' });
    },
    setEpoxyColor(hex) {
      scenes.epoxy?.setColor(hex, gsap);
    },
    setTheme(next, animate = true) {
      gsap.to(themeMix, {
        v: next === 'light' ? 1 : 0,
        duration: animate && !device.reducedMotion ? 0.8 : 0,
        ease: 'power3.out',
        onUpdate: applyTheme,
      });
    },
    dispose() {
      running = false;
      gsap.ticker.remove(tick);
      director.dispose();
      post?.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => v?.isTexture && v.dispose());
          m.dispose();
        });
      });
      env.dispose();
      renderer.dispose();
    },
  };
}
