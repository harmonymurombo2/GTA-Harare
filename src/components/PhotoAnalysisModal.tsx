import React from 'react';
import { X, Building2, Palette, Navigation, Landmark, TreePine, Car } from 'lucide-react';

interface PhotoAnalysisModalProps {
  onClose: () => void;
}

export const PhotoAnalysisModal: React.FC<PhotoAnalysisModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm pointer-events-auto select-none font-sans">
      <div className="bg-[#12161f] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-3xl w-full text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 sticky top-0 bg-[#12161f] pt-1 z-10">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold">Harare CBD Photo Analysis</div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Neighborhood Architectural Breakdown</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Synthesis Sections */}
        <div className="space-y-6 text-sm text-zinc-300">
          {/* Section 1: Architectural Style */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base mb-2">
              <Building2 className="w-5 h-5" />
              <span>1. Architectural Style & Typologies</span>
            </div>
            <p className="leading-relaxed text-xs sm:text-sm text-zinc-300 mb-3">
              The uploaded photos illustrate Harare's distinctive juxtaposition of mid-to-late 20th-century International Style and Brutalist high-rises with British and Dutch colonial civic heritage. Key architectural patterns modeled in the 3D scene include:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
              <li><strong className="text-zinc-100">Horizontal Ribbon Windows:</strong> Continuous dark-tinted glazed bands separated by precast concrete spandrels and deep solar brise-soleil (sun-shades) designed to diffuse intense equatorial Highveld sunlight.</li>
              <li><strong className="text-zinc-100">Curtain-Wall Glazing:</strong> High-reflectance cyan and emerald glass facades seen on premier banking and insurance headquarters.</li>
              <li><strong className="text-zinc-100">Colonial Civic Pavilions:</strong> 2-story civic structures with arched colonnades, white masonry, and pitched terracotta clay tile hip roofs.</li>
              <li><strong className="text-zinc-100">Street Verandahs & Arcades:</strong> Ground-floor pedestrian arcades with blue-and-white striped shade awnings extending over sidewalks.</li>
            </ul>
          </div>

          {/* Section 2: Color Palette */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base mb-3">
              <Palette className="w-5 h-5" />
              <span>2. Environmental & Material Color Palette</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
              <div className="p-2.5 rounded-xl bg-zinc-800/70 border border-white/5">
                <div className="w-full h-8 rounded-lg bg-[#2563eb] mb-1.5 shadow-inner" />
                <div className="font-semibold text-zinc-200">Highveld Sky</div>
                <div className="text-[11px] text-zinc-400 font-mono">Crisp 1500m Azure</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-800/70 border border-white/5">
                <div className="w-full h-8 rounded-lg bg-[#c88748] mb-1.5 shadow-inner" />
                <div className="font-semibold text-zinc-200">Ochre Plaster</div>
                <div className="text-[11px] text-zinc-400 font-mono">Warm Sandstone</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-800/70 border border-white/5">
                <div className="w-full h-8 rounded-lg bg-[#0f2938] mb-1.5 shadow-inner" />
                <div className="font-semibold text-zinc-200">Curtain Glass</div>
                <div className="text-[11px] text-zinc-400 font-mono">Reflective Teal/Navy</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-800/70 border border-white/5">
                <div className="w-full h-8 rounded-lg bg-[#9d54db] mb-1.5 shadow-inner" />
                <div className="font-semibold text-zinc-200">Jacaranda Blooms</div>
                <div className="text-[11px] text-zinc-400 font-mono">Vibrant Lilac / Violet</div>
              </div>
            </div>
          </div>

          {/* Section 3: Distinctive Landmarks */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base mb-2">
              <Landmark className="w-5 h-5" />
              <span>3. Distinctive Landmark Recreations</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-800/50">
                <div className="font-bold text-amber-300">Joina City Saucer Tower (Photo OIP.webp)</div>
                <div className="text-zinc-300">24-story glass skyscraper capped by an iconic circular observation saucer / crown supported by diagonal pillars and crowned with a spire.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-800/50">
                <div className="font-bold text-amber-300">Charter House with Golden Globe Statue (Photos istockphoto & cbd.webp)</div>
                <div className="text-zinc-300">Classic ochre high-rise topped with a golden human figure holding a celestial globe aloft towards the Zimbabwean sky.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-800/50">
                <div className="font-bold text-amber-300">Curved Glass Skyscraper (Photos HWPBK3 & RF4M95)</div>
                <div className="text-zinc-300">Modernist tiered office tower inspired by the Reserve Bank of Zimbabwe, featuring setback terraces and arched glass crown.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-800/50">
                <div className="font-bold text-amber-300">Heritage Civic Hall & Clock Tower (Photo RC9X3C)</div>
                <div className="text-zinc-300">Terracotta-tiled gabled civic courthouse with arched front colonnades and a central 4-dial clock tower with verdigris copper spire.</div>
              </div>
            </div>
          </div>

          {/* Section 4: Street Layout & Details */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base mb-2">
              <Navigation className="w-5 h-5" />
              <span>4. Street Layout & Urban Street Furniture</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
              <li><strong className="text-zinc-100">Boulevard Grid:</strong> Wide multi-lane asphalt roads (Samora Machel Ave & Julius Nyerere Way) with white dashed lanes and pedestrian zebra crossings.</li>
              <li><strong className="text-zinc-100">Black & White Hazard Curbs:</strong> Sidewalk curbstones painted in high-contrast alternating black and white segments, ubiquitous across Harare CBD intersections.</li>
              <li><strong className="text-zinc-100">Kombi Commuter Minibuses:</strong> Iconic white commuter vans with blue and orange racing stripes parked along designated curbside ranks.</li>
              <li><strong className="text-zinc-100">Procedural Jacaranda Tree Models:</strong> Harare's world-famous purple-flowering Jacaranda trees (<em>Jacaranda mimosifolia</em>), procedurally built with thin organic curved trunks, multi-tier low-poly faceted blossom canopies in shades of lilac and violet, radial fallen petal carpets along pavements, and gentle breeze sway animation.</li>
            </ul>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
