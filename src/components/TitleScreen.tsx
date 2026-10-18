import React from 'react';
import { Play, Sparkles, Image, Compass, Info } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenPhotoAnalysis: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenPhotoAnalysis
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-12 pointer-events-auto select-none bg-gradient-to-t from-black/85 via-black/35 to-transparent">
      {/* Top Bar: Location & Tagline */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-base shadow-lg">
            ZW
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">Harare, Zimbabwe</div>
            <div className="text-xs text-zinc-400">The Sunshine City · 1,490m Elevation</div>
          </div>
        </div>

        <button
          onClick={onOpenPhotoAnalysis}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-lg"
        >
          <Image className="w-4 h-4 text-amber-400" />
          <span>Neighborhood Photo Breakdown</span>
        </button>
      </div>

      {/* Center / Lower-Center: Bespoke Inline SVG Title Lockup & Start CTA */}
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
        {/* Bespoke SVG Title Lockup */}
        <div className="mb-4">
          <svg className="w-72 sm:w-96 h-auto drop-shadow-2xl" viewBox="0 0 400 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
            {/* Geometric Crown Emblem */}
            <path d="M200 6 L208 22 L225 22 L211 32 L216 48 L200 38 L184 48 L189 32 L175 22 L192 22 Z" fill="url(#goldGradient)" />
            {/* Title Text */}
            <text x="200" y="70" textAnchor="middle" fill="#ffffff" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="34" letterSpacing="4">
              HARARE CBD
            </text>
            <text x="200" y="86" textAnchor="middle" fill="#93c5fd" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize="11" letterSpacing="6">
              3D FIRST-PERSON EXPLORATION
            </text>
          </svg>
        </div>

        <p className="text-zinc-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-normal drop-shadow">
          Explore the vibrant streets of downtown Harare. Discover iconic modernist towers, blooming violet Jacarandas, and find the 5 hidden cultural artifacts.
        </p>

        {/* Start Game CTA */}
        <button
          onClick={onStartGame}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-base sm:text-lg shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-zinc-950 transition-transform group-hover:translate-x-0.5" />
          <span>START EXPLORATION</span>
          <span className="text-xs font-mono bg-zinc-950/20 px-2 py-0.5 rounded text-zinc-900 ml-1">SPACE / ENTER</span>
        </button>

        {/* Flat control hint line */}
        <div className="mt-8 text-xs text-zinc-400 font-mono flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <span><strong className="text-zinc-200">WASD</strong> Move</span>
          <span>·</span>
          <span><strong className="text-zinc-200">SHIFT</strong> Sprint</span>
          <span>·</span>
          <span><strong className="text-zinc-200">SPACE</strong> Jump</span>
          <span>·</span>
          <span><strong className="text-zinc-200">MOUSE</strong> Look</span>
          <span>·</span>
          <span><strong className="text-zinc-200">ESC</strong> Unlock</span>
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div>Procedural Three.js Environment · Zero External Assets</div>
        <div className="flex items-center gap-1.5 text-amber-400/80">
          <Sparkles className="w-3.5 h-3.5" />
          <span>5 Artifacts to Discover</span>
        </div>
      </div>
    </div>
  );
};
