/**
 * ========================================================
 * AEROVA ONE — High-Performance Cinematic 3D Scroll Engine
 * - Dramatic Initial Drop-In Entrance with Gravity & Bounce
 * - Ground Impact Shockwave Ring & Tactile Camera Shake
 * - Calibrated Cinematic Camera Zoom (Balanced Proportions)
 * - Procedural HDR Studio Lighting + GSAP ScrollTrigger Sync
 * ========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const container = document.getElementById('webgl-canvas-container');
  const scrollWrapper = document.getElementById('pin-wrapper');
  const pinnedStage = document.getElementById('pinned-stage');
  const dynamicBg = document.getElementById('dynamic-bg');
  const progressBar = document.getElementById('scroll-progress-fill');
  const mainNav = document.getElementById('main-nav');
  const toastEl = document.getElementById('toast');
  const buyNowBtn = document.getElementById('buy-now-btn');
  const exploreBtn = document.getElementById('explore-product-btn');
  const brandLogo = document.querySelector('header a');

  if (!container || !scrollWrapper || !pinnedStage) {
    console.error('Critical AEROVA DOM elements missing');
    return;
  }

  // Floating Typography Acts
  const messageActs = [
    { el: document.getElementById('msg-1'), start: 0.00, end: 0.19 },
    { el: document.getElementById('msg-2'), start: 0.21, end: 0.41 },
    { el: document.getElementById('msg-3'), start: 0.43, end: 0.63 },
    { el: document.getElementById('msg-4'), start: 0.65, end: 0.84 },
    { el: document.getElementById('msg-5'), start: 0.86, end: 1.00 }
  ];

  // Helper Math Functions
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function smoothstep(min, max, val) {
    const x = clamp((val - min) / (max - min), 0, 1);
    return x * x * (3 - 2 * x);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpColor(hexA, hexB, t) {
    const cA = new THREE.Color(hexA);
    const cB = new THREE.Color(hexB);
    cA.lerp(cB, t);
    return '#' + cA.getHexString();
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      showToast('AEROVA ONE (Flagship Edition) added to bag • $299');
    });
  }

  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const maxScroll = scrollWrapper.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: scrollWrapper.offsetTop + 0.28 * maxScroll,
        behavior: 'smooth'
      });
    });
  }

  // ================= Three.js Scene Setup =================
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();

  // Calibrated Camera FOV & Distance (Balanced scale with luxury negative space)
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 70);
  camera.position.set(0, 0.35, 7.2);

  const cameraShake = { x: 0, y: 0 };

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // ================= Procedural HDR Studio Environment =================
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envCanvas = document.createElement('canvas');
  envCanvas.width = 512;
  envCanvas.height = 256;
  const envCtx = envCanvas.getContext('2d');

  envCtx.fillStyle = '#06070a';
  envCtx.fillRect(0, 0, 512, 256);

  // Top softbox highlight
  const topGrad = envCtx.createRadialGradient(256, 40, 5, 256, 40, 110);
  topGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  topGrad.addColorStop(0.6, 'rgba(235, 245, 255, 0.5)');
  topGrad.addColorStop(1, 'transparent');
  envCtx.fillStyle = topGrad;
  envCtx.fillRect(100, 0, 312, 120);

  // Left Cyan Rim
  const leftGrad = envCtx.createLinearGradient(30, 0, 100, 0);
  leftGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
  leftGrad.addColorStop(1, 'transparent');
  envCtx.fillStyle = leftGrad;
  envCtx.fillRect(30, 50, 70, 160);

  // Right Silver Rim
  const rightGrad = envCtx.createLinearGradient(482, 0, 412, 0);
  rightGrad.addColorStop(0, 'rgba(240, 248, 255, 0.8)');
  rightGrad.addColorStop(1, 'transparent');
  envCtx.fillStyle = rightGrad;
  envCtx.fillRect(412, 50, 70, 160);

  const envTexture = new THREE.CanvasTexture(envCanvas);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
  scene.environment = envMap;
  envTexture.dispose();
  pmremGenerator.dispose();

  // ================= Studio Lighting =================
  const ambientLight = new THREE.AmbientLight(0x0e1726, 0.35);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
  keyLight.position.set(4.5, 5.0, 4.0);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.6);
  rimLight.position.set(-4.5, -1.0, -3.5);
  scene.add(rimLight);

  const gleamLight = new THREE.PointLight(0xffffff, 1.8, 9);
  gleamLight.position.set(-2.5, 2.0, 3.0);
  scene.add(gleamLight);

  const internalCaseLight = new THREE.PointLight(0x38bdf8, 0, 4);
  internalCaseLight.position.set(0, 0.25, 0);
  scene.add(internalCaseLight);

  // Micro Ambient Dust Particles
  const particleCount = 75;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 12;
    particlePos[i + 1] = (Math.random() - 0.5) * 10;
    particlePos[i + 2] = (Math.random() - 0.5) * 10;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.025,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ================= High-Fidelity 3D Product Construction =================
  const masterProductGroup = new THREE.Group();
  scene.add(masterProductGroup);

  // Sculpted Apple-Grade Physical Materials
  const ceramicMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    roughness: 0.12,
    metalness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 0.95,
    envMapIntensity: 1.65
  });

  const darkCavityMat = new THREE.MeshStandardMaterial({
    color: 0x090b0e,
    roughness: 0.45,
    metalness: 0.75,
    envMapIntensity: 1.0
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe6eaf0,
    metalness: 0.98,
    roughness: 0.06,
    envMapIntensity: 2.5
  });

  const goldContactMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.95,
    roughness: 0.18
  });

  // Authentic translucent silicone rubber with light diffusion
  const siliconeTipMat = new THREE.MeshPhysicalMaterial({
    color: 0xf1f5f9,
    roughness: 0.32,
    metalness: 0.0,
    transmission: 0.62,
    thickness: 0.45,
    ior: 1.45,
    transparent: true,
    opacity: 0.94
  });

  const acousticMeshMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c10,
    roughness: 0.6,
    metalness: 0.85
  });

  const opticalSensorMat = new THREE.MeshPhysicalMaterial({
    color: 0x040507,
    roughness: 0.04,
    metalness: 0.85,
    clearcoat: 1.0
  });

  const seamMat = new THREE.MeshBasicMaterial({
    color: 0x030406
  });

  // 1. CHARGING CASE BASE GROUP
  const caseBaseGroup = new THREE.Group();
  masterProductGroup.add(caseBaseGroup);

  // Main pebble cylinder body
  const caseBodyGeo = new THREE.CylinderGeometry(1.08, 0.94, 1.15, 64);
  const caseBody = new THREE.Mesh(caseBodyGeo, ceramicMat);
  caseBody.scale.set(1.24, 1.0, 0.72);
  caseBody.position.y = -0.58;
  caseBaseGroup.add(caseBody);

  // Rounded bottom cap
  const caseBottomGeo = new THREE.SphereGeometry(0.94, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const caseBottom = new THREE.Mesh(caseBottomGeo, ceramicMat);
  caseBottom.scale.set(1.24, 0.55, 0.72);
  caseBottom.position.y = -1.15;
  caseBaseGroup.add(caseBottom);

  // Bottom USB-C Port
  const usbcBevelGeo = new THREE.TorusGeometry(0.18, 0.035, 16, 32);
  const usbcBevel = new THREE.Mesh(usbcBevelGeo, chromeMat);
  usbcBevel.rotation.x = Math.PI / 2;
  usbcBevel.position.y = -1.43;
  caseBaseGroup.add(usbcBevel);

  const usbcHoleGeo = new THREE.BoxGeometry(0.24, 0.05, 0.08);
  const usbcHole = new THREE.Mesh(usbcHoleGeo, darkCavityMat);
  usbcHole.position.y = -1.42;
  caseBaseGroup.add(usbcHole);

  // Recessed Seam Ring
  const seamGeo = new THREE.CylinderGeometry(1.082, 1.082, 0.02, 64);
  const seamMesh = new THREE.Mesh(seamGeo, seamMat);
  seamMesh.scale.set(1.245, 1.0, 0.725);
  seamMesh.position.y = -0.01;
  caseBaseGroup.add(seamMesh);

  // Interior Cavity Liner
  const cavityLinerGeo = new THREE.CylinderGeometry(0.98, 0.92, 0.42, 48);
  const cavityLiner = new THREE.Mesh(cavityLinerGeo, darkCavityMat);
  cavityLiner.scale.set(1.18, 1.0, 0.65);
  cavityLiner.position.y = -0.05;
  caseBaseGroup.add(cavityLiner);

  // Left & Right dock well indentations
  [-0.46, 0.46].forEach((xPos) => {
    const wellGeo = new THREE.CylinderGeometry(0.36, 0.32, 0.6, 32);
    const wellMesh = new THREE.Mesh(wellGeo, darkCavityMat);
    wellMesh.position.set(xPos, -0.25, 0.05);
    caseBaseGroup.add(wellMesh);

    const pinGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 12);
    const pin1 = new THREE.Mesh(pinGeo, goldContactMat);
    pin1.position.set(xPos - 0.08, -0.48, 0.05);
    const pin2 = new THREE.Mesh(pinGeo, goldContactMat);
    pin2.position.set(xPos + 0.08, -0.48, 0.05);
    caseBaseGroup.add(pin1, pin2);
  });

  // Front Status LED Dot
  const ledGeo = new THREE.SphereGeometry(0.03, 16, 16);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const ledMesh = new THREE.Mesh(ledGeo, ledMat);
  ledMesh.position.set(0, -0.45, 0.73);
  caseBaseGroup.add(ledMesh);

  // Front Thumb Notch
  const notchGeo = new THREE.BoxGeometry(0.42, 0.05, 0.06);
  const notchMesh = new THREE.Mesh(notchGeo, darkCavityMat);
  notchMesh.position.set(0, -0.04, 0.735);
  caseBaseGroup.add(notchMesh);

  // Rear Aluminum Hinge
  const hingeGeo = new THREE.BoxGeometry(0.72, 0.16, 0.09);
  const hingeMesh = new THREE.Mesh(hingeGeo, chromeMat);
  hingeMesh.position.set(0, -0.01, -0.74);
  caseBaseGroup.add(hingeMesh);

  // 2. CHARGING CASE LID (Hinged at the rear)
  const caseLidPivot = new THREE.Group();
  caseLidPivot.position.set(0, 0.01, -0.52);
  masterProductGroup.add(caseLidPivot);

  const lidMeshGroup = new THREE.Group();
  lidMeshGroup.position.set(0, -0.01, 0.52);
  caseLidPivot.add(lidMeshGroup);

  const lidCylGeo = new THREE.CylinderGeometry(1.08, 1.08, 0.44, 64);
  const lidCyl = new THREE.Mesh(lidCylGeo, ceramicMat);
  lidCyl.scale.set(1.24, 1.0, 0.72);
  lidCyl.position.y = 0.22;
  lidMeshGroup.add(lidCyl);

  const lidDomeGeo = new THREE.SphereGeometry(1.08, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const lidDome = new THREE.Mesh(lidDomeGeo, ceramicMat);
  lidDome.scale.set(1.24, 0.46, 0.72);
  lidDome.position.y = 0.44;
  lidMeshGroup.add(lidDome);

  const lidInteriorGeo = new THREE.CylinderGeometry(0.96, 0.96, 0.35, 48);
  const lidInterior = new THREE.Mesh(lidInteriorGeo, darkCavityMat);
  lidInterior.scale.set(1.18, 1.0, 0.65);
  lidInterior.position.y = 0.18;
  lidMeshGroup.add(lidInterior);

  // 3. EARBUDS (Photorealistic Sculpted Assemblies)
  function createEarbud(isRight = false) {
    const earbud = new THREE.Group();

    // Head bulb group
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(0, 0.38, 0);

    // 1. Organic ergonomic acoustic chamber
    const mainBulbGeo = new THREE.SphereGeometry(0.38, 48, 48);
    mainBulbGeo.scale(1.0, 1.16, 0.94);
    const mainBulb = new THREE.Mesh(mainBulbGeo, ceramicMat);
    bulbGroup.add(mainBulb);

    // Anatomical concha swell
    const conchaGeo = new THREE.SphereGeometry(0.32, 32, 32);
    conchaGeo.scale(0.85, 1.08, 0.95);
    const concha = new THREE.Mesh(conchaGeo, ceramicMat);
    concha.position.set(isRight ? -0.12 : 0.12, -0.02, -0.05);
    bulbGroup.add(concha);

    // Hairline shell parting seam line
    const seamCurve = new THREE.TorusGeometry(0.382, 0.006, 12, 64);
    const seamRing = new THREE.Mesh(seamCurve, seamMat);
    seamRing.rotation.y = Math.PI / 2;
    seamRing.scale.set(0.94, 1.16, 1.0);
    bulbGroup.add(seamRing);

    // 2. External acoustic noise-cancellation vent with micro-mesh
    const ventGroup = new THREE.Group();
    ventGroup.position.set(isRight ? -0.25 : 0.25, 0.06, -0.12);
    ventGroup.rotation.y = isRight ? -0.4 : 0.4;
    ventGroup.rotation.z = isRight ? 0.2 : -0.2;

    const ventBezelGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.22, 24);
    const ventBezel = new THREE.Mesh(ventBezelGeo, darkCavityMat);
    ventBezel.rotation.z = Math.PI / 2;
    ventBezel.scale.set(1, 1, 0.35);
    ventGroup.add(ventBezel);

    const ventMeshGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.20, 24);
    const ventMesh = new THREE.Mesh(ventMeshGeo, acousticMeshMat);
    ventMesh.rotation.z = Math.PI / 2;
    ventMesh.scale.set(1, 1, 0.35);
    ventMesh.position.z = 0.01;
    ventGroup.add(ventMesh);
    bulbGroup.add(ventGroup);

    // 3. Optical skin-detect sensor (glossy black window)
    const sensorGeo = new THREE.SphereGeometry(0.05, 16, 16);
    sensorGeo.scale(0.6, 1.2, 0.35);
    const sensorWindow = new THREE.Mesh(sensorGeo, opticalSensorMat);
    sensorWindow.position.set(isRight ? 0.26 : -0.26, 0.02, 0.12);
    sensorWindow.rotation.y = isRight ? 0.6 : -0.6;
    bulbGroup.add(sensorWindow);

    // Inward acoustic microphone dot
    const inMicGeo = new THREE.CircleGeometry(0.02, 16);
    const inMic = new THREE.Mesh(inMicGeo, acousticMeshMat);
    inMic.position.set(isRight ? 0.18 : -0.18, -0.12, 0.25);
    inMic.rotation.y = isRight ? 0.6 : -0.6;
    bulbGroup.add(inMic);

    // 4. Ergonomic sound nozzle & translucent silicone umbrella tip
    const nozzleAssembly = new THREE.Group();
    nozzleAssembly.position.set(isRight ? 0.23 : -0.23, 0.04, 0.20);
    nozzleAssembly.rotation.y = isRight ? 0.58 : -0.58;
    nozzleAssembly.rotation.x = -0.30;

    // Titanium nozzle core
    const nozzleCylGeo = new THREE.CylinderGeometry(0.165, 0.185, 0.22, 32);
    const nozzleCyl = new THREE.Mesh(nozzleCylGeo, chromeMat);
    nozzleCyl.rotation.x = Math.PI / 2;
    nozzleAssembly.add(nozzleCyl);

    // Inner acoustic driver mesh filter with metallic ring
    const meshDiskGeo = new THREE.CircleGeometry(0.155, 32);
    const meshDisk = new THREE.Mesh(meshDiskGeo, acousticMeshMat);
    meshDisk.position.z = 0.112;
    nozzleAssembly.add(meshDisk);

    const innerRingGeo = new THREE.RingGeometry(0.035, 0.065, 24);
    const innerRing = new THREE.Mesh(innerRingGeo, chromeMat);
    innerRing.position.z = 0.113;
    nozzleAssembly.add(innerRing);

    // Realistic translucent silicone mushroom / umbrella tip (Lathe profile)
    const tipPoints = [
      new THREE.Vector2(0.14, 0.0),
      new THREE.Vector2(0.16, 0.04),
      new THREE.Vector2(0.20, 0.09),
      new THREE.Vector2(0.29, 0.14),
      new THREE.Vector2(0.33, 0.19),
      new THREE.Vector2(0.31, 0.24),
      new THREE.Vector2(0.24, 0.27),
      new THREE.Vector2(0.16, 0.28)
    ];
    const tipGeo = new THREE.LatheGeometry(tipPoints, 48);
    const tipMesh = new THREE.Mesh(tipGeo, siliconeTipMat);
    tipMesh.rotation.x = Math.PI / 2;
    tipMesh.position.z = 0.01;
    nozzleAssembly.add(tipMesh);

    // Inner silicone mounting bore
    const tipCoreGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.20, 32, 1, true);
    const tipCore = new THREE.Mesh(tipCoreGeo, siliconeTipMat);
    tipCore.rotation.x = Math.PI / 2;
    tipCore.position.z = 0.11;
    nozzleAssembly.add(tipCore);

    bulbGroup.add(nozzleAssembly);
    earbud.add(bulbGroup);

    // 5. Aerodynamic stem with capacitive force sensor
    const stemGroup = new THREE.Group();
    stemGroup.position.set(0, -0.18, -0.06);

    // Transitional collar blending head bulb into stem
    const stemCollarGeo = new THREE.CylinderGeometry(0.125, 0.105, 0.20, 32);
    const stemCollar = new THREE.Mesh(stemCollarGeo, ceramicMat);
    stemCollar.position.y = 0.22;
    stemCollar.rotation.x = 0.14;
    stemGroup.add(stemCollar);

    // Main stadium-contoured stem body
    const stemBodyGeo = new THREE.CylinderGeometry(0.105, 0.092, 0.88, 36);
    stemBodyGeo.scale(0.95, 1.0, 1.15);
    const stemBody = new THREE.Mesh(stemBodyGeo, ceramicMat);
    stemBody.position.y = -0.22;
    stemBody.rotation.x = 0.12;
    stemGroup.add(stemBody);

    // Recessed capacitive force sensor groove
    const forceGrooveGroup = new THREE.Group();
    forceGrooveGroup.position.set(isRight ? 0.102 : -0.102, -0.20, -0.035);
    forceGrooveGroup.rotation.x = 0.12;

    const grooveBackingGeo = new THREE.BoxGeometry(0.02, 0.30, 0.08);
    const grooveBacking = new THREE.Mesh(grooveBackingGeo, darkCavityMat);
    forceGrooveGroup.add(grooveBacking);

    const groovePillGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.22, 24);
    const groovePill = new THREE.Mesh(groovePillGeo, chromeMat);
    groovePill.scale.set(0.2, 1, 0.75);
    forceGrooveGroup.add(groovePill);
    stemGroup.add(forceGrooveGroup);

    // Top stem acoustic back-vent
    const stemVentGeo = new THREE.BoxGeometry(0.02, 0.08, 0.05);
    const stemVent = new THREE.Mesh(stemVentGeo, acousticMeshMat);
    stemVent.position.set(0, 0.08, -0.11);
    stemVent.rotation.x = 0.12;
    stemGroup.add(stemVent);

    // 6. Dual chrome & gold magnetic charging endcap
    const baseEndcapGroup = new THREE.Group();
    baseEndcapGroup.position.set(0, -0.66, -0.11);
    baseEndcapGroup.rotation.x = 0.12;

    const baseRingGeo = new THREE.CylinderGeometry(0.095, 0.091, 0.08, 32);
    const baseRing = new THREE.Mesh(baseRingGeo, chromeMat);
    baseEndcapGroup.add(baseRing);

    const gapGeo = new THREE.CylinderGeometry(0.092, 0.092, 0.015, 32);
    const gapMesh = new THREE.Mesh(gapGeo, seamMat);
    gapMesh.position.y = -0.042;
    baseEndcapGroup.add(gapMesh);

    const contact1Geo = new THREE.SphereGeometry(0.035, 16, 16);
    contact1Geo.scale(1, 0.4, 1);
    const contact1 = new THREE.Mesh(contact1Geo, goldContactMat);
    contact1.position.set(-0.032, -0.06, 0);
    baseEndcapGroup.add(contact1);

    const contact2 = new THREE.Mesh(contact1Geo, goldContactMat);
    contact2.position.set(0.032, -0.06, 0);
    baseEndcapGroup.add(contact2);

    // Bottom voice microphone port
    const talkMicGeo = new THREE.CircleGeometry(0.02, 16);
    const talkMic = new THREE.Mesh(talkMicGeo, acousticMeshMat);
    talkMic.rotation.x = Math.PI / 2;
    talkMic.position.y = -0.065;
    baseEndcapGroup.add(talkMic);

    stemGroup.add(baseEndcapGroup);
    earbud.add(stemGroup);

    return earbud;
  }

  const leftEarbud = createEarbud(false);
  const rightEarbud = createEarbud(true);
  masterProductGroup.add(leftEarbud);
  masterProductGroup.add(rightEarbud);

  // Initial Earbud Docked Positions
  leftEarbud.position.set(-0.46, 0.08, 0);
  rightEarbud.position.set(0.46, 0.08, 0);
  leftEarbud.rotation.set(-0.15, 0.2, 0.1);
  rightEarbud.rotation.set(-0.15, -0.2, -0.1);

  // 4. ACOUSTIC SOUNDWAVE RINGS (Spatial Immersion)
  const soundwaveGroup = new THREE.Group();
  masterProductGroup.add(soundwaveGroup);

  const waveRings = [];
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(0.65, 0.018, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    soundwaveGroup.add(ring);
    waveRings.push(ring);
  }

  // 5. GROUND CONTACT SHADOW PLANE
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const shadowCtx = shadowCanvas.getContext('2d');
  const shadowGrad = shadowCtx.createRadialGradient(128, 128, 20, 128, 128, 120);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
  shadowGrad.addColorStop(1, 'transparent');
  shadowCtx.fillStyle = shadowGrad;
  shadowCtx.fillRect(0, 0, 256, 256);

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowPlaneGeo = new THREE.PlaneGeometry(3.6, 2.4);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.55,
    depthWrite: false
  });
  const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.48;
  masterProductGroup.add(shadowPlane);

  // 6. GROUND IMPACT SHOCKWAVE RING (Triggers when the box hits the ground)
  const impactRingGeo = new THREE.RingGeometry(0.2, 0.32, 64);
  const impactRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const impactRing = new THREE.Mesh(impactRingGeo, impactRingMat);
  impactRing.rotation.x = -Math.PI / 2;
  impactRing.position.y = -1.47;
  masterProductGroup.add(impactRing);

  // ================= Subtle Mouse Parallax Tilt =================
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ================= Smooth Scrub Engine (GSAP ScrollTrigger) =================
  let targetProgress = 0;
  let currentProgress = 0;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: scrollWrapper,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        targetProgress = self.progress;
        // If user scrolls during the drop-in intro, complete intro immediately
        if (isIntroActive && targetProgress > 0.01) {
          if (dropTl) dropTl.progress(1);
          isIntroActive = false;
        }
      }
    });

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  } else {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = scrollWrapper.offsetHeight - window.innerHeight;
      targetProgress = maxScroll > 0 ? clamp(scrollY / maxScroll, 0, 1) : 0;
      if (isIntroActive && targetProgress > 0.01) {
        if (dropTl) dropTl.progress(1);
        isIntroActive = false;
      }
    }, { passive: true });
  }

  // ================= INITIAL "BOX DROPS FIRST" INTRO SEQUENCE =================
  let isIntroActive = true;
  const dropState = {
    y: 7.2,          // Starts high above the viewport
    rotX: 0.42,      // Natural tumbling angle
    rotZ: -0.22,
    rotY: 0.35,
    shadowScale: 0.05,
    shadowOpacity: 0
  };

  function triggerImpact() {
    // 1. Ground impact shockwave ripple
    impactRing.scale.set(1, 1, 1);
    impactRingMat.opacity = 0.85;
    gsap.to(impactRing.scale, {
      x: 7.5,
      y: 7.5,
      duration: 0.9,
      ease: 'power2.out'
    });
    gsap.to(impactRingMat, {
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out'
    });

    // 2. Tactile camera micro-shake
    gsap.to(cameraShake, {
      y: 0.05,
      duration: 0.05,
      yoyo: true,
      repeat: 4,
      ease: 'power1.inOut',
      onComplete: () => {
        cameraShake.y = 0;
        cameraShake.x = 0;
      }
    });

    // 3. LED status pulse
    ledMat.color.setHex(0x38bdf8);
  }

  let dropTl = null;
  function startDropAnimation() {
    isIntroActive = true;
    dropState.y = 7.2;
    dropState.rotX = 0.42;
    dropState.rotZ = -0.22;
    dropState.rotY = 0.35;
    dropState.shadowScale = 0.05;
    dropState.shadowOpacity = 0;

    // Hide message 1 until box impacts and settles
    const msg1 = document.getElementById('msg-1');
    if (msg1) msg1.classList.remove('active');

    dropTl = gsap.timeline({
      delay: 0.15,
      onComplete: () => {
        isIntroActive = false;
        // Reveal initial hero text once box has landed and settled
        if (msg1 && currentProgress <= 0.19) {
          msg1.classList.add('active');
        }
      }
    });

    // Fall down with gravity acceleration and authentic physics bounce
    dropTl.to(dropState, {
      y: 0,
      duration: 1.35,
      ease: 'bounce.out',
      onUpdate: () => {
        const heightRatio = clamp(1 - (dropState.y / 7.2), 0, 1);
        dropState.shadowScale = lerp(0.05, 1.0, heightRatio);
        dropState.shadowOpacity = lerp(0, 0.65, heightRatio);
      }
    });

    // Straighten rotation as it hits and settles
    dropTl.to(dropState, {
      rotX: 0,
      rotZ: 0,
      rotY: 0,
      duration: 1.15,
      ease: 'power2.out'
    }, '<');

    // Trigger impact at first floor contact (~0.58s)
    dropTl.add(() => {
      triggerImpact();
    }, 0.58);
  }

  // Start the drop animation immediately on load
  startDropAnimation();

  // Allow clicking logo to replay drop
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        startDropAnimation();
      }, 350);
    });
  }

  // ================= 5-Act Cinematic Choreography =================
  function applyChoreography(p) {
    const isMobile = window.innerWidth < 768;
    const shiftMul = isMobile ? 0.35 : 1.0;

    // 1. Update Top Progress Bar
    if (progressBar) {
      progressBar.style.width = (p * 100).toFixed(1) + '%';
    }

    // 2. Active Message Overlay Handling (only show if intro has finished or user is scrolling)
    if (!isIntroActive || p > 0.05) {
      messageActs.forEach((act) => {
        if (!act.el) return;
        const isActive = p >= act.start && p <= act.end;
        act.el.classList.toggle('active', isActive);
      });
    }

    // 3. Dynamic Background Color & Light Theme Switching
    let currentBgColor = '#070709';
    let isLightMode = false;

    if (p <= 0.22) {
      currentBgColor = '#070709';
      isLightMode = false;
    } else if (p > 0.22 && p <= 0.38) {
      const t = (p - 0.22) / 0.16;
      currentBgColor = lerpColor('#070709', '#eceef2', smoothstep(0, 1, t));
      isLightMode = t > 0.4;
    } else if (p > 0.38 && p <= 0.65) {
      currentBgColor = '#eceef2';
      isLightMode = true;
    } else if (p > 0.65 && p <= 0.82) {
      const t = (p - 0.65) / 0.17;
      currentBgColor = lerpColor('#eceef2', '#08080a', smoothstep(0, 1, t));
      isLightMode = t < 0.6;
    } else {
      currentBgColor = '#050507';
      isLightMode = false;
    }

    if (dynamicBg) {
      dynamicBg.style.backgroundColor = currentBgColor;
    }

    pinnedStage.classList.toggle('stage-light', isLightMode);
    if (mainNav) mainNav.classList.toggle('stage-light', isLightMode);

    // Adjust shadow opacity for light vs dark mode
    shadowMat.opacity = isLightMode ? 0.35 : (isIntroActive ? dropState.shadowOpacity : 0.65);

    // Moving Gleam Light
    gleamLight.position.x = -3.5 + p * 7.0;
    gleamLight.position.y = 1.8 + Math.sin(p * Math.PI) * 1.0;

    // Calculate vertical drop offset if intro is running
    const introY = isIntroActive ? dropState.y : 0;
    const introRotX = isIntroActive ? dropState.rotX : 0;
    const introRotZ = isIntroActive ? dropState.rotZ : 0;
    const introRotY = isIntroActive ? dropState.rotY : 0;

    if (isIntroActive) {
      shadowPlane.scale.set(dropState.shadowScale, dropState.shadowScale, 1);
    } else {
      shadowPlane.scale.set(1, 1, 1);
    }

    // -------------------------------------------------------------
    // ACT 1: MEET THE FUTURE (0.00 – 0.20)
    // Product in center with balanced scale, slow dolly in, axial rotation
    // -------------------------------------------------------------
    if (p <= 0.20) {
      const t = p / 0.20;
      const easeT = smoothstep(0, 1, t);

      // Camera distance: 7.2 down to 6.2 (Not zoomed in, generous space)
      camera.position.set(0, lerp(0.35, 0.15, easeT), lerp(7.2, 6.2, easeT));
      camera.lookAt(0, -0.15, 0);

      masterProductGroup.position.set(0, -0.25 + introY, 0);
      masterProductGroup.rotation.set(
        lerp(0.08, 0.04, easeT) + introRotX,
        lerp(-0.06, 0.25, easeT) + introRotY,
        introRotZ
      );

      caseLidPivot.rotation.x = 0;
      internalCaseLight.intensity = 0;

      leftEarbud.position.set(-0.46, 0.08, 0);
      rightEarbud.position.set(0.46, 0.08, 0);
      leftEarbud.rotation.set(-0.15, 0.2, 0.1);
      rightEarbud.rotation.set(-0.15, -0.2, -0.1);

      waveRings.forEach(r => (r.material.opacity = 0));
    }

    // -------------------------------------------------------------
    // ACT 2: DESIGNED FOR IMMERSION (0.20 – 0.42)
    // Camera orbits product, moves right to give negative space for text
    // -------------------------------------------------------------
    else if (p > 0.20 && p <= 0.42) {
      const t = (p - 0.20) / 0.22;
      const easeT = smoothstep(0, 1, t);

      // Camera distance: 6.2 to 5.5
      camera.position.set(lerp(0, 1.8 * shiftMul, easeT), lerp(0.15, 0.42, easeT), lerp(6.2, 5.5, easeT));
      camera.lookAt(lerp(0, 0.85 * shiftMul, easeT), 0, 0);

      masterProductGroup.position.set(lerp(0, 1.15 * shiftMul, easeT), -0.15, 0);
      masterProductGroup.rotation.set(lerp(0.04, 0.12, easeT), lerp(0.25, 0.85, easeT), 0);

      caseLidPivot.rotation.x = 0;
      internalCaseLight.intensity = 0;

      leftEarbud.position.set(-0.46, 0.08, 0);
      rightEarbud.position.set(0.46, 0.08, 0);

      waveRings.forEach(r => (r.material.opacity = 0));
    }

    // -------------------------------------------------------------
    // ACT 3: ENGINEERED FOR DETAIL (0.42 – 0.65)
    // Lid opens backward, earbuds rise out & float, product moves left
    // -------------------------------------------------------------
    else if (p > 0.42 && p <= 0.65) {
      const t = (p - 0.42) / 0.23;
      const easeT = smoothstep(0, 1, t);

      caseLidPivot.rotation.x = lerp(0, -2.05, easeT);
      internalCaseLight.intensity = lerp(0, 2.2, easeT);

      masterProductGroup.position.set(lerp(1.15 * shiftMul, -1.1 * shiftMul, easeT), -0.18, 0);
      masterProductGroup.rotation.set(lerp(0.12, 0.08, easeT), lerp(0.85, 0.2, easeT), 0);

      const riseY = lerp(0.08, 1.35, easeT);
      const spreadX = lerp(0.46, 1.15, easeT);

      leftEarbud.position.set(-spreadX, riseY, lerp(0, 0.28, easeT));
      rightEarbud.position.set(spreadX, riseY, lerp(0, 0.28, easeT));

      leftEarbud.rotation.set(lerp(-0.15, 0.25, easeT), lerp(0.2, -0.35, easeT), lerp(0.1, 0.15, easeT));
      rightEarbud.rotation.set(lerp(-0.15, 0.25, easeT), lerp(-0.2, 0.35, easeT), lerp(-0.1, -0.15, easeT));

      // Camera macro view (distance: 5.5 to 4.4, close but spacious)
      camera.position.set(lerp(1.8 * shiftMul, -0.25 * shiftMul, easeT), lerp(0.42, 0.95, easeT), lerp(5.5, 4.4, easeT));
      camera.lookAt(lerp(0.85 * shiftMul, -0.65 * shiftMul, easeT), 0.7, 0);

      waveRings.forEach(r => (r.material.opacity = 0));
    }

    // -------------------------------------------------------------
    // ACT 4: EXPERIENCE EVERY MOMENT (0.65 – 0.85)
    // Return to cinematic dark, earbuds rotate toward viewer, soundwaves pulse
    // -------------------------------------------------------------
    else if (p > 0.65 && p <= 0.85) {
      const t = (p - 0.65) / 0.20;
      const easeT = smoothstep(0, 1, t);

      caseLidPivot.rotation.x = -2.05;
      internalCaseLight.intensity = 2.0;

      masterProductGroup.position.set(lerp(-1.1 * shiftMul, 0, easeT), lerp(-0.18, -0.32, easeT), 0);
      masterProductGroup.rotation.set(0.08, lerp(0.2, 0, easeT), 0);

      // Camera distance: 4.4 to 5.6
      camera.position.set(lerp(-0.25 * shiftMul, 0, easeT), lerp(0.95, 0.8, easeT), lerp(4.4, 5.6, easeT));
      camera.lookAt(0, 0.5, 0);

      const baseY = 1.35;
      leftEarbud.position.set(-1.15, baseY + Math.sin(easeT * Math.PI) * 0.05, 0.28);
      rightEarbud.position.set(1.15, baseY - Math.sin(easeT * Math.PI) * 0.05, 0.28);

      leftEarbud.rotation.set(0.12, lerp(-0.35, 0.05, easeT), 0.05);
      rightEarbud.rotation.set(0.12, lerp(0.35, -0.05, easeT), -0.05);

      soundwaveGroup.position.set(0, baseY, 0.3);
      waveRings.forEach((ring, idx) => {
        const ringProgress = (t * 2.5 + idx * 0.33) % 1.0;
        ring.scale.setScalar(0.45 + ringProgress * 1.9);
        ring.material.opacity = Math.sin(ringProgress * Math.PI) * 0.75 * easeT;
      });
    }

    // -------------------------------------------------------------
    // ACT 5: EXPERIENCE THE DIFFERENCE (0.85 – 1.00)
    // Symmetrical climax reveal framing
    // -------------------------------------------------------------
    else {
      const t = (p - 0.85) / 0.15;
      const easeT = smoothstep(0, 1, t);

      caseLidPivot.rotation.x = -2.05;
      internalCaseLight.intensity = 1.8;

      masterProductGroup.position.set(0, lerp(-0.32, -0.28, easeT), 0);
      masterProductGroup.rotation.set(lerp(0.08, 0.04, easeT), 0, 0);

      // Camera distance: 5.6 to 6.6 (Grand symmetrical framing)
      camera.position.set(0, lerp(0.8, 0.7, easeT), lerp(5.6, 6.6, easeT));
      camera.lookAt(0, 0.25, 0);

      leftEarbud.position.set(lerp(-1.15, -0.9, easeT), lerp(1.35, 1.05, easeT), 0.24);
      rightEarbud.position.set(lerp(1.15, 0.9, easeT), lerp(1.35, 1.05, easeT), 0.24);

      leftEarbud.rotation.set(0.15, -0.15, 0.1);
      rightEarbud.rotation.set(0.15, 0.15, -0.1);

      waveRings.forEach(r => (r.material.opacity = (1 - easeT) * 0.2));
    }
  }

  // ================= 60-120 FPS Physics Render Loop =================
  let animId;
  function renderLoop() {
    currentProgress += (targetProgress - currentProgress) * 0.09;

    // Smooth mouse parallax lerp
    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;

    applyChoreography(currentProgress);

    // Apply interactive mouse parallax tilt
    masterProductGroup.rotation.y += mouseX * 0.04;
    masterProductGroup.rotation.x += mouseY * 0.025;

    // Apply camera shake if any
    camera.position.y += cameraShake.y;
    camera.position.x += cameraShake.x;

    // Subtle ambient particle drift
    particles.rotation.y += 0.0003;

    // Navbar glass tint when scrolled
    if (mainNav) {
      if (window.scrollY > 40) {
        mainNav.classList.add('bg-black/60', 'backdrop-blur-lg');
      } else {
        mainNav.classList.remove('bg-black/60', 'backdrop-blur-lg');
      }
    }

    renderer.render(scene, camera);
    animId = requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);

  // ================= Universal Navigation Smooth Scrolling =================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href === '#' || href === '#pin-wrapper') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Window Resize Listener for Main Scene
  window.addEventListener('resize', () => {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // ================= Slide-Over Bag Drawer =================
  const bagDrawer = document.getElementById('bag-drawer');
  const bagBackdrop = document.getElementById('bag-backdrop');
  const closeBagBtn = document.getElementById('close-bag-btn');
  const navBagBtn = document.getElementById('nav-bag-btn');
  const finalBuyBtn = document.getElementById('final-buy-btn');
  const checkoutBtn = document.getElementById('checkout-btn');

  function openBagDrawer() {
    if (bagDrawer) bagDrawer.classList.add('open');
    if (bagBackdrop) bagBackdrop.classList.add('open');
  }

  function closeBagDrawer() {
    if (bagDrawer) bagDrawer.classList.remove('open');
    if (bagBackdrop) bagBackdrop.classList.remove('open');
  }

  if (navBagBtn) navBagBtn.addEventListener('click', openBagDrawer);
  if (buyNowBtn) buyNowBtn.addEventListener('click', openBagDrawer);
  if (finalBuyBtn) finalBuyBtn.addEventListener('click', openBagDrawer);
  if (closeBagBtn) closeBagBtn.addEventListener('click', closeBagDrawer);
  if (bagBackdrop) bagBackdrop.addEventListener('click', closeBagDrawer);

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      showToast('Order confirmed • AEROVA ONE (Flagship Edition) ₹12,999');
      setTimeout(closeBagDrawer, 1200);
    });
  }

  // ================= Feature 02: Interactive Real-Time ANC Waveform =================
  const ancCanvas = document.getElementById('anc-canvas');
  const ancBtn = document.getElementById('anc-mode-anc');
  const transBtn = document.getElementById('anc-mode-trans');
  const ancStatusLabel = document.getElementById('anc-status-label');

  if (ancCanvas) {
    const ctx = ancCanvas.getContext('2d');
    let ancMode = 'anc';
    let waveTime = 0;

    function resizeAncCanvas() {
      const rect = ancCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancCanvas.width = rect.width * dpr;
      ancCanvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resizeAncCanvas();
    window.addEventListener('resize', resizeAncCanvas);

    if (ancBtn && transBtn) {
      ancBtn.addEventListener('click', () => {
        ancMode = 'anc';
        ancBtn.classList.add('bg-sky-400', 'text-black', 'font-semibold', 'shadow-[0_0_15px_rgba(56,189,248,0.4)]');
        ancBtn.classList.remove('text-slate-400');
        transBtn.classList.remove('bg-sky-400', 'text-black', 'font-semibold', 'shadow-[0_0_15px_rgba(56,189,248,0.4)]');
        transBtn.classList.add('text-slate-400');
        if (ancStatusLabel) ancStatusLabel.textContent = 'ANC Active: 99.4% Silence';
      });

      transBtn.addEventListener('click', () => {
        ancMode = 'transparency';
        transBtn.classList.add('bg-sky-400', 'text-black', 'font-semibold', 'shadow-[0_0_15px_rgba(56,189,248,0.4)]');
        transBtn.classList.remove('text-slate-400');
        ancBtn.classList.remove('bg-sky-400', 'text-black', 'font-semibold', 'shadow-[0_0_15px_rgba(56,189,248,0.4)]');
        ancBtn.classList.add('text-slate-400');
        if (ancStatusLabel) ancStatusLabel.textContent = 'Transparency Active: Natural Ambient Mic Passthrough';
      });
    }

    function renderAncWave() {
      const w = ancCanvas.clientWidth || 600;
      const h = ancCanvas.clientHeight || 200;
      const midY = h / 2;

      ctx.clearRect(0, 0, w, h);
      waveTime += 0.045;

      // 1. Ambient Noise Wave (Warm Amber)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
      ctx.lineWidth = 1.8;
      for (let x = 0; x < w; x++) {
        const freq1 = Math.sin((x * 0.02) + waveTime) * 22;
        const freq2 = Math.sin((x * 0.05) - (waveTime * 1.5)) * 10;
        const noise = (freq1 + freq2) * (ancMode === 'anc' ? 0.8 : 0.6);
        const y = midY + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Anti-Phase Wave (Cool Cyan)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.8;
      for (let x = 0; x < w; x++) {
        const freq1 = Math.sin((x * 0.02) + waveTime) * 22;
        const freq2 = Math.sin((x * 0.05) - (waveTime * 1.5)) * 10;
        const y = ancMode === 'anc' ? midY - (freq1 + freq2) * 0.8 : midY + (freq1 + freq2) * 0.6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3. Resultant Waveform
      ctx.beginPath();
      ctx.strokeStyle = ancMode === 'anc' ? '#38bdf8' : '#34d399';
      ctx.lineWidth = ancMode === 'anc' ? 2.5 : 2.0;
      if (ancMode === 'anc') {
        for (let x = 0; x < w; x++) {
          const residualNoise = Math.sin((x * 0.08) + waveTime * 2) * 1.2;
          const y = midY + residualNoise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        for (let x = 0; x < w; x++) {
          const passthrough = Math.sin((x * 0.02) + waveTime) * 18;
          const y = midY + passthrough;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      requestAnimationFrame(renderAncWave);
    }
    requestAnimationFrame(renderAncWave);
  }

  // ================= Feature 03: Battery Gauge Scroll Animation =================
  const batteryCircle = document.getElementById('battery-svg-circle');
  const batteryText = document.getElementById('battery-percent-text');
  const batterySection = document.getElementById('section-battery');

  if (batteryCircle && batteryText && batterySection) {
    let batteryAnimated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !batteryAnimated) {
          batteryAnimated = true;
          gsap.fromTo(batteryCircle, {
            strokeDashoffset: 264
          }, {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: 'power2.out'
          });

          const countObj = { val: 20 };
          gsap.to(countObj, {
            val: 100,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => {
              batteryText.textContent = Math.round(countObj.val) + '%';
            }
          });
        }
      });
    }, { threshold: 0.35 });

    observer.observe(batterySection);
  }

  // ================= 360° Interactive Product Viewer =================
  const viewer360Container = document.getElementById('viewer-360-container');
  if (viewer360Container) {
    let vWidth = viewer360Container.clientWidth || 800;
    let vHeight = viewer360Container.clientHeight || 500;

    const scene360 = new THREE.Scene();
    const camera360 = new THREE.PerspectiveCamera(36, vWidth / vHeight, 0.1, 50);
    camera360.position.set(0, 0.4, 4.6);

    const renderer360 = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer360.setSize(vWidth, vHeight);
    renderer360.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer360.toneMapping = THREE.ACESFilmicToneMapping;
    renderer360.toneMappingExposure = 1.15;
    renderer360.outputEncoding = THREE.sRGBEncoding;
    viewer360Container.appendChild(renderer360.domElement);

    scene360.environment = envMap;

    const ambLight360 = new THREE.AmbientLight(0x0e1726, 0.45);
    scene360.add(ambLight360);

    const key360 = new THREE.DirectionalLight(0xffffff, 2.2);
    key360.position.set(3.5, 4.5, 3.5);
    scene360.add(key360);

    const rim360 = new THREE.DirectionalLight(0x38bdf8, 2.6);
    rim360.position.set(-4.0, -1.0, -3.0);
    scene360.add(rim360);

    const group360 = new THREE.Group();
    scene360.add(group360);

    const earbud360 = createEarbud(true);
    earbud360.scale.set(1.4, 1.4, 1.4);
    earbud360.position.set(0, 0.15, 0);
    group360.add(earbud360);

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.05, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f1118,
      roughness: 0.35,
      metalness: 0.8
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.25;
    group360.add(pedestal);

    const pedestalRimGeo = new THREE.TorusGeometry(1.405, 0.02, 16, 64);
    const pedestalRimMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });
    const pedestalRim = new THREE.Mesh(pedestalRimGeo, pedestalRimMat);
    pedestalRim.rotation.x = Math.PI / 2;
    pedestalRim.position.y = -1.22;
    group360.add(pedestalRim);

    // Orbit Drag Controls
    let isDragging360 = false;
    let prevX = 0, prevY = 0;
    let targetRotY = 0, targetRotX = 0.08;
    let currentRotY = 0, currentRotX = 0.08;
    let autoRotate = true;

    viewer360Container.addEventListener('pointerdown', (e) => {
      isDragging360 = true;
      prevX = e.clientX;
      prevY = e.clientY;
      autoRotate = false;
      const btn = document.getElementById('btn-360-autorotate');
      if (btn) {
        btn.textContent = '⟳ Auto-Rotate: OFF';
        btn.classList.remove('bg-sky-400', 'text-black');
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging360) return;
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      targetRotY += deltaX * 0.008;
      targetRotX += deltaY * 0.008;
      targetRotX = clamp(targetRotX, -0.65, 0.65);
    });

    window.addEventListener('pointerup', () => {
      isDragging360 = false;
    });

    document.querySelectorAll('.btn-360-angle').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-360-angle').forEach(b => b.classList.remove('active', 'bg-white', 'text-black'));
        btn.classList.add('active', 'bg-white', 'text-black');

        const angle = btn.getAttribute('data-angle');
        autoRotate = false;
        const autoBtn = document.getElementById('btn-360-autorotate');
        if (autoBtn) {
          autoBtn.textContent = '⟳ Auto-Rotate: OFF';
          autoBtn.classList.remove('bg-sky-400', 'text-black');
        }

        if (angle === 'front') {
          targetRotY = 0;
          targetRotX = 0.05;
        } else if (angle === 'beauty') {
          targetRotY = 0.78;
          targetRotX = 0.15;
        } else if (angle === 'driver') {
          targetRotY = -1.25;
          targetRotX = -0.25;
        } else if (angle === 'stem') {
          targetRotY = 3.14;
          targetRotX = 0.1;
        }
      });
    });

    const autoBtn = document.getElementById('btn-360-autorotate');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        autoRotate = !autoRotate;
        autoBtn.textContent = autoRotate ? '⟳ Auto-Rotate: ON' : '⟳ Auto-Rotate: OFF';
        if (autoRotate) {
          autoBtn.classList.add('bg-sky-400', 'text-black');
        } else {
          autoBtn.classList.remove('bg-sky-400', 'text-black');
        }
      });
    }

    function render360Loop() {
      if (autoRotate && !isDragging360) {
        targetRotY += 0.006;
      }

      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;

      group360.rotation.y = currentRotY;
      group360.rotation.x = currentRotX;

      renderer360.render(scene360, camera360);
      requestAnimationFrame(render360Loop);
    }
    requestAnimationFrame(render360Loop);

    window.addEventListener('resize', () => {
      vWidth = viewer360Container.clientWidth || 800;
      vHeight = viewer360Container.clientHeight || 500;
      camera360.aspect = vWidth / vHeight;
      camera360.updateProjectionMatrix();
      renderer360.setSize(vWidth, vHeight);
    });
  }
});
