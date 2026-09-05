import React, { useState } from 'react';
import { Hammer, Wrench, Ruler, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';

export const CarpentryToolsDiagram: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<'hammer' | 'saw' | 'joint'>('hammer');

  return (
    <Card
      title="Furniture Workshop Tool & Joinery Diagrams"
      subtitle="Technical SVG diagrams for carpentry tools, timber joinery, and assembly equipment"
      action={
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-900 p-1 rounded-xl">
          <button
            onClick={() => setSelectedTool('hammer')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              selectedTool === 'hammer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            🔨 Claw Hammer Diagram
          </button>
          <button
            onClick={() => setSelectedTool('saw')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              selectedTool === 'saw'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            🪚 Tenon Saw Diagram
          </button>
          <button
            onClick={() => setSelectedTool('joint')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              selectedTool === 'joint'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            🪵 Mortise Joinery Diagram
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SVG Diagram Canvas */}
        <div className="md:col-span-2 bg-slate-900 dark:bg-navy-950 p-6 rounded-2xl border border-slate-700 relative flex flex-col items-center justify-center min-h-[260px] shadow-inner overflow-hidden">
          {/* Blueprint Grid Overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* HAMMER DIAGRAM */}
          {selectedTool === 'hammer' && (
            <div className="relative z-10 w-full flex flex-col items-center">
              <svg viewBox="0 0 400 160" className="w-full max-w-md h-auto text-amber-400">
                {/* Hammer Head - Steel */}
                <rect x="120" y="30" width="80" height="30" rx="4" fill="#3B82F6" opacity="0.3" stroke="#60A5FA" strokeWidth="2" />
                <path d="M120,30 L90,20 L90,50 L120,45 Z" fill="#60A5FA" stroke="#93C5FD" strokeWidth="1.5" />
                <rect x="200" y="35" width="25" height="20" rx="2" fill="#93C5FD" />

                {/* Wood Handle */}
                <rect x="150" y="60" width="20" height="90" rx="3" fill="#D97706" opacity="0.8" stroke="#F59E0B" strokeWidth="2" />
                <line x1="160" y1="65" x2="160" y2="145" stroke="#FDE68A" strokeWidth="1" strokeDasharray="3 3" />

                {/* Dimension Arrows & Text */}
                <line x1="85" y1="15" x2="230" y2="15" stroke="#34D399" strokeWidth="1.5" strokeDasharray="2 2" />
                <text x="155" y="10" fill="#34D399" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  Head Width: 145 mm (High-Carbon Steel)
                </text>

                <line x1="180" y1="60" x2="180" y2="150" stroke="#34D399" strokeWidth="1.5" strokeDasharray="2 2" />
                <text x="245" y="105" fill="#34D399" fontSize="10" textAnchor="start" fontFamily="monospace">
                  Handle: 280 mm (Hickory Wood)
                </text>
              </svg>
              <div className="mt-2 text-xs font-mono text-emerald-400 font-bold">
                🔨 Technical Specification: 16oz Framing Claw Hammer with Vibration Dampening
              </div>
            </div>
          )}

          {/* TENON SAW DIAGRAM */}
          {selectedTool === 'saw' && (
            <div className="relative z-10 w-full flex flex-col items-center">
              <svg viewBox="0 0 400 160" className="w-full max-w-md h-auto text-emerald-400">
                {/* Saw Blade */}
                <polygon points="100,40 340,40 340,100 100,100" fill="#3B82F6" opacity="0.2" stroke="#60A5FA" strokeWidth="2" />
                {/* Teeth */}
                <path d="M100,100 L110,110 L120,100 L130,110 L140,100 L150,110 L160,100 L170,110 L180,100 L190,110 L200,100 L210,110 L220,100 L230,110 L240,100 L250,110 L260,100 L270,110 L280,100 L290,110 L300,100 L310,110 L320,100 L330,110 L340,100" fill="none" stroke="#60A5FA" strokeWidth="2" />

                {/* Brass Back Spine */}
                <rect x="100" y="32" width="240" height="12" fill="#F59E0B" opacity="0.8" stroke="#FBBF24" strokeWidth="1.5" />

                {/* Pistol Handle */}
                <path d="M60,35 C50,50 50,90 70,110 C85,120 100,110 100,90 C100,60 85,35 60,35 Z" fill="#D97706" stroke="#F59E0B" strokeWidth="2" />

                <text x="220" y="25" fill="#34D399" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  Brass Spine Backing (Blade Length: 300 mm)
                </text>
                <text x="220" y="130" fill="#34D399" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  Tooth Pitch: 12 TPI Fine Joinery Cut
                </text>
              </svg>
              <div className="mt-2 text-xs font-mono text-emerald-400 font-bold">
                🪚 Technical Specification: Brass Backed Fine Tenon Hand Saw for Precision Joints
              </div>
            </div>
          )}

          {/* MORTISE JOINERY DIAGRAM */}
          {selectedTool === 'joint' && (
            <div className="relative z-10 w-full flex flex-col items-center">
              <svg viewBox="0 0 400 160" className="w-full max-w-md h-auto">
                {/* Tenon Timber Piece */}
                <rect x="80" y="50" width="100" height="50" fill="#D97706" opacity="0.7" stroke="#F59E0B" strokeWidth="2" />
                <rect x="180" y="60" width="40" height="30" fill="#B45309" stroke="#FBBF24" strokeWidth="2" />

                {/* Mortise Hole Timber Piece */}
                <rect x="250" y="20" width="60" height="110" fill="#D97706" opacity="0.7" stroke="#F59E0B" strokeWidth="2" />
                <rect x="250" y="60" width="40" height="30" fill="#1E293B" stroke="#60A5FA" strokeWidth="2" strokeDasharray="3 3" />

                {/* Connection Arrow */}
                <path d="M225,75 L245,75" stroke="#34D399" strokeWidth="3" markerEnd="url(#arrow)" />

                <text x="130" y="40" fill="#FBBF24" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  Tenon Tongue (40x30 mm)
                </text>
                <text x="280" y="15" fill="#60A5FA" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  Mortise Socket Hole
                </text>
              </svg>
              <div className="mt-2 text-xs font-mono text-emerald-400 font-bold">
                🪵 Technical Specification: Traditional Mortise & Tenon Wood Joint Assembly
              </div>
            </div>
          )}
        </div>

        {/* Tools Specifications Sidebar */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Hammer className="w-4 h-4 text-emerald-600" /> Woodworking Equipment
            </h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <li className="flex justify-between">
                <span>Claw Hammer (16oz):</span>
                <span className="font-semibold text-slate-900 dark:text-white">12 Units</span>
              </li>
              <li className="flex justify-between">
                <span>Wooden Mallets:</span>
                <span className="font-semibold text-slate-900 dark:text-white">8 Units</span>
              </li>
              <li className="flex justify-between">
                <span>Tenon & Dovetail Saws:</span>
                <span className="font-semibold text-slate-900 dark:text-white">15 Units</span>
              </li>
              <li className="flex justify-between">
                <span>Bevel Edge Chisels:</span>
                <span className="font-semibold text-slate-900 dark:text-white">24 Sets</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 font-medium">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Workshop Safety & Quality
            </div>
            <p className="text-[11px] opacity-90">
              All woodworking tools are calibrated to DIN 5111 standards for furniture manufacturing.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
