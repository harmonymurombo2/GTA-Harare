import React, { useState } from 'react';
import { COLLECTIBLES, CollectibleInfo } from '../game/collectiblesData';
import { Volume2, VolumeX, Compass, MapPin, Sparkles, Image, Download, ChevronUp, ChevronDown } from 'lucide-react';

interface HUDProps {
  collectedIds: number[];
  playerPos: { x: number; y: number; z: number };
  playerYaw: number;
  isLocked: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPhotoAnalysis: () => void;
  onDownloadStandalone: () => void;
  recentCollected: CollectibleInfo | null;
}

export const HUD: React.FC<HUDProps> = ({
  collectedIds,
  playerPos,
  playerYaw,
  isLocked,
  isMuted,
  onToggleMute,
  onOpenPhotoAnalysis,
  onDownloadStandalone,
  recentCollected
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Convert player yaw to compass heading (0 = North, 90 = East, 180 = South, 270 = West)
  // Yaw: 0 looks south (+Z), Math.PI looks north (-Z)
  let deg = Math.round(((-playerYaw * 180) / Math.PI) % 360);
  if (deg < 0) deg += 360;

  const cardinal =
    deg >= 337 || deg < 23
      ? 'S'
      : deg >= 23 && deg < 68
      ? 'SW'
      : deg >= 68 && deg < 113
      ? 'W'
      : deg >= 113 && deg < 158
      ? 'NW'
      : deg >= 158 && deg < 203
      ? 'N'
      : deg >= 203 && deg < 248
      ? 'NE'
      : deg >= 248 && deg < 293
      ? 'E'
      : 'SE';

  // Find nearest uncollected artifact distance
  let nearestDist = Infinity;
  let nearestName = '';
  COLLECTIBLES.forEach((c) => {
    if (!collectedIds.includes(c.id)) {
      const dx = c.position[0] - playerPos.x;
      const dz = c.position[2] - playerPos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < nearestDist) {
        nearestDist = Math.round(dist);
        nearestName = c.name;
      }
    }
  });

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans">
      {/* 1. Crosshair in screen center */}
      {isLocked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm" />
          <div className="absolute w-6 h-[1.5px] bg-white/40 -translate-x-1/2 left-1/2" />
          <div className="absolute h-6 w-[1.5px] bg-white/40 -translate-y-1/2 top-1/2" />
        </div>
      )}

      {/* 2. Top-Left: Harare CBD Brand Badge & Compass */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-[#12161f]/85 border border-white/10 rounded-xl px-3.5 py-2.5 text-white flex items-center gap-3 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
            ZW
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-amber-400 uppercase">Harare CBD · 3D Explorer</div>
            <div className="text-[11px] text-zinc-400 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span className="tabular-nums font-mono text-white font-semibold">{deg}° {cardinal}</span>
              </span>
              <span>·</span>
              <span className="text-zinc-300">Elev. {(playerPos.y + 1.7).toFixed(1)}m</span>
            </div>
          </div>
        </div>
        <div className="bg-[#12161f]/85 border border-purple-500/30 rounded-xl px-3 py-1.5 text-white flex items-center gap-2 shadow-md w-fit">
          <div className="w-2 h-2 rounded-full bg-purple-400 shadow-sm" />
          <span className="text-[11px] font-semibold text-purple-200">Harare Jacarandas Blooming</span>
        </div>
      </div>

      {/* 3. Top-Right: Collectibles Counter & Radar */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Counter Badge */}
        <div className="bg-[#12161f]/85 border border-amber-500/30 rounded-xl px-4 py-2.5 shadow-lg text-right flex items-center gap-3">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Artifacts Found</div>
            <div className="text-xl font-extrabold text-amber-400 font-mono tabular-nums leading-tight">
              {collectedIds.length} <span className="text-sm font-normal text-zinc-500">/ 5</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Radar mini tracking */}
        {collectedIds.length < 5 && nearestDist < 120 && (
          <div className="bg-[#12161f]/85 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-zinc-300 flex items-center gap-2 shadow-md">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[140px] text-zinc-400">{nearestName}:</span>
            <span className="text-amber-300 font-mono font-bold">{nearestDist}m away</span>
          </div>
        )}
      </div>

      {/* 4. Center Notification on Collect */}
      {recentCollected && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-500/90 text-zinc-950 font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-sm animate-bounce pointer-events-none">
          <Sparkles className="w-4 h-4 fill-zinc-950" />
          <span>Artifact Found: <span className="underline decoration-zinc-900">{recentCollected.name}</span> ({recentCollected.shonaName})!</span>
        </div>
      )}

      {/* 5. Click-to-Look Prompt (when mouse unlocked) */}
      {!isLocked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0e121a]/90 border border-amber-500/30 rounded-2xl p-6 text-center shadow-2xl pointer-events-auto max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold text-lg mb-1">Click Anywhere to Explore</h3>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Move mouse to look around. Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono text-[11px]">ESC</kbd> anytime to unlock cursor.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-white/5 text-left mb-3">
            <div><span className="text-amber-400 font-mono font-bold">W A S D</span> · Move</div>
            <div><span className="text-amber-400 font-mono font-bold">SHIFT</span> · Run fast</div>
            <div><span className="text-amber-400 font-mono font-bold">SPACE</span> · Jump</div>
            <div><span className="text-amber-400 font-mono font-bold">MOUSE</span> · Look</div>
          </div>
          <div className="text-[11px] text-zinc-400">
            Find all 5 hidden artifacts scattered across Harare CBD!
          </div>
        </div>
      )}

      {/* 6. Ergonomic Collapsible Bottom Control Dock */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-transform duration-300 pointer-events-auto max-w-[94vw] ${
          isDockCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Collapse Pill */}
        <div className="flex justify-center -mb-2">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="bg-[#12161f]/90 hover:bg-[#1a202c] border border-white/10 rounded-t-lg px-3 py-1 text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer shadow-md transition-colors"
          >
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isDockCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
          </button>
        </div>

        {/* Dock Bar */}
        <div className="bg-[#12161f]/90 border border-white/10 rounded-2xl p-2.5 px-4 shadow-2xl flex items-center gap-3 text-zinc-300 text-xs">
          {/* Controls hint */}
          <div className="hidden md:flex items-center gap-2 border-r border-white/10 pr-3 text-[11px] text-zinc-400">
            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[10px]">WASD</span> Move
            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[10px]">SHIFT</span> Run
            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[10px]">SPACE</span> Jump
          </div>

          {/* Action buttons */}
          <button
            onClick={onOpenPhotoAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 hover:text-white text-xs cursor-pointer border border-white/10 transition-colors"
            title="View architectural summary and photo comparison"
          >
            <Image className="w-3.5 h-3.5 text-amber-400" />
            <span>Photo Analysis</span>
          </button>

          <button
            onClick={onDownloadStandalone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-xs cursor-pointer border border-amber-500/30 transition-colors"
            title="Download single self-contained HTML file (runs in any browser with no build step)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Standalone HTML</span>
            <span className="sm:hidden">Export</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white cursor-pointer border border-white/10 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
