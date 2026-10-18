import * as THREE from 'three';

/**
 * Procedural texture generator for Harare CBD architectural elements.
 * Generates all textures on HTML5 2D canvases with zero external asset files.
 */

// Helper to configure procedural canvas textures according to Three.js skill guidelines
function setupTexture(canvas: HTMLCanvasElement, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Asphalt road texture with realistic aggregate grain
 */
export function createAsphaltTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base dark asphalt
  ctx.fillStyle = '#22252a';
  ctx.fillRect(0, 0, size, size);

  // Road aggregate grain
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle tar patches
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = 'rgba(18, 20, 24, 0.45)';
    ctx.beginPath();
    const px = Math.random() * size;
    const py = Math.random() * size;
    ctx.ellipse(px, py, 25 + Math.random() * 35, 15 + Math.random() * 20, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return setupTexture(canvas, 10, 10);
}

/**
 * Road lane striping texture (dashed white line + solid shoulder lines)
 */
export function createRoadMarkingTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Asphalt base
  ctx.fillStyle = '#24272c';
  ctx.fillRect(0, 0, w, h);

  // Dashed white center line
  ctx.fillStyle = '#f0f3f6';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  
  // 2 dashes vertically
  ctx.fillRect(w / 2 - 8, 40, 16, 160);
  ctx.fillRect(w / 2 - 8, 300, 16, 160);

  // Yellow warning road border lines
  ctx.fillStyle = '#e8b832';
  ctx.fillRect(16, 0, 10, h);
  ctx.fillRect(w - 26, 0, 10, h);

  return setupTexture(canvas, 1, 8);
}

/**
 * Pedestrian zebra crossing texture
 */
export function createZebraTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#22252a';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#f3f4f6';
  const stripeWidth = 36;
  const gap = 28;
  for (let x = 20; x < w - 20; x += stripeWidth + gap) {
    ctx.fillRect(x, 15, stripeWidth, h - 30);
  }

  return setupTexture(canvas, 1, 1);
}

/**
 * Concrete pedestrian sidewalk pavers
 */
export function createSidewalkTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Warm light grey concrete
  ctx.fillStyle = '#c5c2ba';
  ctx.fillRect(0, 0, size, size);

  // Grid pavers
  const tileSize = 64;
  ctx.strokeStyle = '#9e998f';
  ctx.lineWidth = 3;

  for (let x = 0; x <= size; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Subtle paver shading
  for (let x = 0; x < size; x += tileSize) {
    for (let y = 0; y < size; y += tileSize) {
      if ((x + y) % (tileSize * 2) === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      }
    }
  }

  return setupTexture(canvas, 6, 6);
}

/**
 * Distinctive Harare alternating black and white / yellow curb stripes
 */
export function createCurbStripeTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const stripeW = 64;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1a1b1e' : '#f5f5f5';
    ctx.fillRect(i * stripeW, 0, stripeW, h);
  }

  return setupTexture(canvas, 8, 1);
}

/**
 * Modernist ribbon window facade texture (horizontal concrete brise-soleil & tinted glass)
 * Typical of Harare CBD high-rises seen in photos RF4M95 and HWPBK3
 */
export function createRibbonWindowTexture(concreteTone: string = '#d8d5cd'): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = concreteTone;
  ctx.fillRect(0, 0, size, size);

  const floorHeight = 128;
  const windowHeight = 68;

  for (let y = 0; y < size; y += floorHeight) {
    // Window strip
    const winY = y + 36;
    ctx.fillStyle = '#1c2e3d'; // deep tinted reflective glass
    ctx.fillRect(0, winY, size, windowHeight);

    // Glass reflection highlights
    const grad = ctx.createLinearGradient(0, winY, 0, winY + windowHeight);
    grad.addColorStop(0, 'rgba(80, 140, 180, 0.6)');
    grad.addColorStop(0.3, 'rgba(30, 60, 85, 0.7)');
    grad.addColorStop(1, 'rgba(15, 30, 45, 0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, winY, size, windowHeight);

    // Vertical window mullions
    ctx.fillStyle = '#111822';
    for (let x = 0; x < size; x += 42) {
      ctx.fillRect(x, winY, 4, windowHeight);
    }

    // Concrete ledge shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, winY, size, 5);

    // Sunshade bottom highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(0, winY + windowHeight - 2, size, 2);
  }

  return setupTexture(canvas, 3, 6);
}

