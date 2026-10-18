/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { setupHighveldEnvironment } from './game/sky';
import { buildHarareCBD, CollectibleMeshObject, CityEnvironment } from './game/cityBuilder';
import { PlayerController } from './game/playerController';
import { sound } from './game/audio';
import { COLLECTIBLES, CollectibleInfo } from './game/collectiblesData';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { VictoryModal } from './components/VictoryModal';
import { PhotoAnalysisModal } from './components/PhotoAnalysisModal';
import { generateStandaloneHTML } from './game/standaloneHtml';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Game state
  const [gameState, setGameState] = useState<'title' | 'playing' | 'victory'>('title');
  const [collectedIds, setCollectedIds] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPhotoAnalysis, setShowPhotoAnalysis] = useState(false);
  const [recentCollected, setRecentCollected] = useState<CollectibleInfo | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Player position and heading for HUD readouts
  const [playerPosState, setPlayerPosState] = useState({ x: 0, y: 0.22, z: 16 });
  const [playerYawState, setPlayerYawState] = useState(Math.PI);

  // Refs for animation loop (prevents re-render tearing)
  const playerControllerRef = useRef<PlayerController | null>(null);
  const cityEnvRef = useRef<CityEnvironment | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gameStateRef = useRef<'title' | 'playing' | 'victory'>('title');
  const startTimeRef = useRef<number>(0);

  // Sync ref with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    cameraRef.current = camera;

    // 2. Modern Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 3. Environment & Lighting
    setupHighveldEnvironment(scene);

    // 4. City Construction & Collectibles
    const cityEnv = buildHarareCBD(scene);
    cityEnvRef.current = cityEnv;

    // 5. Player Controller Setup
    const player = new PlayerController(camera);
    playerControllerRef.current = player;

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // 6. Input Event Handlers
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'title') {
        if (e.code === 'Space' || e.code === 'Enter') {
          startGame();
        }
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          player.input.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          player.input.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          player.input.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          player.input.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          player.input.run = true;
          break;
        case 'Space':
          player.input.jump = true;
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          player.input.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          player.input.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          player.input.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          player.input.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          player.input.run = false;
          break;
        case 'Space':
          player.input.jump = false;
          break;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (gameStateRef.current === 'playing' && player.isLocked) {
        player.onMouseMove(e.movementX, e.movementY);
      }
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === container || document.pointerLockElement === renderer.domElement;
      player.isLocked = locked;
      setIsLocked(locked);
    };

    const onWindowBlur = () => {
      // Clear held keys on window blur per responsive input guidelines
      player.input.forward = false;
      player.input.backward = false;
      player.input.left = false;
      player.input.right = false;
      player.input.run = false;
      player.input.jump = false;
    };

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('resize', onResize);

    // 7. Animation Loop
    const clock = new THREE.Clock();
    let animId: number;
    let lastHudUpdate = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Title Screen: Cinematic live camera orbit around Harare CBD
      if (gameStateRef.current === 'title') {
        const orbitRadius = 90;
        const orbitSpeed = 0.08;
        const camX = Math.cos(time * orbitSpeed) * orbitRadius;
        const camZ = Math.sin(time * orbitSpeed) * orbitRadius;
        camera.position.set(camX, 42, camZ);
        camera.lookAt(0, 16, 0);
      }

      // Playing: Update player physics and collision
      if (gameStateRef.current === 'playing') {
        player.update(dt, cityEnv.collisionBoxes);

        // Throttle HUD state updates to ~12fps for silky 60fps WebGL rendering
        if (time - lastHudUpdate > 0.08) {
          lastHudUpdate = time;
          setPlayerPosState({
            x: Math.round(player.position.x * 10) / 10,
            y: Math.round(player.position.y * 10) / 10,
            z: Math.round(player.position.z * 10) / 10
          });
          setPlayerYawState(player.yaw);

          if (startTimeRef.current > 0) {
            setElapsedTime(Math.round((Date.now() - startTimeRef.current) / 1000));
          }
        }

        // Collectibles Proximity Check
        const playerX = player.position.x;
        const playerZ = player.position.z;
        const pickupRadius = 2.4;

        cityEnv.collectibles.forEach((c) => {
          if (!c.isCollected) {
            const dx = c.group.position.x - playerX;
            const dz = c.group.position.z - playerZ;
            const dist = Math.hypot(dx, dz);

            if (dist < pickupRadius) {
              c.isCollected = true;
              scene.remove(c.group);

              setCollectedIds((prev) => {
                const next = [...prev, c.info.id];
                sound.playCollect(next.length);
                setRecentCollected(c.info);

                setTimeout(() => {
                  setRecentCollected((curr) => (curr?.id === c.info.id ? null : curr));
                }, 3500);

                // Victory Condition: All 5 Collectibles Found!
                if (next.length === 5) {
                  setTimeout(() => {
                    setGameState('victory');
                    gameStateRef.current = 'victory';
                    sound.playVictory();
                    if (document.pointerLockElement) {
                      document.exitPointerLock();
                    }
                  }, 600);
                }

                return next;
              });
            }
          }
        });
      }

      // Update procedural animations (beacon flashes, floating crystals, etc.)
      cityEnv.animatables.forEach((a) => a.update(time, dt));

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('resize', onResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Action: Start Exploration
  const startGame = () => {
    setGameState('playing');
    gameStateRef.current = 'playing';
    startTimeRef.current = Date.now();
    sound.startAmbient();

    // Reset player position and request pointer lock
    if (playerControllerRef.current) {
      playerControllerRef.current.resetPosition(0, 16);
    }

    if (mountRef.current) {
      mountRef.current.requestPointerLock().catch(() => {
        // Fallback if browser requires direct user gesture on click
      });
    }
  };

  // Action: Restart Quest
  const handleRestart = () => {
    setCollectedIds([]);
    setRecentCollected(null);
    setGameState('playing');
    gameStateRef.current = 'playing';
    startTimeRef.current = Date.now();

    // Re-add collectibles to scene
    if (cityEnvRef.current && sceneRef.current) {
      cityEnvRef.current.collectibles.forEach((c) => {
        c.isCollected = false;
        sceneRef.current?.add(c.group);
      });
    }

    if (playerControllerRef.current) {
      playerControllerRef.current.resetPosition(0, 16);
    }

    if (mountRef.current) {
      mountRef.current.requestPointerLock().catch(() => {});
    }
  };

  // Action: Free Roam after victory
  const handleContinueExploring = () => {
    setGameState('playing');
    gameStateRef.current = 'playing';
    if (mountRef.current) {
      mountRef.current.requestPointerLock().catch(() => {});
    }
  };

  // Action: Click on canvas to lock mouse
  const handleCanvasClick = () => {
    if (gameState === 'playing' && !isLocked && mountRef.current) {
      mountRef.current.requestPointerLock().catch(() => {});
      sound.startAmbient();
    }
  };

  // Action: Toggle Sound
  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // Action: Download Standalone Single HTML File
  const handleDownloadStandalone = () => {
    const htmlContent = generateStandaloneHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'harare_cbd_exploration.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0e14] select-none">
      {/* Isolated Three.js Canvas Container */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-crosshair z-0"
      />

      {/* Title Screen Shell */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={startGame}
          onOpenPhotoAnalysis={() => setShowPhotoAnalysis(true)}
        />
      )}

      {/* In-Game HUD (Low-occlusion, world-matched) */}
      {gameState === 'playing' && (
        <HUD
          collectedIds={collectedIds}
          playerPos={playerPosState}
          playerYaw={playerYawState}
          isLocked={isLocked}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenPhotoAnalysis={() => setShowPhotoAnalysis(true)}
          onDownloadStandalone={handleDownloadStandalone}
          recentCollected={recentCollected}
        />
      )}

      {/* Victory Celebration Modal */}
      {gameState === 'victory' && (
        <VictoryModal
          elapsedSeconds={elapsedTime}
          onContinueExploring={handleContinueExploring}
          onRestart={handleRestart}
          onDownloadStandalone={handleDownloadStandalone}
        />
      )}

      {/* Photo & Architectural Analysis Modal */}
      {showPhotoAnalysis && (
        <PhotoAnalysisModal onClose={() => setShowPhotoAnalysis(false)} />
      )}
    </div>
  );
}
