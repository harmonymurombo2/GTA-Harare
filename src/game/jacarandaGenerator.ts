import * as THREE from 'three';

export interface JacarandaTreeInstance {
  group: THREE.Group;
  trunk: THREE.Mesh;
  canopyClusters: THREE.Mesh[];
  swaySpeed: number;
  swayAmplitude: number;
  swayOffset: number;
}

export interface JacarandaScatterOptions {
  density?: 'standard' | 'lush' | 'dense';
  swayAnimation?: boolean;
  petalCarpet?: boolean;
}

// Procedural organic color variations for Harare Jacarandas
const JACARANDA_PALETTE = [
  0x9d54db, // Classic Harare lilac
  0xb36cee, // Vibrant lavender
  0x863ebd, // Deep royal violet
  0xa855f7, // Bright magenta-purple
  0x7c3aed, // Vivid electric violet
  0x6d28d9, // Twilight purple
  0xc084fc  // Soft petal blossom
];

/**
 * Procedurally constructs a single low-poly Jacaranda tree model.
 * Conforms to Three.js guidelines:
 * - 3–12 part composite group across primary silhouette, secondary read, and accent details
 * - Thin, gracefully curved & tapered trunk
 * - Multi-cluster low-poly faceted purple floral canopy
 * - Ground petal carpet flush with sidewalk
 */