/**
 * Modern reflective cyan/teal curtain-wall skyscraper glass
 * (As seen on Harare's premier banking and corporate towers in photos RRDJHM, HWPBK3, and cbd.webp)
 */
export function createCurtainGlassTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep cyan/blue glass
  ctx.fillStyle = '#0f2938';
  ctx.fillRect(0, 0, size, size);

  const cellW = 32;
  const cellH = 64;

  for (let x = 0; x < size; x += cellW) {
    for (let y = 0; y < size; y += cellH) {
      // Individual glass panel
      const variation = (Math.sin(x * 0.1) * Math.cos(y * 0.1)) * 0.15;
      const grad = ctx.createLinearGradient(x, y, x, y + cellH);
      
      const r = Math.floor(18 + variation * 20);
      const g = Math.floor(70 + variation * 40);
      const b = Math.floor(95 + variation * 50);

      grad.addColorStop(0, `rgb(${r + 20}, ${g + 30}, ${b + 35})`);
      grad.addColorStop(0.6, `rgb(${r}, ${g}, ${b})`);
      grad.addColorStop(1, `rgb(${r - 10}, ${g - 20}, ${b - 20})`);

      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

      // Aluminum mullion frame
      ctx.strokeStyle = '#324a5e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);

      // Occasional interior warm office glow in some windows
      if (Math.random() > 0.75) {
        ctx.fillStyle = 'rgba(255, 220, 140, 0.22)';
        ctx.fillRect(x + 6, y + 18, cellW - 12, cellH - 24);
      }
    }
  }

  return setupTexture(canvas, 4, 8);
}

/**
 * Warm ochre/terracotta plaster texture
 * (Classic Harare civic & commercial mid-rises seen in istockphoto and RF4M95)
 */
export function createOchrePlasterTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Warm ochre sandstone
  ctx.fillStyle = '#c88748';
  ctx.fillRect(0, 0, size, size);

  // Stucco grain
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.6));
  }
  ctx.putImageData(imgData, 0, 0);

  // Window grid
  const cellW = 64;
  const cellH = 80;
  for (let x = 16; x < size; x += cellW) {
    for (let y = 16; y < size; y += cellH) {
      // Window frame
      ctx.fillStyle = '#f0ebe1';
      ctx.fillRect(x, y, 32, 48);

      // Window glass
      ctx.fillStyle = '#1c2834';
      ctx.fillRect(x + 4, y + 4, 24, 40);

      // Glass shine
      ctx.fillStyle = 'rgba(120, 180, 220, 0.4)';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4);
      ctx.lineTo(x + 20, y + 4);
      ctx.lineTo(x + 4, y + 36);
      ctx.fill();
    }
  }

  return setupTexture(canvas, 3, 5);
}

/**
 * Terracotta clay roof tile texture for heritage colonial buildings
 */
export function createTerracottaRoofTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b34226';
  ctx.fillRect(0, 0, size, size);

  // Horizontal overlapping tile rows
  const rowH = 24;
  for (let y = 0; y < size; y += rowH) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(0, y, size, 4);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, y + 4, size, 2);

    // Vertical curved tile ribs
    for (let x = 0; x < size; x += 18) {
      const grad = ctx.createLinearGradient(x, y, x + 18, y);
      grad.addColorStop(0, 'rgba(0,0,0,0.18)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
      grad.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y + 2, 18, rowH - 2);
    }
  }

  return setupTexture(canvas, 6, 6);
}

/**
 * Blue and white striped street verandah shop canopy
 */
export function createShopAwningTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const stripeW = 24;
  for (let x = 0; x < size; x += stripeW * 2) {
    ctx.fillStyle = '#1d5fa8'; // vibrant Harare shop blue
    ctx.fillRect(x, 0, stripeW, size);

    ctx.fillStyle = '#f8fafc'; // crisp white
    ctx.fillRect(x + stripeW, 0, stripeW, size);
  }

  return setupTexture(canvas, 4, 1);
}

/**
 * Commercial shopfront signage
 */
export function createSignboardTexture(text: string, bgColor: string, textColor: string): THREE.CanvasTexture {
  const w = 512;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // Border trim
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, w - 12, h - 12);

  // Bold typography
  ctx.fillStyle = textColor;
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);

  return setupTexture(canvas, 1, 1);
}
