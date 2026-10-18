import * as THREE from 'three';

/**
 * Harare Highveld Atmospheric Sky & Sun Rig.
 * Harare is located at 1,490m elevation, featuring crisp high-altitude azure skies,
 * golden sunlight, and soft horizon haze.
 */
export function setupHighveldEnvironment(scene: THREE.Scene): {
  keyLight: THREE.DirectionalLight;
  skyMesh: THREE.Mesh;
} {
  // Horizon fog to blend distant geometry seamlessly
  const horizonColor = new THREE.Color(0xdce2ec);
  scene.fog = new THREE.FogExp2(horizonColor.getHex(), 0.0075);
  scene.background = horizonColor;

  // 1. Hemisphere light (warm highveld sun fill from above, cool ground bounce from below)
  const hemiLight = new THREE.HemisphereLight(0xfff7e6, 0x47494f, 0.75);
  hemiLight.position.set(0, 100, 0);
  scene.add(hemiLight);

  // 2. Main Key Directional Sun Light (golden afternoon angle ~48 degrees)
  const keyLight = new THREE.DirectionalLight(0xfff1d0, 1.4);
  keyLight.position.set(120, 140, 80);
  keyLight.castShadow = true;

  // Tight shadow camera bounds for sharp urban shadows
  const shadowRange = 140;
  keyLight.shadow.camera.left = -shadowRange;
  keyLight.shadow.camera.right = shadowRange;
  keyLight.shadow.camera.top = shadowRange;
  keyLight.shadow.camera.bottom = -shadowRange;
  keyLight.shadow.camera.near = 10;
  keyLight.shadow.camera.far = 380;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0004;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  // 3. Ambient bounce light for shaded building facades and arcades
  const ambient = new THREE.AmbientLight(0xd4e2f5, 0.45);
  scene.add(ambient);

  // 4. Procedural Sky Dome with custom vertex/fragment gradient shader
  const skyGeo = new THREE.SphereGeometry(320, 32, 24);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x2563eb) },    // High-altitude crisp blue
      midColor: { value: new THREE.Color(0x93c5fd) },    // Soft azure mid-sky
      bottomColor: { value: new THREE.Color(0xfaeed9) }, // Golden afternoon horizon
      offset: { value: 20 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        float factor = max(h, 0.0);
        vec3 col;
        if (factor > 0.35) {
          col = mix(midColor, topColor, pow((factor - 0.35) / 0.65, 1.1));
        } else {
          col = mix(bottomColor, midColor, pow(factor / 0.35, exponent));
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyMesh);

  // 5. Sun disk visual
  const sunGeo = new THREE.SphereGeometry(6, 16, 16);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.copy(keyLight.position).normalize().multiplyScalar(290);
  scene.add(sunMesh);

  // 6. Distant horizon terrain ring (The Harare Kopje & rolling highveld ridges)
  const hillsGroup = new THREE.Group();
  const numHills = 24;
  for (let i = 0; i < numHills; i++) {
    const angle = (i / numHills) * Math.PI * 2;
    const r = 260 + (Math.sin(i * 3.7) * 20);
    const hillW = 50 + Math.random() * 40;
    const hillH = 15 + Math.random() * 20;
    const hillD = 35 + Math.random() * 20;

    const hillGeo = new THREE.ConeGeometry(hillW, hillH, 8);
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x8a9ea8,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true
    });
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.position.set(Math.cos(angle) * r, hillH * 0.35 - 3, Math.sin(angle) * r);
    hill.scale.set(1.4, 0.7, 1.4);
    hillsGroup.add(hill);
  }
  scene.add(hillsGroup);

  return { keyLight, skyMesh };
}
