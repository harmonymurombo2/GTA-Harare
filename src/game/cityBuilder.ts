import * as THREE from 'three';
import {
  createAsphaltTexture,
  createRoadMarkingTexture,
  createZebraTexture,
  createSidewalkTexture,
  createCurbStripeTexture,
  createRibbonWindowTexture,
  createCurtainGlassTexture,
  createOchrePlasterTexture,
  createTerracottaRoofTexture,
  createShopAwningTexture,
  createSignboardTexture
} from './textures';
import { COLLECTIBLES, CollectibleInfo } from './collectiblesData';
import { createJacarandaTree, scatterJacarandaAvenues } from './jacarandaGenerator';

export { createJacarandaTree, scatterJacarandaAvenues };

export interface CollectibleMeshObject {
  info: CollectibleInfo;
  group: THREE.Group;
  initialY: number;
  light: THREE.PointLight;
  isCollected: boolean;
}

export interface CityEnvironment {
  scene: THREE.Scene;
  collisionBoxes: THREE.Box3[];
  collectibles: CollectibleMeshObject[];
  animatables: {
    update: (time: number, dt: number) => void;
  }[];
}

export function buildHarareCBD(scene: THREE.Scene): CityEnvironment {
  const collisionBoxes: THREE.Box3[] = [];
  const collectibles: CollectibleMeshObject[] = [];
  const animatables: { update: (time: number, dt: number) => void }[] = [];

  // ==========================================
  // SHARED PROCEDURAL TEXTURES & MATERIALS
  // ==========================================
  const asphaltTex = createAsphaltTexture();
  const roadMarkingTex = createRoadMarkingTexture();
  const zebraTex = createZebraTexture();
  const sidewalkTex = createSidewalkTexture();
  const curbStripeTex = createCurbStripeTexture();
  const ribbonWinTex = createRibbonWindowTexture('#e2dfd7');
  const ribbonWinDarkTex = createRibbonWindowTexture('#a8a49c');
  const curtainGlassTex = createCurtainGlassTexture();
  const ochreTex = createOchrePlasterTexture();
  const roofTileTex = createTerracottaRoofTexture();
  const awningTex = createShopAwningTexture();

  // Materials
  const asphaltMat = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    roughness: 0.88,
    metalness: 0.12
  });
  const roadMarkingMat = new THREE.MeshStandardMaterial({
    map: roadMarkingTex,
    roughness: 0.75,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  const zebraMat = new THREE.MeshStandardMaterial({
    map: zebraTex,
    roughness: 0.8,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  const sidewalkMat = new THREE.MeshStandardMaterial({
    map: sidewalkTex,
    roughness: 0.85,
    metalness: 0.08
  });
  const curbMat = new THREE.MeshStandardMaterial({
    map: curbStripeTex,
    roughness: 0.7
  });
  const concreteTrimMat = new THREE.MeshStandardMaterial({
    color: 0xdfddd6,
    roughness: 0.9,
    metalness: 0.1
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x242830,
    roughness: 0.4,
    metalness: 0.8
  });
  const goldBrassMat = new THREE.MeshStandardMaterial({
    color: 0xf5b722,
    roughness: 0.28,
    metalness: 0.88
  });
  const glassRoofMat = new THREE.MeshStandardMaterial({
    color: 0x64b5f6,
    roughness: 0.15,
    metalness: 0.85,
    transparent: true,
    opacity: 0.65
  });

  // Reusable helper to register collision box
  function addCollider(box: THREE.Box3) {
    collisionBoxes.push(box);
  }

  function addMeshCollider(mesh: THREE.Mesh | THREE.Group, padding: number = 0.2) {
    const box = new THREE.Box3().setFromObject(mesh);
    box.min.x -= padding;
    box.max.x += padding;
    box.min.z -= padding;
    box.max.z += padding;
    collisionBoxes.push(box);
  }

  // ==========================================
  // 1. GROUND, BOULEVARDS & SIDEWALKS
  // ==========================================
  const groundSize = 240;
  const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
  const groundMesh = new THREE.Mesh(groundGeo, asphaltMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = 0;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Outer boundary walls to keep player within exploration zone
  const boundThickness = 6;
  const boundDist = groundSize * 0.48;
  addCollider(new THREE.Box3(new THREE.Vector3(-boundDist, 0, -boundDist), new THREE.Vector3(boundDist, 20, -boundDist + boundThickness)));
  addCollider(new THREE.Box3(new THREE.Vector3(-boundDist, 0, boundDist - boundThickness), new THREE.Vector3(boundDist, 20, boundDist)));
  addCollider(new THREE.Box3(new THREE.Vector3(-boundDist, 0, -boundDist), new THREE.Vector3(-boundDist + boundThickness, 20, boundDist)));
  addCollider(new THREE.Box3(new THREE.Vector3(boundDist - boundThickness, 0, -boundDist), new THREE.Vector3(boundDist, 20, boundDist)));

  // Main East-West Boulevard (Samora Machel Ave) & North-South Boulevard (Julius Nyerere Way)
  const roadWidth = 20;

  // Road Markings overlay strips
  const ewMarkingGeo = new THREE.PlaneGeometry(groundSize, 14);
  const ewMarking = new THREE.Mesh(ewMarkingGeo, roadMarkingMat);
  ewMarking.rotation.x = -Math.PI / 2;
  ewMarking.rotation.z = Math.PI / 2;
  ewMarking.position.set(0, 0.02, 0);
  ewMarking.receiveShadow = true;
  scene.add(ewMarking);

  const nsMarkingGeo = new THREE.PlaneGeometry(14, groundSize);
  const nsMarking = new THREE.Mesh(nsMarkingGeo, roadMarkingMat);
  nsMarking.rotation.x = -Math.PI / 2;
  nsMarking.position.set(0, 0.02, 0);
  nsMarking.receiveShadow = true;
  scene.add(nsMarking);

  // Zebra Crossings near intersections
  const zebraPositions = [
    { x: 0, z: -16, rot: 0, w: 16, h: 4 },
    { x: 0, z: 16, rot: 0, w: 16, h: 4 },
    { x: -16, z: 0, rot: Math.PI / 2, w: 16, h: 4 },
    { x: 16, z: 0, rot: Math.PI / 2, w: 16, h: 4 }
  ];
  zebraPositions.forEach((zp) => {
    const zGeo = new THREE.PlaneGeometry(zp.w, zp.h);
    const zMesh = new THREE.Mesh(zGeo, zebraMat);
    zMesh.rotation.x = -Math.PI / 2;
    zMesh.rotation.z = zp.rot;
    zMesh.position.set(zp.x, 0.03, zp.z);
    zMesh.receiveShadow = true;
    scene.add(zMesh);
  });

  // Central Intersection Raised Plaza / Island with Zimbabwe Emblem fountain
  const centralPlazaGroup = new THREE.Group();
  const islandGeo = new THREE.CylinderGeometry(8, 8.2, 0.35, 32);
  const islandMesh = new THREE.Mesh(islandGeo, sidewalkMat);
  islandMesh.position.set(0, 0.175, 0);
  islandMesh.receiveShadow = true;
  centralPlazaGroup.add(islandMesh);

  // Black and white hazard curb ring
  const curbRingGeo = new THREE.TorusGeometry(8.1, 0.12, 8, 32);
  const curbRingMesh = new THREE.Mesh(curbRingGeo, curbMat);
  curbRingMesh.rotation.x = Math.PI / 2;
  curbRingMesh.position.set(0, 0.22, 0);
  centralPlazaGroup.add(curbRingMesh);

  // Stepped Plinth in Center
  const plinthBase = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.6, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x9e9587, roughness: 0.8 })
  );
  plinthBase.position.set(0, 0.55, 0);
  plinthBase.castShadow = true;
  plinthBase.receiveShadow = true;
  centralPlazaGroup.add(plinthBase);

  scene.add(centralPlazaGroup);
  addMeshCollider(plinthBase, 0.3);

  // Raised Sidewalks along street corridors
  // Four Quadrants: NE, NW, SE, SW
  const sidewalkHeight = 0.22;
  const quadConfigs = [
    { x: 55, z: 55, w: 85, d: 85 },
    { x: -55, z: 55, w: 85, d: 85 },
    { x: 55, z: -55, w: 85, d: 85 },
    { x: -55, z: -55, w: 85, d: 85 }
  ];

  quadConfigs.forEach((qc) => {
    const swGeo = new THREE.BoxGeometry(qc.w, sidewalkHeight, qc.d);
    const swMesh = new THREE.Mesh(swGeo, sidewalkMat);
    swMesh.position.set(qc.x, sidewalkHeight / 2, qc.z);
    swMesh.receiveShadow = true;
    scene.add(swMesh);

    // Curb edge strips along the road edges
    const curbEdgeGeoEW = new THREE.BoxGeometry(qc.w, 0.26, 0.4);
    const curbEdgeEW = new THREE.Mesh(curbEdgeGeoEW, curbMat);
    const ewSign = qc.z > 0 ? -1 : 1;
    curbEdgeEW.position.set(qc.x, 0.13, qc.z + (ewSign * qc.d / 2) + (ewSign * 0.2));
    scene.add(curbEdgeEW);

    const curbEdgeGeoNS = new THREE.BoxGeometry(0.4, 0.26, qc.d);
    const curbEdgeNS = new THREE.Mesh(curbEdgeGeoNS, curbMat);
    const nsSign = qc.x > 0 ? -1 : 1;
    curbEdgeNS.position.set(qc.x + (nsSign * qc.w / 2) + (nsSign * 0.2), 0.13, qc.z);
    scene.add(curbEdgeNS);
  });

  // ==========================================
  // 2. LANDMARKS FROM UPLOADED HARARE CBD PHOTOS
  // ==========================================

  // LANDMARK 1: Joina City Tower with Iconic Flying Saucer Crown (Photos OIP.webp, RC9X3C)
  // Location: NE Block (x: 48, z: -45)
  const joinaGroup = new THREE.Group();
  joinaGroup.position.set(48, 0, -45);

  // 1. Podium / Mall Base with street-level glass entrances
  const joinaPodiumMat = new THREE.MeshStandardMaterial({
    map: curtainGlassTex,
    roughness: 0.2,
    metalness: 0.8
  });
  const joinaPodium = new THREE.Mesh(new THREE.BoxGeometry(26, 8, 24), joinaPodiumMat);
  joinaPodium.position.set(0, 4, 0);
  joinaPodium.castShadow = true;
  joinaPodium.receiveShadow = true;
  joinaGroup.add(joinaPodium);

  // Podium roof terrace trim
  const podiumTrim = new THREE.Mesh(new THREE.BoxGeometry(27, 0.8, 25), concreteTrimMat);
  podiumTrim.position.set(0, 8.2, 0);
  joinaGroup.add(podiumTrim);

  // 2. Main Tower Shaft (cylindrical glass skyscraper with faceted columns)
  const joinaTowerH = 46;
  const joinaShaftGeo = new THREE.CylinderGeometry(8.2, 8.6, joinaTowerH, 24);
  const joinaShaftMat = new THREE.MeshStandardMaterial({
    map: curtainGlassTex,
    roughness: 0.18,
    metalness: 0.85
  });
  const joinaShaft = new THREE.Mesh(joinaShaftGeo, joinaShaftMat);
  joinaShaft.position.set(0, 8.4 + joinaTowerH / 2, 0);
  joinaShaft.castShadow = true;
  joinaGroup.add(joinaShaft);

  // Vertical exterior structural fins
  for (let a = 0; a < 8; a++) {
    const angle = (a / 8) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.8, joinaTowerH, 1.2), concreteTrimMat);
    fin.position.set(Math.cos(angle) * 8.6, 8.4 + joinaTowerH / 2, Math.sin(angle) * 8.6);
    fin.rotation.y = -angle;
    fin.castShadow = true;
    joinaGroup.add(fin);
  }

  // 3. The Iconic Flying Saucer / Revolving Restaurant Crown
  const saucerY = 8.4 + joinaTowerH + 3.5;
  // Saucer support strut ring
  const strutRing = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 7.5, 4, 16), darkMetalMat);
  strutRing.position.set(0, saucerY - 2, 0);
  joinaGroup.add(strutRing);

  // Main Saucer Disk (beveled disk)
  const saucerGeo = new THREE.CylinderGeometry(13.5, 10, 3.2, 32);
  const saucerMat = new THREE.MeshStandardMaterial({
    color: 0xecf0f1,
    roughness: 0.3,
    metalness: 0.6
  });
  const saucer = new THREE.Mesh(saucerGeo, saucerMat);
  saucer.position.set(0, saucerY, 0);
  saucer.castShadow = true;
  joinaGroup.add(saucer);

  // Saucer Panoramic Glass Band
  const saucerGlassGeo = new THREE.CylinderGeometry(13.6, 13.6, 1.4, 32);
  const saucerGlass = new THREE.Mesh(saucerGlassGeo, glassRoofMat);
  saucerGlass.position.set(0, saucerY, 0);
  joinaGroup.add(saucerGlass);

  // Rooftop Spire & Radome
  const radome = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), concreteTrimMat);
  radome.position.set(0, saucerY + 2.2, 0);
  joinaGroup.add(radome);

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.6, 12, 8), darkMetalMat);
  spire.position.set(0, saucerY + 8, 0);
  spire.castShadow = true;
  joinaGroup.add(spire);

  scene.add(joinaGroup);
  addCollider(new THREE.Box3(new THREE.Vector3(48 - 14, 0, -45 - 13), new THREE.Vector3(48 + 14, 55, -45 + 13)));

  // LANDMARK 2: Charter House with Golden Globe Statue (Photos istockphoto, cbd.webp)
  // Location: SE Block (x: 42, z: 46)
  const charterGroup = new THREE.Group();
  charterGroup.position.set(42, 0, 46);

  // Terracotta/Ochre Tower Body
  const charterH = 38;
  const charterGeo = new THREE.BoxGeometry(18, charterH, 18);
  const charterMat = new THREE.MeshStandardMaterial({
    map: ochreTex,
    roughness: 0.75,
    metalness: 0.15
  });
  const charterBody = new THREE.Mesh(charterGeo, charterMat);
  charterBody.position.set(0, charterH / 2, 0);
  charterBody.castShadow = true;
  charterBody.receiveShadow = true;
  charterGroup.add(charterBody);

  // Stepped rooftop cornice
  const cornice1 = new THREE.Mesh(new THREE.BoxGeometry(19, 1.2, 19), concreteTrimMat);
  cornice1.position.set(0, charterH + 0.6, 0);
  charterGroup.add(cornice1);

  const cornice2 = new THREE.Mesh(new THREE.BoxGeometry(14, 2.5, 14), concreteTrimMat);
  cornice2.position.set(0, charterH + 2.2, 0);
  charterGroup.add(cornice2);

  // Golden Statue Pedestal
  const statuePlinth = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.4, 3, 16), concreteTrimMat);
  statuePlinth.position.set(0, charterH + 4.8, 0);
  charterGroup.add(statuePlinth);

  // Stylized Golden Human Figure holding Globe
  const statueBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3.5, 8), goldBrassMat);
  statueBody.position.set(0, charterH + 7.8, 0);
  charterGroup.add(statueBody);

  const statueArms = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.22, 8, 16, Math.PI), goldBrassMat);
  statueArms.rotation.z = Math.PI;
  statueArms.position.set(0, charterH + 9.5, 0);
  charterGroup.add(statueArms);

  // The Golden Globe / Celestial Sphere
  const globeGeo = new THREE.SphereGeometry(1.6, 16, 16);
  const globeMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x8a6a00,
    emissiveIntensity: 0.35
  });
  const globeMesh = new THREE.Mesh(globeGeo, globeMat);
  globeMesh.position.set(0, charterH + 11.2, 0);
  globeMesh.castShadow = true;
  charterGroup.add(globeMesh);

  // Globe latitude / longitude rings
  const globeRing = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.1, 8, 24), goldBrassMat);
  globeRing.rotation.x = Math.PI / 4;
  globeRing.position.set(0, charterH + 11.2, 0);
  charterGroup.add(globeRing);

  scene.add(charterGroup);
  addCollider(new THREE.Box3(new THREE.Vector3(42 - 10, 0, 46 - 10), new THREE.Vector3(42 + 10, 50, 46 + 10)));

  // LANDMARK 3: Reserve Bank Style Curved Emerald Glass Skyscraper (Photos HWPBK3, RF4M95)
  // Location: NW Block (x: -46, z: -46)
  const reserveGroup = new THREE.Group();
  reserveGroup.position.set(-46, 0, -46);

  const reserveH = 44;
  const reserveMainGeo = new THREE.BoxGeometry(22, reserveH, 18);
  const reserveMat = new THREE.MeshStandardMaterial({
    map: curtainGlassTex,
    roughness: 0.15,
    metalness: 0.9
  });
  const reserveMain = new THREE.Mesh(reserveMainGeo, reserveMat);
  reserveMain.position.set(0, reserveH / 2, 0);
  reserveMain.castShadow = true;
  reserveGroup.add(reserveMain);

  // Stepped setback terraces (characteristic of Harare Reserve Bank)
  const tier2H = 14;
  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(16, tier2H, 14), reserveMat);
  tier2.position.set(0, reserveH + tier2H / 2, 0);
  tier2.castShadow = true;
  reserveGroup.add(tier2);

  // Arched Crown on top
  const archCrownGeo = new THREE.CylinderGeometry(6, 6, 12, 16, 1, false, 0, Math.PI);
  const archCrownMat = new THREE.MeshStandardMaterial({
    color: 0xdde4ec,
    roughness: 0.3,
    metalness: 0.7
  });
  const archCrown = new THREE.Mesh(archCrownGeo, archCrownMat);
  archCrown.rotation.z = Math.PI / 2;
  archCrown.position.set(0, reserveH + tier2H + 2.5, 0);
  reserveGroup.add(archCrown);

  scene.add(reserveGroup);
  addCollider(new THREE.Box3(new THREE.Vector3(-46 - 12, 0, -46 - 10), new THREE.Vector3(-46 + 12, 60, -46 + 10)));

  // LANDMARK 4: Heritage Civic Hall with Terracotta Roof & Clock Tower (Photos RC9X3C, RHR94R)
  // Location: SW Block (x: -42, z: 42)
  const civicGroup = new THREE.Group();
  civicGroup.position.set(-42, 0, 42);

  // 2-story pavilion base
  const civicBaseH = 10;
  const civicBase = new THREE.Mesh(
    new THREE.BoxGeometry(26, civicBaseH, 20),
    new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.85 })
  );
  civicBase.position.set(0, civicBaseH / 2, 0);
  civicBase.castShadow = true;
  civicBase.receiveShadow = true;
  civicGroup.add(civicBase);

  // Arched Colonnade Porch along the front
  for (let c = -10; c <= 10; c += 4) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, civicBaseH, 12), concreteTrimMat);
    col.position.set(c, civicBaseH / 2, 10.6);
    col.castShadow = true;
    civicGroup.add(col);
  }

  // Classic Gabled Terracotta Tile Roof
  const roofGeo = new THREE.ConeGeometry(17, 6, 4);
  const roofMat = new THREE.MeshStandardMaterial({
    map: roofTileTex,
    roughness: 0.85
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, civicBaseH + 3, 0);
  roof.castShadow = true;
  civicGroup.add(roof);

  // Central Clock Tower
  const clockTowerH = 16;
  const clockTower = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, clockTowerH, 5.5),
    new THREE.MeshStandardMaterial({ color: 0xeeebe2, roughness: 0.75 })
  );
  clockTower.position.set(0, civicBaseH + clockTowerH / 2, 0);
  clockTower.castShadow = true;
  civicGroup.add(clockTower);

  // Four Clock Faces
  const clockGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 24);
  const clockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const clockRimMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });

  const clockAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  clockAngles.forEach((ang) => {
    const clockMesh = new THREE.Mesh(clockGeo, clockMat);
    clockMesh.rotation.x = Math.PI / 2;
    clockMesh.rotation.z = ang;
    clockMesh.position.set(Math.sin(ang) * 2.8, civicBaseH + clockTowerH - 3, Math.cos(ang) * 2.8);
    civicGroup.add(clockMesh);

    // Clock Rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.1, 8, 24), clockRimMat);
    rim.rotation.y = ang;
    rim.position.set(Math.sin(ang) * 2.85, civicBaseH + clockTowerH - 3, Math.cos(ang) * 2.85);
    civicGroup.add(rim);
  });

  // Copper Verdigris Spire
  const spireGeo = new THREE.ConeGeometry(2.8, 8, 8);
  const spireMat = new THREE.MeshStandardMaterial({
    color: 0x48967b, // verdigris aged copper green
    roughness: 0.65,
    metalness: 0.35
  });
  const civicSpire = new THREE.Mesh(spireGeo, spireMat);
  civicSpire.position.set(0, civicBaseH + clockTowerH + 4, 0);
  civicSpire.castShadow = true;
  civicGroup.add(civicSpire);

  scene.add(civicGroup);
  addCollider(new THREE.Box3(new THREE.Vector3(-42 - 14, 0, 42 - 11), new THREE.Vector3(-42 + 14, 40, 42 + 12)));

  // LANDMARK 5: Modernist Commercial Block with Blue/White Verandah (Photos OIP.webp, istockphoto)
  // Location: Along North Avenue (x: -12, z: -48)
  const arcadeGroup = new THREE.Group();
  arcadeGroup.position.set(-14, 0, -50);

  const arcadeH = 26;
  const arcadeMesh = new THREE.Mesh(new THREE.BoxGeometry(22, arcadeH, 18), new THREE.MeshStandardMaterial({
    map: ribbonWinTex,
    roughness: 0.75
  }));
  arcadeMesh.position.set(0, arcadeH / 2, 0);
  arcadeMesh.castShadow = true;
  arcadeGroup.add(arcadeMesh);

  // Ground Floor Overhanging Verandah / Awning (classic Harare street shade)
  const awningMesh = new THREE.Mesh(new THREE.BoxGeometry(22.8, 0.4, 4.5), new THREE.MeshStandardMaterial({
    map: awningTex,
    roughness: 0.8
  }));
  awningMesh.position.set(0, 4.2, 9.8);
  awningMesh.castShadow = true;
  arcadeGroup.add(awningMesh);

  // Awning support posts
  for (let p = -10; p <= 10; p += 5) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.2, 8), darkMetalMat);
    post.position.set(p, 2.1, 11.8);
    arcadeGroup.add(post);
  }

  // Commercial Signboard
  const signTex = createSignboardTexture('HARARE COMMERCE', '#1d5fa8', '#ffffff');
  const signMesh = new THREE.Mesh(
    new THREE.BoxGeometry(14, 2.2, 0.3),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6 })
  );
  signMesh.position.set(0, 5.8, 9.1);
  arcadeGroup.add(signMesh);

  scene.add(arcadeGroup);
  addCollider(new THREE.Box3(new THREE.Vector3(-14 - 12, 0, -50 - 10), new THREE.Vector3(-14 + 12, 30, -50 + 10)));

  // SKYLINE FEATURE: Lattice Communications / Radio Tower (Photos RF4M95, RHR94R)
  // Location: Distant skyline corner (x: -78, z: 20)
  const mastGroup = new THREE.Group();
  mastGroup.position.set(-78, 0, 20);

  const mastH = 55;
  const mastGeo = new THREE.CylinderGeometry(0.8, 4.5, mastH, 4);
  const mastMat = new THREE.MeshStandardMaterial({
    color: 0xcc3333,
    roughness: 0.6,
    metalness: 0.6,
    wireframe: true
  });
  const mastMesh = new THREE.Mesh(mastGeo, mastMat);
  mastMesh.position.set(0, mastH / 2, 0);
  mastMesh.rotation.y = Math.PI / 4;
  mastGroup.add(mastMesh);

  // Flashing red warning beacon on top
  const beaconLight = new THREE.PointLight(0xff2222, 2.0, 35);
  beaconLight.position.set(0, mastH + 1, 0);
  mastGroup.add(beaconLight);

  const beaconBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff3333 })
  );
  beaconBulb.position.set(0, mastH + 1, 0);
  mastGroup.add(beaconBulb);

  animatables.push({
    update: (time) => {
      const flash = Math.sin(time * 5.0) > 0.3 ? 2.5 : 0.2;
      beaconLight.intensity = flash;
    }
  });

  scene.add(mastGroup);
  addCollider(new THREE.Box3(new THREE.Vector3(-78 - 5, 0, 20 - 5), new THREE.Vector3(-78 + 5, 60, 20 + 5)));

  // ==========================================
  // 3. SURROUNDING CITY BLOCKS & SKYSCRAPERS
  // ==========================================
  // Creates dense authentic Harare CBD cityscape around the main avenues
  interface BuildingSpec {
    x: number;
    z: number;
    w: number;
    d: number;
    h: number;
    type: 'ribbon' | 'glass' | 'ochre' | 'modern';
    name?: string;
  }

  const cityBlocks: BuildingSpec[] = [
    // NE Quadrant
    { x: 22, z: -46, w: 16, d: 18, h: 32, type: 'ribbon', name: 'ZIMNAT HOUSE' },
    { x: 74, z: -46, w: 20, d: 20, h: 38, type: 'glass', name: 'FIRST MUTUAL' },
    { x: 48, z: -76, w: 22, d: 18, h: 28, type: 'ochre' },
    { x: 74, z: -76, w: 18, d: 20, h: 34, type: 'ribbon' },
    { x: 22, z: -76, w: 16, d: 16, h: 24, type: 'modern' },

    // SE Quadrant
    { x: 20, z: 46, w: 16, d: 18, h: 28, type: 'ochre', name: 'CABS CENTRE' },
    { x: 68, z: 46, w: 18, d: 18, h: 36, type: 'glass' },
    { x: 42, z: 74, w: 20, d: 20, h: 32, type: 'ribbon', name: 'OLD MUTUAL' },
    { x: 68, z: 74, w: 18, d: 18, h: 26, type: 'ochre' },
    { x: 20, z: 74, w: 16, d: 16, h: 22, type: 'modern' },

    // NW Quadrant
    { x: -74, z: -46, w: 20, d: 20, h: 36, type: 'glass', name: 'ANGWA TOWER' },
    { x: -46, z: -76, w: 22, d: 18, h: 30, type: 'ribbon' },
    { x: -18, z: -76, w: 18, d: 18, h: 26, type: 'ochre' },
    { x: -74, z: -76, w: 20, d: 20, h: 40, type: 'glass' },

    // SW Quadrant
    { x: -18, z: 42, w: 16, d: 18, h: 24, type: 'modern', name: 'POST OFFICE' },
    { x: -68, z: 42, w: 18, d: 18, h: 30, type: 'ochre' },
    { x: -42, z: 70, w: 20, d: 18, h: 28, type: 'ribbon' },
    { x: -68, z: 70, w: 18, d: 18, h: 34, type: 'glass' },
    { x: -18, z: 70, w: 16, d: 16, h: 20, type: 'modern' }
  ];

  cityBlocks.forEach((b) => {
    const bGroup = new THREE.Group();
    bGroup.position.set(b.x, 0, b.z);

    let mainMat: THREE.Material;
    if (b.type === 'glass') {
      mainMat = new THREE.MeshStandardMaterial({ map: curtainGlassTex, roughness: 0.2, metalness: 0.85 });
    } else if (b.type === 'ochre') {
      mainMat = new THREE.MeshStandardMaterial({ map: ochreTex, roughness: 0.75, metalness: 0.1 });
    } else if (b.type === 'ribbon') {
      mainMat = new THREE.MeshStandardMaterial({ map: ribbonWinTex, roughness: 0.7 });
    } else {
      mainMat = new THREE.MeshStandardMaterial({ map: ribbonWinDarkTex, roughness: 0.7 });
    }

    // Main volume
    const mainMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), mainMat);
    mainMesh.position.set(0, b.h / 2, 0);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    bGroup.add(mainMesh);

    // Stepped rooftop parapet
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.4, 1.2, b.d + 0.4), concreteTrimMat);
    parapet.position.set(0, b.h + 0.6, 0);
    bGroup.add(parapet);

    // Rooftop equipment (water tanks, HVAC chillers, satellite dishes - prominent in Harare drone photos)
    const tankH = 2.4;
    const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, tankH, 12), darkMetalMat);
    waterTank.position.set(b.w * 0.22, b.h + tankH / 2 + 1.2, b.d * 0.2);
    bGroup.add(waterTank);

    const chiller = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 2.5), darkMetalMat);
    chiller.position.set(-b.w * 0.2, b.h + 0.9 + 1.2, -b.d * 0.18);
    bGroup.add(chiller);

    // Optional commercial sign on podium
    if (b.name) {
      const sTex = createSignboardTexture(b.name, '#152538', '#ffd700');
      const sMesh = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(b.w * 0.75, 12), 2.0, 0.2),
        new THREE.MeshStandardMaterial({ map: sTex, roughness: 0.5 })
      );
      sMesh.position.set(0, 4.5, b.d / 2 + 0.15);
      bGroup.add(sMesh);
    }

    scene.add(bGroup);
    addCollider(new THREE.Box3(
      new THREE.Vector3(b.x - b.w / 2, 0, b.z - b.d / 2),
      new THREE.Vector3(b.x + b.w / 2, b.h + 5, b.z + b.d / 2)
    ));
  });

  // ==========================================
  // 4. STREET FLORA: PROCEDURAL JACARANDA TREES & PALMS
  // ==========================================
  // Harare is globally renowned as "The Sunshine City" for its blooming purple Jacarandas lining avenues.
  // Procedurally generate and scatter low-poly Jacaranda trees along all boulevards, cross-streets, and civic gardens:
  scatterJacarandaAvenues(scene, collisionBoxes, animatables, {
    density: 'lush',
    swayAnimation: true,
    petalCarpet: true
  });

  // Accompanying Royal Palms along select avenue verges
  function createPalmTree(x: number, z: number): THREE.Group {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    // Segmented curved trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x736357, roughness: 0.9 });
    const trunkH = 8.5;
    const trunkGeo = new THREE.CylinderGeometry(0.28, 0.45, trunkH, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(0.3, trunkH / 2, 0);
    trunk.rotation.z = -0.06;
    trunk.castShadow = true;
    palm.add(trunk);

    // Palm fronds canopy (drooping fans)
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.75,
      side: THREE.DoubleSide
    });
    const numFronds = 10;
    for (let f = 0; f < numFronds; f++) {
      const angle = (f / numFronds) * Math.PI * 2;
      const frondGeo = new THREE.ConeGeometry(0.8, 3.8, 4);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(0.3 + Math.cos(angle) * 1.5, trunkH - 0.2, Math.sin(angle) * 1.5);
      frond.rotation.z = Math.PI / 2.3;
      frond.rotation.y = -angle;
      frond.scale.set(1, 1, 0.15);
      palm.add(frond);
    }

    return palm;
  }

  const palmLocations = [
    { x: -75, z: 12 },
    { x: 55, z: 12 },
    { x: -35, z: -12 },
    { x: 35, z: -12 },
    { x: 12, z: -55 },
    { x: 12, z: 55 },
    { x: -12, z: 35 }
  ];

  palmLocations.forEach((pl) => {
    const palm = createPalmTree(pl.x, pl.z);
    scene.add(palm);
    addCollider(new THREE.Box3(new THREE.Vector3(pl.x - 0.6, 0, pl.z - 0.6), new THREE.Vector3(pl.x + 0.6, 9, pl.z + 0.6)));
  });

  // ==========================================
  // 5. STREET FURNITURE & KOMBI MINIBUSES
  // ==========================================
  // Modern curved dual-arm streetlights
  function createStreetLamp(x: number, z: number, rotY: number = 0): THREE.Group {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, z);
    lamp.rotation.y = rotY;

    // Pole
    const poleH = 7.5;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, poleH, 12), darkMetalMat);
    pole.position.set(0, poleH / 2, 0);
    pole.castShadow = true;
    lamp.add(pole);

    // Arched dual arms
    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), darkMetalMat);
    arm1.position.set(0.9, poleH, 0);
    arm1.rotation.z = Math.PI / 3;
    lamp.add(arm1);

    // Light fixture head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.4), darkMetalMat);
    head.position.set(1.8, poleH + 0.4, 0);
    lamp.add(head);

    // Emissive LED bulb
    const bulb = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.35),
      new THREE.MeshBasicMaterial({ color: 0xfffae0, side: THREE.DoubleSide })
    );
    bulb.rotation.x = Math.PI / 2;
    bulb.position.set(1.8, poleH + 0.29, 0);
    lamp.add(bulb);

    return lamp;
  }

  const lampPositions = [
    { x: -25, z: 11, rot: Math.PI / 2 },
    { x: -65, z: 11, rot: Math.PI / 2 },
    { x: 25, z: 11, rot: Math.PI / 2 },
    { x: 65, z: 11, rot: Math.PI / 2 },
    { x: -25, z: -11, rot: -Math.PI / 2 },
    { x: 25, z: -11, rot: -Math.PI / 2 },
    { x: 11, z: -25, rot: 0 },
    { x: 11, z: 25, rot: 0 },
    { x: -11, z: -25, rot: Math.PI },
    { x: -11, z: 25, rot: Math.PI }
  ];
  lampPositions.forEach((lp) => {
    const lamp = createStreetLamp(lp.x, lp.z, lp.rot);
    scene.add(lamp);
    addCollider(new THREE.Box3(new THREE.Vector3(lp.x - 0.4, 0, lp.z - 0.4), new THREE.Vector3(lp.x + 0.4, 8, lp.z + 0.4)));
  });

  // Iconic Harare "Kombi" Commuter Minibuses (White Toyota HiAce style with blue & yellow stripes)
  // Prominent in photos RF4M95, HWPBK3, and OIP.webp
  function createKombiMinibus(x: number, z: number, rotY: number = 0, stripeColor: number = 0x1e88e5): THREE.Group {
    const kombi = new THREE.Group();
    kombi.position.set(x, 0, z);
    kombi.rotation.y = rotY;

    // Van Body (Lower half)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.3, metalness: 0.4 });
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.1, 5.0), bodyMat);
    lowerBody.position.set(0, 0.85, 0);
    lowerBody.castShadow = true;
    kombi.add(lowerBody);

    // Iconic side stripe
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(2.32, 0.28, 4.8),
      new THREE.MeshStandardMaterial({ color: stripeColor, roughness: 0.4 })
    );
    stripe.position.set(0, 0.85, 0);
    kombi.add(stripe);

    // Upper Cabin & Windows
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.95, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x1a2634, roughness: 0.15, metalness: 0.85 })
    );
    cabin.position.set(0, 1.8, -0.2);
    cabin.castShadow = true;
    kombi.add(cabin);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.22, 4.4), bodyMat);
    roof.position.set(0, 2.32, -0.2);
    kombi.add(roof);

    // 4 Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x181a1d, roughness: 0.9 });
    const wheelPositions = [
      { x: -1.15, z: 1.5 },
      { x: 1.15, z: 1.5 },
      { x: -1.15, z: -1.5 },
      { x: 1.15, z: -1.5 }
    ];
    wheelPositions.forEach((wp) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.35, 16), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wp.x, 0.38, wp.z);
      wheel.castShadow = true;
      kombi.add(wheel);
    });

    // Headlights
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.1), headlightMat);
    hl1.position.set(-0.75, 0.9, 2.52);
    kombi.add(hl1);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.1), headlightMat);
    hl2.position.set(0.75, 0.9, 2.52);
    kombi.add(hl2);

    return kombi;
  }

  // Parked Kombis along designated street bays
  const kombiLocations = [
    { x: -18, z: 8.5, rot: 0, c: 0x1e88e5 },
    { x: -26, z: 8.5, rot: 0, c: 0xf59e0b },
    { x: 38, z: -8.5, rot: Math.PI, c: 0x10b981 },
    { x: 48, z: -8.5, rot: Math.PI, c: 0x1e88e5 },
    { x: 8.5, z: 32, rot: Math.PI / 2, c: 0xef4444 },
    { x: -8.5, z: -38, rot: -Math.PI / 2, c: 0xf59e0b }
  ];
  kombiLocations.forEach((kl) => {
    const k = createKombiMinibus(kl.x, kl.z, kl.rot, kl.c);
    scene.add(k);
    addMeshCollider(k, 0.3);
  });

  // Street Benches & Stone Planters
  for (let bx = -30; bx <= 30; bx += 20) {
    if (Math.abs(bx) < 10) continue;
    // Bench on sidewalk
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.5, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.8 })
    );
    bench.position.set(bx, 0.45, 12.8);
    bench.castShadow = true;
    scene.add(bench);
    addCollider(new THREE.Box3(new THREE.Vector3(bx - 1.2, 0, 12.8 - 0.5), new THREE.Vector3(bx + 1.2, 1.2, 12.8 + 0.5)));
  }

  // ==========================================
  // 6. THE 5 CULTURAL COLLECTIBLE ARTIFACTS
  // ==========================================
  // 1: The Great Zimbabwe Bird (Hungwe)
  // 2: Flame Lily Bloom (Kajongwe)
  // 3: Shona Serpentine Sculpture
  // 4: Jacaranda Blossom Crystal
  // 5: Mosi-oa-Tunya Sunstone

  COLLECTIBLES.forEach((c) => {
    const group = new THREE.Group();
    group.position.set(c.position[0], c.position[1], c.position[2]);

    // Ornate Pedestal Base with glowing runes
    const pedBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.0, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0x22262d, roughness: 0.4, metalness: 0.7 })
    );
    pedBase.position.y = -0.7;
    pedBase.receiveShadow = true;
    group.add(pedBase);

    // Concentric glowing energy ring
    const ringGeo = new THREE.TorusGeometry(0.9, 0.05, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: c.emissive });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.5;
    group.add(ring);

    // Dynamic 3D model specific to artifact lore
    let artifactMesh: THREE.Object3D;
    const artColor = new THREE.Color(c.color);
    const artEmissive = new THREE.Color(c.emissive);

    if (c.id === 1) {
      // The Great Zimbabwe Bird (Hungwe)
      const birdGroup = new THREE.Group();
      // Bird body/chest
      const body = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 1.1, 8),
        new THREE.MeshStandardMaterial({ color: artColor, roughness: 0.3, metalness: 0.8, emissive: artEmissive, emissiveIntensity: 0.4 })
      );
      body.rotation.x = Math.PI;
      birdGroup.add(body);
      // Bird head & beak
      const head = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: artColor, roughness: 0.25, metalness: 0.85, emissive: artEmissive, emissiveIntensity: 0.5 })
      );
      head.position.set(0.18, 0.65, 0);
      head.rotation.z = -Math.PI / 3;
      birdGroup.add(head);
      // Wings folded
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.45), goldBrassMat);
      wingL.position.set(0, 0.05, 0.35);
      birdGroup.add(wingL);
      const wingR = wingL.clone();
      wingR.position.z = -0.35;
      birdGroup.add(wingR);
      artifactMesh = birdGroup;
    } else if (c.id === 2) {
      // Flame Lily Bloom (Radiating curling petals)
      const flowerGroup = new THREE.Group();
      const numPetals = 6;
      for (let p = 0; p < numPetals; p++) {
        const angle = (p / numPetals) * Math.PI * 2;
        const petalGeo = new THREE.ConeGeometry(0.18, 0.9, 5);
        const petalMat = new THREE.MeshStandardMaterial({
          color: p % 2 === 0 ? 0xef4444 : 0xf59e0b,
          emissive: 0xff3b30,
          emissiveIntensity: 0.5,
          roughness: 0.3
        });
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(Math.cos(angle) * 0.45, 0.3, Math.sin(angle) * 0.45);
        petal.rotation.z = Math.PI / 4;
        petal.rotation.y = -angle;
        flowerGroup.add(petal);
      }
      // Center pistil
      const pistil = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffe600 })
      );
      pistil.position.y = 0.2;
      flowerGroup.add(pistil);
      artifactMesh = flowerGroup;
    } else if (c.id === 3) {
      // Shona Serpentine Stone Sculpture (smooth abstract organic knot)
      const knotGeo = new THREE.TorusKnotGeometry(0.42, 0.16, 48, 8, 2, 3);
      const knotMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.15,
        metalness: 0.65,
        emissive: 0x059669,
        emissiveIntensity: 0.35
      });
      artifactMesh = new THREE.Mesh(knotGeo, knotMat);
    } else if (c.id === 4) {
      // Jacaranda Blossom Crystal (faceted violet amethyst gem)
      const crystalGeo = new THREE.OctahedronGeometry(0.55, 1);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        roughness: 0.1,
        metalness: 0.85,
        emissive: 0x9333ea,
        emissiveIntensity: 0.5,
        wireframe: false
      });
      artifactMesh = new THREE.Mesh(crystalGeo, crystalMat);
      // Outer orbiting crystal shards
      for (let s = 0; s < 3; s++) {
        const shard = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 4), crystalMat);
        shard.position.set(Math.cos(s * 2.1) * 0.85, 0, Math.sin(s * 2.1) * 0.85);
        artifactMesh.add(shard);
      }
    } else {
      // Mosi-oa-Tunya Sunstone (golden dodecahedron with radiant star)
      const sunGeo = new THREE.DodecahedronGeometry(0.52);
      const sunMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0xd97706,
        emissiveIntensity: 0.6
      });
      artifactMesh = new THREE.Mesh(sunGeo, sunMat);

      // Star halo ring
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 6, 24), new THREE.MeshBasicMaterial({ color: 0xfff066 }));
      halo.rotation.x = Math.PI / 3;
      artifactMesh.add(halo);
    }

    artifactMesh.castShadow = true;
    group.add(artifactMesh);

    // Radiant Point Light casting warm color
    const pLight = new THREE.PointLight(artEmissive.getHex(), 2.8, 12);
    pLight.position.set(0, 0.2, 0);
    group.add(pLight);

    scene.add(group);

    const initialY = c.position[1];
    const itemObj: CollectibleMeshObject = {
      info: c,
      group,
      initialY,
      light: pLight,
      isCollected: false
    };
    collectibles.push(itemObj);

    // Floating and spinning animation
    animatables.push({
      update: (time) => {
        if (!itemObj.isCollected) {
          // Bobbing vertically
          group.position.y = initialY + Math.sin(time * 2.2 + c.id) * 0.22;
          // Spinning
          artifactMesh.rotation.y = time * 1.4;
          ring.rotation.z = time * 0.8;
          // Pulse light
          pLight.intensity = 2.4 + Math.sin(time * 3.5 + c.id) * 0.8;
        }
      }
    });
  });

  return {
    scene,
    collisionBoxes,
    collectibles,
    animatables
  };
}
