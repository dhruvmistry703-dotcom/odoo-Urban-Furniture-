import React, { useState } from 'react';
import { Layers, Eye, Move, Maximize2, CheckCircle2, Sliders, Armchair, Hammer } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const FurnitureBlueprintVisualizer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'blueprint' | 'render' | 'assembly'>('blueprint');
  const [selectedWood, setSelectedWood] = useState('Burmese Teak Wood');
  const [assemblyStep, setAssemblyStep] = useState(2);

  const woodTypes = [
    { name: 'Burmese Teak Wood', color: '#B45309', finish: 'Satin Varnish' },
    { name: 'Scandinavian White Oak', color: '#D97706', finish: 'Matte Natural' },
    { name: 'American Black Walnut', color: '#4B3524', finish: 'Dark Walnut Oil' },
    { name: 'Solid Teak Veneer', color: '#92400E', finish: 'Gloss Lacquer' },
  ];

  return (
    <Card
      title="Furniture Technical Blueprint & Assembly Diagram"
      subtitle="Interactive CAD dimensions, wood material layers, and 3D exploded assembly sequence"
      action={
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-900 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('blueprint')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'blueprint'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            2D Blueprint
          </button>
          <button
            onClick={() => setViewMode('render')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'render'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Material Render
          </button>
          <button
            onClick={() => setViewMode('assembly')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'assembly'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Exploded Assembly
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Blueprint / Render Canvas */}
        <div className="lg:col-span-2 relative min-h-[320px] bg-slate-900 dark:bg-navy-950 rounded-2xl border border-slate-700 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Blueprint Grid Lines Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Top Canvas Controls Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
              <Eye className="w-3.5 h-3.5" /> MODE: {viewMode.toUpperCase()} • SCALE 1:15
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">SPEC: ISO 9001 WOODCRAFT</span>
              <button className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SVG Furniture Technical Drawing Diagram */}
          <div className="relative z-10 my-4 flex items-center justify-center">
            {viewMode === 'blueprint' && (
              <svg viewBox="0 0 500 240" className="w-full max-w-lg h-auto text-blue-400">
                {/* Outer Dimension lines */}
                <line x1="50" y1="20" x2="450" y2="20" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="250" y="15" fill="#60A5FA" fontSize="12" textAnchor="middle" fontFamily="monospace">
                  Width: 1800 mm (180 cm)
                </text>

                <line x1="30" y1="30" x2="30" y2="210" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="25" y="120" fill="#60A5FA" fontSize="12" textAnchor="middle" transform="rotate(-90 25 120)" fontFamily="monospace">
                  Height: 750 mm (75 cm)
                </text>

                {/* Desk/Table Top Diagram */}
                <rect x="60" y="30" width="380" height="25" rx="4" fill="none" stroke="#60A5FA" strokeWidth="2.5" />
                {/* Wood Grain Hatch Lines */}
                <line x1="80" y1="35" x2="420" y2="35" stroke="#3B82F6" strokeWidth="1" opacity="0.6" />
                <line x1="90" y1="45" x2="410" y2="45" stroke="#3B82F6" strokeWidth="1" opacity="0.6" />

                {/* Left Leg Frame */}
                <rect x="80" y="55" width="24" height="150" fill="none" stroke="#60A5FA" strokeWidth="2" />
                {/* Right Pedestal Cabinet */}
                <rect x="340" y="55" width="85" height="150" fill="none" stroke="#60A5FA" strokeWidth="2" />
                {/* Drawer Partition Lines */}
                <line x1="340" y1="105" x2="425" y2="105" stroke="#60A5FA" strokeWidth="1.5" />
                <line x1="340" y1="155" x2="425" y2="155" stroke="#60A5FA" strokeWidth="1.5" />

                {/* Chair Outline Overlay */}
                <path d="M200,100 L260,100 L260,190 L200,190 Z" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="230" y="145" fill="#FBBF24" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  Chair Clearance
                </text>
              </svg>
            )}

            {viewMode === 'render' && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-48 h-32 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 border-4 border-amber-600 shadow-2xl flex items-center justify-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20" />
                  <Armchair className="w-14 h-14 text-amber-200 relative z-10" />
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Finished Timber Render: <span className="text-amber-400 font-bold">{selectedWood}</span>
                </div>
              </div>
            )}

            {viewMode === 'assembly' && (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-4 my-2">
                  <div className={`p-3 rounded-xl border text-xs font-bold ${assemblyStep >= 1 ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-slate-800 text-slate-500'}`}>
                    1. Steel Leg Frame
                  </div>
                  <div className={`p-3 rounded-xl border text-xs font-bold ${assemblyStep >= 2 ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-slate-800 text-slate-500'}`}>
                    2. Teak Wood Tabletop
                  </div>
                  <div className={`p-3 rounded-xl border text-xs font-bold ${assemblyStep >= 3 ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-slate-800 text-slate-500'}`}>
                    3. Drawer Pedestal
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button size="sm" variant="outline" onClick={() => setAssemblyStep(Math.max(1, assemblyStep - 1))}>
                    Previous Step
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => setAssemblyStep(Math.min(3, assemblyStep + 1))}>
                    Next Step ({assemblyStep}/3)
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Specifications Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-slate-300 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span><strong className="text-slate-400">Dimensions:</strong> 180W x 75D x 75H cm</span>
              <span><strong className="text-slate-400">Weight Capacity:</strong> 250 kg</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Grade A Kiln-Dried Timber
            </div>
          </div>
        </div>

        {/* Material & Timber Layer Controls */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" /> Wood Material Selector
            </h4>
            <div className="space-y-2">
              {woodTypes.map(wood => (
                <button
                  key={wood.name}
                  onClick={() => setSelectedWood(wood.name)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                    selectedWood === wood.name
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-xs'
                      : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: wood.color }} />
                    <span>{wood.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{wood.finish}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" /> Hardware Specs
            </h4>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Joinery Type:</span>
              <span className="font-semibold text-slate-900 dark:text-white">Mortise & Tenon</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Drawer Runners:</span>
              <span className="font-semibold text-slate-900 dark:text-white">Soft-Close Telescopic</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Moisture Content:</span>
              <span className="font-semibold text-emerald-600">8% - 12% Kiln Dry</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
