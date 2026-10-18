/**
 * Self-contained Single HTML File Generator for Harare CBD 3D Explorer.
 * Contains the complete Three.js engine, procedural textures, audio synth,
 * player physics, first-person camera, and HUD within a SINGLE file with zero build step!
 */

export function generateStandaloneHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Harare CBD 3D First-Person Exploration</title>
  <meta name="description" content="A 3D first-person exploration game set in Harare CBD, Zimbabwe. Built with modern Three.js in a single standalone HTML file.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body, html { width: 100%; height: 100%; overflow: hidden; background-color: #0b0e14; font-family: 'Plus Jakarta Sans', sans-serif; }
    #canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
    canvas { display: block; width: 100%; height: 100%; }

    /* Crosshair */
    #crosshair {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none; display: none;
    }
    .ch-dot { width: 4px; height: 4px; background: #fff; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.8); }
    .ch-line-h { position: absolute; top: 50%; left: 50%; width: 20px; height: 1.5px; background: rgba(255,255,255,0.45); transform: translate(-50%, -50%); }
    .ch-line-v { position: absolute; top: 50%; left: 50%; width: 1.5px; height: 20px; background: rgba(255,255,255,0.45); transform: translate(-50%, -50%); }

    /* HUD Clusters */
    .hud-layer { position: absolute; inset: 0; pointer-events: none; }
    .hud-box {
      background: rgba(18, 22, 31, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 10px 16px;
      color: #fff;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      pointer-events: auto;
    }
    #top-left-hud { position: absolute; top: 16px; left: 16px; display: flex; align-items: center; gap: 12px; }
    .zw-badge {
      width: 32px; height: 32px; border-radius: 8px; background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.5); color: #fbbf24; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 13px;
    }
    #top-right-hud { position: absolute; top: 16px; right: 16px; text-align: right; border-color: rgba(245, 158, 11, 0.35); }
    .counter-num { font-size: 22px; font-weight: 900; color: #fbbf24; font-family: 'JetBrains Mono', monospace; }

    /* Bottom Controls Dock */
    #bottom-dock {
      position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 14px; font-size: 12px;
      background: rgba(18, 22, 31, 0.92); border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px; padding: 10px 20px; color: #cbd5e1; pointer-events: auto;
      box-shadow: 0 12px 30px rgba(0,0,0,0.6);
    }
    .kbd-tag {
      background: #1e293b; color: #facc15; padding: 2px 6px; border-radius: 6px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
    }

    /* Modals & Overlays */
    .modal-overlay {
      position: absolute; inset: 0; background: rgba(8, 10, 15, 0.85);
      display: flex; align-items: center; justify-content: center; z-index: 50;
      backdrop-filter: blur(4px);
    }
    .modal-card {
      background: #12161f; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 24px;
      padding: 32px; max-width: 520px; width: 92%; text-align: center; color: #fff;
      box-shadow: 0 20px 50px rgba(0,0,0,0.7); position: relative;
    }
    .btn-gold {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: linear-gradient(135deg, #f59e0b, #d97706); color: #0b0e14;
      font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 14px;
      border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
    }
    .btn-gold:hover { transform: scale(1.03); background: linear-gradient(135deg, #fbbf24, #f59e0b); }
    .btn-gold:active { transform: scale(0.97); }

    /* Notification banner */
    #notif-toast {
      position: absolute; top: 80px; left: 50%; transform: translateX(-50%);
      background: #f59e0b; color: #0b0e14; font-weight: 800; padding: 8px 20px;
      border-radius: 30px; font-size: 13px; display: none; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
      z-index: 40; pointer-events: none;
    }
  </style>
  <script type="importmap">
    {
      "imports": {
        "three": "https://esm.sh/three@0.170.0",
        "three/addons/": "https://esm.sh/three@0.170.0/examples/jsm/"
      }
    }
  </script>
</head>
<body>
  <div id="canvas-container"></div>

  <!-- Center Crosshair -->
  <div id="crosshair">
    <div class="ch-line-h"></div>
    <div class="ch-line-v"></div>
    <div class="ch-dot"></div>
  </div>

  <!-- Notification Toast -->
  <div id="notif-toast"></div>

  <!-- In-Game HUD -->
  <div class="hud-layer">
    <!-- Top-Left Location & Compass -->
    <div id="top-left-hud" class="hud-box">
      <div class="zw-badge">ZW</div>
      <div>
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24;">Harare CBD Explorer</div>
        <div style="font-size: 11px; color: #94a3b8;"><span id="hud-heading">360° N</span> · Elev. 1.7m</div>
      </div>
    </div>

    <!-- Top-Right Collectibles Counter -->
    <div id="top-right-hud" class="hud-box">
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Artifacts Found</div>
      <div class="counter-num"><span id="hud-collected-count">0</span> <span style="font-size: 14px; font-weight: 400; color: #64748b;">/ 5</span></div>
    </div>

    <!-- Bottom Dock with Operation Hints -->
    <div id="bottom-dock">
      <div><span class="kbd-tag">W A S D</span> Move</div>
      <div><span class="kbd-tag">SHIFT</span> Run</div>
      <div><span class="kbd-tag">SPACE</span> Jump</div>
      <div><span class="kbd-tag">MOUSE</span> Look</div>
      <div><span class="kbd-tag">ESC</span> Unlock</div>
      <button id="btn-toggle-sound" style="background:#1e293b; border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:8px; padding:4px 10px; cursor:pointer; font-size:11px;">Mute Sound</button>
    </div>
  </div>

  <!-- Title Screen Modal -->
  <div id="title-modal" class="modal-overlay">
    <div class="modal-card">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #fbbf24; font-weight: 800; margin-bottom: 8px;">The Sunshine City · Harare, Zimbabwe</div>
      <h1 style="font-size: 32px; font-weight: 900; letter-spacing: 1px; margin-bottom: 12px; color: #fff;">HARARE CBD</h1>
      <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
        A 3D first-person exploration experience faithfully recreated from neighborhood street photos using Three.js procedural geometry. Modernist towers, blossoming violet Jacarandas, and 5 hidden cultural artifacts.
      </p>
      <button id="btn-start-game" class="btn-gold" style="width: 100%; margin-bottom: 16px;">
        START EXPLORATION
      </button>
      <div style="font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
        WASD to Move · Shift to Run · Mouse to Look
      </div>
    </div>
  </div>

  <!-- Victory Modal -->
  <div id="victory-modal" class="modal-overlay" style="display: none;">
    <div class="modal-card">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #fbbf24; font-weight: 800; margin-bottom: 8px;">Quest Complete</div>
      <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 12px; color: #fff;">Harare Explorer Supreme!</h2>
      <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
        You discovered all 5 sacred cultural artifacts across Harare CBD in <strong id="victory-time-val" style="color: #fbbf24;">0:45</strong>!
      </p>
      <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; text-align: left; font-size: 12px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
        <div style="font-weight: 800; color: #fbbf24; margin-bottom: 6px;">✦ Recovered National Artifacts:</div>
        <div style="color: #e2e8f0; margin-bottom: 4px;">1. The Great Zimbabwe Bird (Hungwe)</div>
        <div style="color: #e2e8f0; margin-bottom: 4px;">2. Flame Lily Bloom (Kajongwe)</div>
        <div style="color: #e2e8f0; margin-bottom: 4px;">3. Shona Serpentine Stone Sculpture</div>
        <div style="color: #e2e8f0; margin-bottom: 4px;">4. Jacaranda Blossom Crystal</div>
        <div style="color: #e2e8f0;">5. Mosi-oa-Tunya Sunstone</div>
      </div>
      <button id="btn-victory-restart" class="btn-gold" style="width: 100%;">
        EXPLORE AGAIN
      </button>
    </div>
  </div>

  <!-- GAME IMPLEMENTATION SCRIPT -->
  <script type="module">
    import * as THREE from 'three';

    // ----------------------------------------
    // PROCEDURAL AUDIO SYNTHESIZER
    // ----------------------------------------
    class SoundSystem {
      constructor() {
        this.ctx = null;
        this.muted = false;
      }
      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
      }
      playStep(run) {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(run ? 95 : 80, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);
        gain.gain.setValueAtTime(run ? 0.1 : 0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        osc.start(t); osc.stop(t + 0.09);
      }
      playCollect(idx) {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const freqs = [369.99, 415.30, 466.16, 554.37, 622.25, 739.99];
        [freqs[idx % 6], freqs[(idx + 2) % 6], freqs[(idx + 4) % 6]].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t + i * 0.08);
          gain.gain.setValueAtTime(0.001, t + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.25, t + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.7);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(t + i * 0.08); osc.stop(t + i * 0.08 + 0.75);
        });
      }
      playVictory() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        [440, 554, 659, 880].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t + i * 0.2);
          gain.gain.setValueAtTime(0.2, t + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.5);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(t + i * 0.2); osc.stop(t + i * 0.2 + 0.55);
        });
      }
    }
    const sound = new SoundSystem();

    // ----------------------------------------
    // PROCEDURAL TEXTURE GENERATORS
    // ----------------------------------------
    function createTexture(painter, rx=1, ry=1) {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      painter(canvas.getContext('2d'), 256, 256);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(rx, ry);
      return tex;
    }

    const asphaltTex = createTexture((ctx, w, h) => {
      ctx.fillStyle = '#22252a'; ctx.fillRect(0,0,w,h);
      ctx.fillStyle = '#f0f3f6'; ctx.fillRect(w/2 - 4, 20, 8, 80); ctx.fillRect(w/2 - 4, 150, 8, 80);
      ctx.fillStyle = '#e8b832'; ctx.fillRect(10, 0, 6, h); ctx.fillRect(w-16, 0, 6, h);
    }, 1, 10);

    const sidewalkTex = createTexture((ctx, w, h) => {
      ctx.fillStyle = '#c5c2ba'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle = '#9e998f'; ctx.lineWidth = 2;
      for(let x=0; x<=w; x+=64) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for(let y=0; y<=h; y+=64) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    }, 6, 6);

    const curbTex = createTexture((ctx, w, h) => {
      for(let i=0; i<4; i++) {
        ctx.fillStyle = i%2===0 ? '#1a1b1e' : '#f5f5f5';
        ctx.fillRect(i*64, 0, 64, h);
      }
    }, 8, 1);

    const ribbonWinTex = createTexture((ctx, w, h) => {
      ctx.fillStyle = '#dfddd6'; ctx.fillRect(0,0,w,h);
      ctx.fillStyle = '#1c2e3d'; ctx.fillRect(0, 40, w, 60); ctx.fillRect(0, 160, w, 60);
      ctx.fillStyle = '#0f172a';
      for(let x=0; x<w; x+=32) { ctx.fillRect(x, 40, 2, 60); ctx.fillRect(x, 160, 2, 60); }
    }, 3, 6);

    const curtainGlassTex = createTexture((ctx, w, h) => {
      ctx.fillStyle = '#0f2938'; ctx.fillRect(0,0,w,h);
      for(let x=0; x<w; x+=32) {
        for(let y=0; y<h; y+=64) {
          ctx.fillStyle = '#164e63'; ctx.fillRect(x+2, y+2, 28, 60);
          ctx.strokeStyle = '#324a5e'; ctx.strokeRect(x+1, y+1, 30, 62);
        }
      }
    }, 4, 8);

    const ochreTex = createTexture((ctx, w, h) => {
      ctx.fillStyle = '#c88748'; ctx.fillRect(0,0,w,h);
      for(let x=16; x<w; x+=48) {
        for(let y=16; y<h; y+=64) {
          ctx.fillStyle = '#eeebe2'; ctx.fillRect(x, y, 24, 36);
          ctx.fillStyle = '#1e293b'; ctx.fillRect(x+3, y+3, 18, 30);
        }
      }
    }, 3, 5);

    // ----------------------------------------
    // THREE.JS SCENE SETUP
    // ----------------------------------------
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce2ec);
    scene.fog = new THREE.FogExp2(0xdce2ec, 0.0075);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.rotation.order = 'YXZ';

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xfff7e6, 0x47494f, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1d0, 1.4);
    keyLight.position.set(120, 140, 80);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.left = -120;
    keyLight.shadow.camera.right = 120;
    keyLight.shadow.camera.top = 120;
    keyLight.shadow.camera.bottom = -120;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 350;
    scene.add(keyLight);

    // Sky Dome
    const skyGeo = new THREE.SphereGeometry(300, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, side: THREE.BackSide });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Ground Plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ----------------------------------------
    // CITY CONSTRUCTION
    // ----------------------------------------
    const collisionBoxes = [];
    const animatables = [];

    function addCollider(minX, minY, minZ, maxX, maxY, maxZ) {
      collisionBoxes.push(new THREE.Box3(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ)));
    }

    // Sidewalks
    const sidewalkMat = new THREE.MeshStandardMaterial({ map: sidewalkTex, roughness: 0.85 });
    const curbMat = new THREE.MeshStandardMaterial({ map: curbTex, roughness: 0.7 });

    const quads = [
      { x: 55, z: 55, w: 85, d: 85 },
      { x: -55, z: 55, w: 85, d: 85 },
      { x: 55, z: -55, w: 85, d: 85 },
      { x: -55, z: -55, w: 85, d: 85 }
    ];
    quads.forEach(q => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(q.w, 0.22, q.d), sidewalkMat);
      sw.position.set(q.x, 0.11, q.z);
      sw.receiveShadow = true;
      scene.add(sw);
    });

    // Central Island
    const island = new THREE.Mesh(new THREE.CylinderGeometry(8, 8.2, 0.35, 32), sidewalkMat);
    island.position.set(0, 0.175, 0);
    island.receiveShadow = true;
    scene.add(island);

    // Landmark 1: Joina City Saucer Tower (Photo OIP.webp)
    const joinaGroup = new THREE.Group();
    joinaGroup.position.set(48, 0, -45);
    const jTower = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.6, 46, 24), new THREE.MeshStandardMaterial({ map: curtainGlassTex, roughness: 0.2, metalness: 0.8 }));
    jTower.position.set(0, 23, 0); jTower.castShadow = true;
    joinaGroup.add(jTower);
    const jSaucer = new THREE.Mesh(new THREE.CylinderGeometry(13.5, 10, 3.2, 32), new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.3 }));
    jSaucer.position.set(0, 48, 0); jSaucer.castShadow = true;
    joinaGroup.add(jSaucer);
    const jSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.6, 12, 8), new THREE.MeshStandardMaterial({ color: 0x222 }));
    jSpire.position.set(0, 56, 0);
    joinaGroup.add(jSpire);
    scene.add(joinaGroup);
    addCollider(34, 0, -58, 62, 60, -32);

    // Landmark 2: Charter House with Golden Globe (Photos istockphoto & cbd.webp)
    const charterGroup = new THREE.Group();
    charterGroup.position.set(42, 0, 46);
    const cBody = new THREE.Mesh(new THREE.BoxGeometry(18, 38, 18), new THREE.MeshStandardMaterial({ map: ochreTex, roughness: 0.7 }));
    cBody.position.set(0, 19, 0); cBody.castShadow = true;
    charterGroup.add(cBody);
    const cGlobe = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.9, emissive: 0x8a6a00 }));
    cGlobe.position.set(0, 45, 0);
    charterGroup.add(cGlobe);
    scene.add(charterGroup);
    addCollider(32, 0, 36, 52, 50, 56);

    // Landmark 3: Reserve Bank style curved emerald tower
    const resBody = new THREE.Mesh(new THREE.BoxGeometry(22, 44, 18), new THREE.MeshStandardMaterial({ map: curtainGlassTex, roughness: 0.2, metalness: 0.8 }));
    resBody.position.set(-46, 22, -46); resBody.castShadow = true;
    scene.add(resBody);
    addCollider(-58, 0, -56, -34, 50, -36);

    // Landmark 4: Heritage Civic Hall with Clock Tower
    const civicGroup = new THREE.Group();
    civicGroup.position.set(-42, 0, 42);
    const cvBody = new THREE.Mesh(new THREE.BoxGeometry(26, 10, 20), new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.8 }));
    cvBody.position.set(0, 5, 0); cvBody.castShadow = true;
    civicGroup.add(cvBody);
    const cvClock = new THREE.Mesh(new THREE.BoxGeometry(5.5, 16, 5.5), new THREE.MeshStandardMaterial({ color: 0xeeebe2, roughness: 0.7 }));
    cvClock.position.set(0, 18, 0); cvClock.castShadow = true;
    civicGroup.add(cvClock);
    const cvSpire = new THREE.Mesh(new THREE.ConeGeometry(2.8, 8, 8), new THREE.MeshStandardMaterial({ color: 0x48967b, roughness: 0.6 }));
    cvSpire.position.set(0, 30, 0);
    civicGroup.add(cvSpire);
    scene.add(civicGroup);
    addCollider(-56, 0, 31, -28, 35, 53);

    // Surrounding Modernist High-Rises
    const blocks = [
      { x: 22, z: -46, w: 16, d: 18, h: 32, m: ribbonWinTex },
      { x: 74, z: -46, w: 20, d: 20, h: 38, m: curtainGlassTex },
      { x: -74, z: -46, w: 20, d: 20, h: 36, m: curtainGlassTex },
      { x: -18, z: 42, w: 16, d: 18, h: 24, m: ribbonWinTex },
      { x: 68, z: 46, w: 18, d: 18, h: 36, m: curtainGlassTex },
      { x: 42, z: 74, w: 20, d: 20, h: 32, m: ribbonWinTex },
      { x: -42, z: 70, w: 20, d: 18, h: 28, m: ochreTex }
    ];
    blocks.forEach(b => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), new THREE.MeshStandardMaterial({ map: b.m, roughness: 0.7 }));
      mesh.position.set(b.x, b.h/2, b.z); mesh.castShadow = true; mesh.receiveShadow = true;
      scene.add(mesh);
      addCollider(b.x - b.w/2, 0, b.z - b.d/2, b.x + b.w/2, b.h + 2, b.z + b.d/2);
    });

    // Procedural Low-Poly Jacaranda Tree Generator (Harare Purple Avenues)
    const jacarandaColors = [0x9d54db, 0xb36cee, 0x863ebd, 0xa855f7, 0x7c3aed, 0xc084fc];
    function createJacarandaTree(x, z, scale = 1.0, seed = 0) {
      const g = new THREE.Group();
      g.position.set(x, 0.22, z);
      g.rotation.y = (seed * 1.618) % (Math.PI * 2);

      const barkMat = new THREE.MeshStandardMaterial({ color: 0x3d312a, roughness: 0.95, flatShading: true });
      // Base collar
      const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * scale, 0.42 * scale, 0.45 * scale, 7), barkMat);
      baseCollar.position.y = (0.45 * scale) / 2; baseCollar.castShadow = true; g.add(baseCollar);

      // Thin curved trunk
      const lowerTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.24 * scale, 2.4 * scale, 7), barkMat);
      lowerTrunk.position.set(0.04 * scale, 0.45 * scale + 1.2 * scale, 0);
      lowerTrunk.rotation.z = -0.06; lowerTrunk.castShadow = true; g.add(lowerTrunk);

      const upperTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 2.0 * scale, 6), barkMat);
      upperTrunk.position.set(0.16 * scale, 2.85 * scale + 0.9 * scale, 0.05 * scale);
      upperTrunk.rotation.z = -0.12; upperTrunk.castShadow = true; g.add(upperTrunk);

      // Limbs
      const br1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.11 * scale, 1.5 * scale, 5), barkMat);
      br1.position.set(-0.35 * scale, 3.65 * scale, 0.3 * scale);
      br1.rotation.set(0.4, 0.2, 0.65); br1.castShadow = true; g.add(br1);

      const br2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.1 * scale, 1.4 * scale, 5), barkMat);
      br2.position.set(0.45 * scale, 3.95 * scale, -0.3 * scale);
      br2.rotation.set(-0.35, -0.2, -0.6); br2.castShadow = true; g.add(br2);

      // Low-poly purple canopy clusters
      const clusters = [
        { x: 0.1, y: 5.2, z: 0.05, r: 2.3, c: 0 },
        { x: 1.4, y: 4.6, z: 0.8, r: 1.8, c: 1 },
        { x: -1.3, y: 4.8, z: -0.6, r: 1.75, c: 2 },
        { x: 0.3, y: 6.1, z: -0.9, r: 1.9, c: 3 },
        { x: -0.8, y: 5.5, z: 1.2, r: 1.65, c: 4 }
      ];
      clusters.forEach(cl => {
        const cColor = jacarandaColors[(cl.c + (seed % 3)) % jacarandaColors.length];
        const fMat = new THREE.MeshStandardMaterial({ color: cColor, roughness: 0.82, flatShading: true });
        const cluster = new THREE.Mesh(new THREE.DodecahedronGeometry(cl.r * scale, 1), fMat);
        cluster.position.set(cl.x * scale, cl.y * scale, cl.z * scale);
        cluster.scale.set(1.15, 0.85, 1.15); cluster.castShadow = true; cluster.receiveShadow = true;
        g.add(cluster);
      });

      // Ground petal carpet
      const carpet = new THREE.Mesh(
        new THREE.CircleGeometry(2.8 * scale, 14),
        new THREE.MeshBasicMaterial({ color: 0x9333ea, transparent: true, opacity: 0.45, depthWrite: false })
      );
      carpet.rotation.x = -Math.PI / 2; carpet.position.y = 0.02; g.add(carpet);

      scene.add(g);
      addCollider(x - 0.45 * scale, 0, z - 0.45 * scale, x + 0.45 * scale, 5 * scale, z + 0.45 * scale);
      return g;
    }

    // Scatter Jacarandas along Samora Machel Ave, Julius Nyerere Way & civic gardens
    for (let x = -88; x <= 88; x += 18) {
      if (Math.abs(x) < 14) continue;
      createJacarandaTree(x + Math.sin(x)*1.2, 12.8, 1.0 + (x % 5)*0.03, x);
      createJacarandaTree(x + Math.cos(x)*1.2, -12.8, 0.95 + (x % 4)*0.04, x + 3);
    }
    for (let z = -88; z <= 88; z += 18) {
      if (Math.abs(z) < 14) continue;
      createJacarandaTree(12.8, z + Math.sin(z)*1.2, 1.05 + (z % 3)*0.03, z + 1);
      createJacarandaTree(-12.8, z + Math.cos(z)*1.2, 0.98 + (z % 4)*0.03, z + 5);
    }
    // Freedom Plaza surrounding grove
    [0.4, 1.2, 2.0, 2.8, 3.6, 4.4, 5.2, 6.0].forEach((ang, i) => {
      createJacarandaTree(Math.cos(ang) * 17.5, Math.sin(ang) * 17.5, 1.1, i * 7);
    });

    // ----------------------------------------
    // 5 COLLECTIBLES
    // ----------------------------------------
    const collectibleData = [
      { id: 1, name: 'The Great Zimbabwe Bird', pos: [0, 1.3, 5], color: 0xd4af37 },
      { id: 2, name: 'Flame Lily Bloom', pos: [-42, 1.3, 36], color: 0xef4444 },
      { id: 3, name: 'Shona Serpentine Sculpture', pos: [46, 1.3, -40], color: 0x10b981 },
      { id: 4, name: 'Jacaranda Blossom Crystal', pos: [-46, 1.3, -45], color: 0xa855f7 },
      { id: 5, name: 'Mosi-oa-Tunya Sunstone', pos: [38, 1.3, 42], color: 0xf59e0b }
    ];

    const collectibles = [];
    collectibleData.forEach(c => {
      const g = new THREE.Group();
      g.position.set(c.pos[0], c.pos[1], c.pos[2]);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x222 }));
      base.position.y = -0.6; g.add(base);

      const art = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), new THREE.MeshStandardMaterial({
        color: c.color, roughness: 0.2, metalness: 0.8, emissive: c.color, emissiveIntensity: 0.5
      }));
      art.castShadow = true; g.add(art);

      const light = new THREE.PointLight(c.color, 2.5, 10);
      g.add(light);
      scene.add(g);

      collectibles.push({ data: c, group: g, art, light, collected: false, initY: c.pos[1] });
    });

    // ----------------------------------------
    // PLAYER CONTROLS & PHYSICS
    // ----------------------------------------
    let playerPos = new THREE.Vector3(0, 0.22, 16);
    let playerVel = new THREE.Vector3();
    let isGrounded = true;
    let isLocked = false;
    let yaw = Math.PI;
    let pitch = 0;
    const eyeHeight = 1.7;
    const input = { forward: false, backward: false, left: false, right: false, run: false, jump: false };

    function getElevation(x, z) {
      if (x*x + z*z < 8.2*8.2) return 0.35;
      if (Math.abs(x) < 10.2 || Math.abs(z) < 10.2) return 0.0;
      return 0.22;
    }

    window.addEventListener('keydown', e => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') input.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') input.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') input.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') input.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') input.run = true;
      if (e.code === 'Space') input.jump = true;
    });

    window.addEventListener('keyup', e => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') input.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') input.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') input.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') input.run = false;
      if (e.code === 'Space') input.jump = false;
    });

    document.addEventListener('pointerlockchange', () => {
      isLocked = document.pointerLockElement === document.body;
      document.getElementById('crosshair').style.display = isLocked ? 'block' : 'none';
    });

    window.addEventListener('mousemove', e => {
      if (!isLocked) return;
      yaw -= e.movementX * 0.0022;
      pitch -= e.movementY * 0.0022;
      pitch = Math.max(-1.45, Math.min(1.45, pitch));
    });

    function checkCollision(x, z) {
      const r = 0.45;
      for(let i=0; i<collisionBoxes.length; i++) {
        const b = collisionBoxes[i];
        if (x+r > b.min.x && x-r < b.max.x && z+r > b.min.z && z-r < b.max.z && playerPos.y + eyeHeight > b.min.y && playerPos.y < b.max.y) {
          return true;
        }
      }
      return false;
    }

    // ----------------------------------------
    // UI & GAME LOOP
    // ----------------------------------------
    let collectedCount = 0;
    let gameStartTime = Date.now();
    let isGameOver = false;
    let stepTimer = 0;

    function showToast(text) {
      const t = document.getElementById('notif-toast');
      t.innerText = text; t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    document.getElementById('btn-start-game').addEventListener('click', () => {
      document.getElementById('title-modal').style.display = 'none';
      document.body.requestPointerLock();
      sound.init();
      gameStartTime = Date.now();
    });

    document.getElementById('btn-victory-restart').addEventListener('click', () => {
      location.reload();
    });

    document.getElementById('btn-toggle-sound').addEventListener('click', (e) => {
      sound.muted = !sound.muted;
      e.target.innerText = sound.muted ? 'Unmute' : 'Mute';
    });

    container.addEventListener('click', () => {
      if (document.getElementById('title-modal').style.display === 'none' && !isGameOver) {
        document.body.requestPointerLock();
      }
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Camera orientation & physics
      if (isLocked) {
        const speed = input.run ? 9.2 : 4.8;
        const forwardX = -Math.sin(yaw), forwardZ = -Math.cos(yaw);
        const rightX = Math.cos(yaw), rightZ = -Math.sin(yaw);

        let mx = 0, mz = 0;
        if (input.forward) { mx += forwardX; mz += forwardZ; }
        if (input.backward) { mx -= forwardX; mz -= forwardZ; }
        if (input.right) { mx += rightX; mz += rightZ; }
        if (input.left) { mx -= rightX; mz -= rightZ; }

        const len = Math.hypot(mx, mz);
        if (len > 0.01) {
          playerVel.x = (mx / len) * speed;
          playerVel.z = (mz / len) * speed;

          if (isGrounded) {
            stepTimer += dt;
            if (stepTimer >= (input.run ? 0.32 : 0.48)) {
              sound.playStep(input.run);
              stepTimer = 0;
            }
          }
        } else {
          playerVel.x *= 0.7; playerVel.z *= 0.7;
        }

        if (input.jump && isGrounded) {
          playerVel.y = 7.5; isGrounded = false;
        }

        if (!isGrounded) playerVel.y -= 22.0 * dt;

        // Apply movement & collisions
        const nextX = playerPos.x + playerVel.x * dt;
        const nextZ = playerPos.z + playerVel.z * dt;
        const nextY = playerPos.y + playerVel.y * dt;

        if (!checkCollision(nextX, playerPos.z)) playerPos.x = nextX;
        if (!checkCollision(playerPos.x, nextZ)) playerPos.z = nextZ;

        const elev = getElevation(playerPos.x, playerPos.z);
        if (nextY <= elev) {
          playerPos.y = elev; playerVel.y = 0; isGrounded = true;
        } else {
          playerPos.y = nextY;
        }
      }

      // Update camera
      camera.position.set(playerPos.x, playerPos.y + eyeHeight, playerPos.z);
      camera.rotation.set(pitch, yaw, 0, 'YXZ');

      // Update heading HUD
      let deg = Math.round(((-yaw * 180) / Math.PI) % 360);
      if (deg < 0) deg += 360;
      document.getElementById('hud-heading').innerText = deg + '°';

      // Update Collectibles animation & pickup check
      collectibles.forEach((c, idx) => {
        if (!c.collected) {
          c.group.position.y = c.initY + Math.sin(time * 2.2 + idx) * 0.2;
          c.art.rotation.y = time * 1.5;

          const dist = Math.hypot(c.group.position.x - playerPos.x, c.group.position.z - playerPos.z);
          if (dist < 2.2) {
            c.collected = true;
            scene.remove(c.group);
            collectedCount++;
            document.getElementById('hud-collected-count').innerText = collectedCount;
            sound.playCollect(collectedCount);
            showToast('✦ Found: ' + c.data.name + '!');

            if (collectedCount === 5) {
              isGameOver = true;
              document.exitPointerLock();
              sound.playVictory();
              const elapsed = Math.round((Date.now() - gameStartTime) / 1000);
              const m = Math.floor(elapsed / 60), s = elapsed % 60;
              document.getElementById('victory-time-val').innerText = m + ':' + (s < 10 ? '0' : '') + s;
              document.getElementById('victory-modal').style.display = 'flex';
            }
          }
        }
      });

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
`;
}