export function createJacarandaTree(
  x: number,
  z: number,
  groundElevation: number = 0.22,
  scale: number = 1.0,
  randomSeed: number = 0
): JacarandaTreeInstance {
  const treeGroup = new THREE.Group();
  treeGroup.position.set(x, groundElevation, z);

  // Randomize subtle tilt and rotation based on seed
  const rotY = (randomSeed * 1.618) % (Math.PI * 2);
  treeGroup.rotation.y = rotY;

  // 1. PRIMARY SILHOUETTE: Thin, tapered, branching organic trunk
  // Bark Material (dark weathered wood with rough matte finish)
  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x3d312a,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true
  });

  // Base root collar (wider base sitting flush on ground)
  const baseCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24 * scale, 0.42 * scale, 0.45 * scale, 7),
    barkMat
  );
  baseCollar.position.y = (0.45 * scale) / 2;
  baseCollar.castShadow = true;
  baseCollar.receiveShadow = true;
  treeGroup.add(baseCollar);

  // Lower trunk segment (slight natural tilt)
  const lowerH = 2.4 * scale;
  const lowerTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.24 * scale, lowerH, 7),
    barkMat
  );
  lowerTrunk.position.set(0.04 * scale, 0.45 * scale + lowerH / 2, 0);
  lowerTrunk.rotation.z = -0.06;
  lowerTrunk.rotation.x = 0.04;
  lowerTrunk.castShadow = true;
  treeGroup.add(lowerTrunk);

  // Upper trunk segment with fork
  const upperH = 2.0 * scale;
  const upperTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, upperH, 6),
    barkMat
  );
  upperTrunk.position.set(0.16 * scale, 0.45 * scale + lowerH + upperH / 2 - 0.1 * scale, 0.05 * scale);
  upperTrunk.rotation.z = -0.12;
  upperTrunk.castShadow = true;
  treeGroup.add(upperTrunk);

  // Secondary boughs / limbs reaching outwards to support the broad umbrella canopy
  const branch1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07 * scale, 0.11 * scale, 1.6 * scale, 5),
    barkMat
  );
  branch1.position.set(-0.35 * scale, 0.45 * scale + lowerH + 0.8 * scale, 0.3 * scale);
  branch1.rotation.set(0.4, 0.2, 0.65);
  branch1.castShadow = true;
  treeGroup.add(branch1);

  const branch2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06 * scale, 0.1 * scale, 1.5 * scale, 5),
    barkMat
  );
  branch2.position.set(0.45 * scale, 0.45 * scale + lowerH + 1.1 * scale, -0.3 * scale);
  branch2.rotation.set(-0.35, -0.2, -0.6);
  branch2.castShadow = true;
  treeGroup.add(branch2);

  // 2. SECONDARY READ & ACCENT: Multi-part faceted purple floral canopy
  // Jacarandas form wide, rounded umbrella-like crowns heavy with purple bell flowers
  const canopyClusters: THREE.Mesh[] = [];

  const clusterConfigs = [
    { x: 0.1, y: 5.2, z: 0.05, r: 2.3, colorIdx: 0, sX: 1.15, sY: 0.85, sZ: 1.15 },
    { x: 1.4, y: 4.6, z: 0.8, r: 1.8, colorIdx: 1, sX: 1.1, sY: 0.8, sZ: 1.0 },
    { x: -1.3, y: 4.8, z: -0.6, r: 1.75, colorIdx: 2, sX: 1.0, sY: 0.85, sZ: 1.1 },
    { x: 0.3, y: 6.1, z: -0.9, r: 1.9, colorIdx: 3, sX: 1.1, sY: 0.85, sZ: 1.05 },
    { x: -0.8, y: 5.5, z: 1.2, r: 1.65, colorIdx: 4, sX: 1.05, sY: 0.8, sZ: 1.1 },
    { x: 1.2, y: 5.3, z: -1.1, r: 1.5, colorIdx: 5, sX: 0.95, sY: 0.75, sZ: 1.0 }
  ];

  clusterConfigs.forEach((cfg) => {
    // Select blossom color with per-tree variation
    const baseColor = JACARANDA_PALETTE[(cfg.colorIdx + (randomSeed % 4)) % JACARANDA_PALETTE.length];
    const foliageMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.82,
      metalness: 0.08,
      flatShading: true // Low-poly faceted aesthetic
    });

    // Dodecahedron geometry provides the iconic angular low-poly blossom look
    const geo = new THREE.DodecahedronGeometry(cfg.r * scale, 1);
    const cluster = new THREE.Mesh(geo, foliageMat);
    cluster.position.set(cfg.x * scale, cfg.y * scale, cfg.z * scale);
    cluster.scale.set(cfg.sX, cfg.sY, cfg.sZ);
    cluster.castShadow = true;
    cluster.receiveShadow = true;

    treeGroup.add(cluster);
    canopyClusters.push(cluster);
  });

  // Small subtle green foliage hints peeking between blossoms
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x3d6e35,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true
  });
  const leafSprout = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85 * scale, 0), leafMat);
  leafSprout.position.set(-0.2 * scale, 4.3 * scale, 0.4 * scale);
  treeGroup.add(leafSprout);

  // 3. GROUND DETAIL: Radial carpet of fallen purple petals on sidewalk
  // Famous Harare street feature: in spring, pavements turn purple from fallen blossoms!
  const carpetR = 2.8 * scale;
  const petalCarpetGeo = new THREE.CircleGeometry(carpetR, 14);
  const petalCarpetMat = new THREE.MeshBasicMaterial({
    color: 0x9333ea,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  const petalCarpet = new THREE.Mesh(petalCarpetGeo, petalCarpetMat);
  petalCarpet.rotation.x = -Math.PI / 2;
  petalCarpet.position.y = 0.02; // Just above sidewalk surface
  treeGroup.add(petalCarpet);

  return {
    group: treeGroup,
    trunk: lowerTrunk,
    canopyClusters,
    swaySpeed: 1.4 + (randomSeed % 5) * 0.2,
    swayAmplitude: 0.04 + (randomSeed % 4) * 0.015,
    swayOffset: (randomSeed * 0.8) % (Math.PI * 2)
  };
}

/**
 * Procedurally scatters low-poly Jacaranda trees along the streets, avenues,
 * sidewalks, medians, and civic plazas of Harare CBD.
 */
export function scatterJacarandaAvenues(
  scene: THREE.Scene,
  collisionBoxes: THREE.Box3[],
  animatables: { update: (time: number, dt: number) => void }[],
  options: JacarandaScatterOptions = {}
): JacarandaTreeInstance[] {
  const density = options.density || 'lush';
  const treeInstances: JacarandaTreeInstance[] = [];

  // Helper: check if a proposed tree location collides with any building box
  function isClearOfBuildings(x: number, z: number, clearance: number = 2.4): boolean {
    for (let i = 0; i < collisionBoxes.length; i++) {
      const b = collisionBoxes[i];
      // Only test against solid structures that extend above ground
      if (b.max.y > 2.0) {
        if (
          x + clearance > b.min.x &&
          x - clearance < b.max.x &&
          z + clearance > b.min.z &&
          z - clearance < b.max.z
        ) {
          return false;
        }
      }
    }
    return true;
  }

  // Pre-determined urban tree lines along Harare CBD's major corridors
  interface TreeSlot {
    x: number;
    z: number;
    elev?: number;
    scale?: number;
  }

  const avenueSlots: TreeSlot[] = [];

  // 1. Samora Machel East-West Boulevard (North & South Sidewalks)
  // Sidewalk bands: Z around +12 to +13 (South sidewalk) and -12 to -13 (North sidewalk)
  const stepX = density === 'dense' ? 14 : density === 'lush' ? 18 : 26;

  for (let x = -88; x <= 88; x += stepX) {
    // Avoid intersection center box
    if (Math.abs(x) < 14) continue;

    // South sidewalk row
    avenueSlots.push({ x: x + (Math.sin(x) * 1.2), z: 12.8, elev: 0.22 });
    // North sidewalk row
    avenueSlots.push({ x: x + (Math.cos(x) * 1.2), z: -12.8, elev: 0.22 });
  }

  // 2. Julius Nyerere North-South Boulevard (East & West Sidewalks)
  // Sidewalk bands: X around +12 to +13 (East sidewalk) and -12 to -13 (West sidewalk)
  const stepZ = density === 'dense' ? 14 : density === 'lush' ? 18 : 26;

  for (let z = -88; z <= 88; z += stepZ) {
    if (Math.abs(z) < 14) continue;

    // East sidewalk row
    avenueSlots.push({ x: 12.8, z: z + (Math.sin(z) * 1.2), elev: 0.22 });
    // West sidewalk row
    avenueSlots.push({ x: -12.8, z: z + (Math.cos(z) * 1.2), elev: 0.22 });
  }

  // 3. Central Freedom Plaza Perimeter (Framing the roundabout and civic center)
  const plazaAngles = [0.35, 1.15, 1.95, 2.75, 3.55, 4.35, 5.15, 5.95];
  plazaAngles.forEach((ang) => {
    const pr = 17.5;
    avenueSlots.push({
      x: Math.cos(ang) * pr,
      z: Math.sin(ang) * pr,
      elev: 0.22,
      scale: 1.1
    });
  });

  // 4. Secondary Cross-Street Pedestrian Lanes
  // Behind Landmark buildings in open plaza pockets
  const pocketSlots: TreeSlot[] = [
    // Heritage Civic Hall Garden Walk (SW quadrant)
    { x: -32, z: 28, elev: 0.22, scale: 1.15 },
    { x: -52, z: 28, elev: 0.22, scale: 1.05 },
    { x: -32, z: 58, elev: 0.22, scale: 1.0 },
    { x: -52, z: 58, elev: 0.22, scale: 1.1 },

    // Joina Modern Plaza Forecourt (NE quadrant)
    { x: 34, z: -32, elev: 0.22, scale: 1.05 },
    { x: 62, z: -32, elev: 0.22, scale: 1.15 },
    { x: 34, z: -62, elev: 0.22, scale: 0.95 },

    // Charter House Promenade (SE quadrant)
    { x: 30, z: 34, elev: 0.22, scale: 1.05 },
    { x: 56, z: 34, elev: 0.22, scale: 1.1 },
    { x: 30, z: 62, elev: 0.22, scale: 1.0 },

    // Commercial Arcade Lane (NW quadrant)
    { x: -34, z: -32, elev: 0.22, scale: 1.0 },
    { x: -62, z: -32, elev: 0.22, scale: 1.1 },
    { x: -34, z: -62, elev: 0.22, scale: 1.05 }
  ];

  avenueSlots.push(...pocketSlots);

  // Instantiate and plant trees
  avenueSlots.forEach((slot, idx) => {
    // Check clearance so trees do not intersect solid building walls
    if (isClearOfBuildings(slot.x, slot.z, 2.2)) {
      const scaleVariation = (slot.scale || 1.0) * (0.88 + ((idx * 17) % 30) * 0.01);
      const elev = slot.elev !== undefined ? slot.elev : 0.22;

      const treeInstance = createJacarandaTree(
        slot.x,
        slot.z,
        elev,
        scaleVariation,
        idx + 1
      );

      scene.add(treeInstance.group);
      treeInstances.push(treeInstance);

      // Add slim collision cylinder/box for the tree trunk so player collides naturally
      const trunkR = 0.45 * scaleVariation;
      collisionBoxes.push(
        new THREE.Box3(
          new THREE.Vector3(slot.x - trunkR, elev, slot.z - trunkR),
          new THREE.Vector3(slot.x + trunkR, elev + 4.5 * scaleVariation, slot.z + trunkR)
        )
      );
    }
  });

  // Animate gentle canopy sway in the Highveld breeze
  if (options.swayAnimation !== false) {
    animatables.push({
      update: (time: number) => {
        for (let i = 0; i < treeInstances.length; i++) {
          const tInst = treeInstances[i];
          const sway = Math.sin(time * tInst.swaySpeed + tInst.swayOffset) * tInst.swayAmplitude;
          // Sway canopy clusters slightly
          for (let c = 0; c < tInst.canopyClusters.length; c++) {
            tInst.canopyClusters[c].rotation.z = sway * 0.6;
            tInst.canopyClusters[c].rotation.x = sway * 0.4;
          }
        }
      }
    });
  }

  return treeInstances;
}
