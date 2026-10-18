import React from 'react';
import { COLLECTIBLES } from '../game/collectiblesData';
import { Trophy, RotateCcw, Compass, Sparkles, CheckCircle2, Download } from 'lucide-react';

interface VictoryModalProps {
  elapsedSeconds: number;
  onContinueExploring: () => void;
  onRestart: () => void;
  onDownloadStandalone: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  elapsedSeconds,
  onContinueExploring,
  onRestart,
  onDownloadStandalone
}) => {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = Math.floor(elapsedSeconds % 60);
  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm pointer-events-auto select-none font-sans">
      <div className="bg-[#12161f] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl text-center relative overflow-hidden">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Trophy Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          Victory · All 5 Artifacts Discovered
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Harare Explorer Supreme!
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
          You navigated the avenues, boulevards, and towers of the Sunshine City in <span className="text-amber-400 font-mono font-bold text-base">{formattedTime}</span>, recovering Zimbabwe\'s most sacred cultural symbols.
        </p>

        {/* 5 Artifacts Discovered Grid */}
        <div className="bg-zinc-900/70 border border-white/5 rounded-2xl p-3 sm:p-4 mb-6 text-left space-y-2">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Recovered National Heritage Artifacts</span>
          </div>
          {COLLECTIBLES.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-zinc-100">{c.name}</span>
                <span className="text-[11px] text-zinc-400 font-mono">({c.shonaName})</span>
              </div>
              <span className="text-[11px] text-amber-400/90 truncate max-w-[140px]">{c.landmarkNear}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onContinueExploring}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Free Roam Harare</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border border-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-zinc-400" />
            <span>Replay</span>
          </button>

          <button
            onClick={onDownloadStandalone}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border border-amber-500/20 transition-colors"
            title="Export single HTML file to play offline"
          >
            <Download className="w-4 h-4" />
            <span className="sm:hidden">Export HTML</span>
          </button>
        </div>
      </div>
    </div>
  );
};
