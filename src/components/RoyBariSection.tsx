import React, { useState } from 'react';
import { 
  Map, 
  MapPin, 
  ShieldAlert, 
  FolderArchive, 
  Lock, 
  Unlock, 
  Flame, 
  Zap, 
  Info,
  ChevronRight
} from 'lucide-react';
import { LOCATION_ZONES, EVIDENCE_ITEMS } from '../data/caseData';
import { LocationZone } from '../types';
import { playSound } from '../utils/sound';

interface RoyBariSectionProps {
  onOpenEvidence: (evidenceCode: string) => void;
  onRecordLocationViewed: (locationId: string) => void;
  viewedLocationIds: string[];
  soundEnabled: boolean;
}

export const RoyBariSection: React.FC<RoyBariSectionProps> = ({
  onOpenEvidence,
  onRecordLocationViewed,
  viewedLocationIds,
  soundEnabled,
}) => {
  const [selectedZone, setSelectedZone] = useState<LocationZone>(LOCATION_ZONES[0]);

  const handleSelectZone = (zone: LocationZone) => {
    playSound('click', soundEnabled);
    setSelectedZone(zone);
    onRecordLocationViewed(zone.id);
  };

  const getDamageBadge = (damage: string) => {
    switch (damage) {
      case 'TOTAL DESTRUCTION':
        return 'bg-red-950/60 text-red-400 border-red-500/40';
      case 'HEAVY SMOKE & CHAR':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/40';
      case 'INSPECTED & INTACT':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-blue-950/60 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-neutral-100 flex items-center gap-2">
            <Map className="w-5 h-5 text-amber-400" />
            ROY BARI ESTATE // SITE BLUEPRINT & CRIME SCENE
          </h2>
          <p className="text-xs font-mono text-neutral-400">
            HERITAGE ESTATE PERIMETER // KOLKATA
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>6 FORENSIC ZONES IDENTIFIED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Architectural Blueprint Map */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4 text-xs font-mono text-neutral-400">
            <span>SCHEMATIC ELEVATION MAP // CFSL CRIME GRID</span>
            <span className="text-amber-400">CLICK PIN TO INSPECT ZONE</span>
          </div>

          {/* Blueprint Graphic Grid Canvas */}
          <div className="relative w-full aspect-4/3 bg-[#0a0d12] border-2 border-dashed border-neutral-800 rounded-xl p-4 overflow-hidden select-none classified-grid">
            {/* Estate Building Walls Representation */}
            <div className="absolute inset-8 border border-neutral-700/60 bg-neutral-900/40 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-950 px-3 py-0.5 border border-neutral-700 text-[10px] font-mono text-neutral-400">
                NORTH ESTATE REAR
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-neutral-950 px-3 py-0.5 border border-neutral-700 text-[10px] font-mono text-neutral-400">
                SOUTH ENTRANCE DRIVEWAY
              </div>

              {/* Interior division lines */}
              <div className="absolute top-1/2 left-0 right-0 border-t border-neutral-800/80" />
              <div className="absolute top-0 bottom-0 left-1/3 border-r border-neutral-800/80" />
              <div className="absolute top-0 bottom-0 right-1/3 border-r border-neutral-800/80" />
            </div>

            {/* Interactive Location Pins */}
            {LOCATION_ZONES.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              const isViewed = viewedLocationIds.includes(zone.id);

              return (
                <button
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  style={{ left: `${zone.coordinates.x}%`, top: `${zone.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-200 group cursor-pointer ${
                    isSelected
                      ? 'scale-125 z-30 bg-amber-400 text-neutral-950 shadow-xl shadow-amber-500/40'
                      : isViewed
                      ? 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-amber-400'
                      : 'bg-neutral-950 text-amber-400 border border-amber-500/50 animate-pulse'
                  }`}
                  title={zone.name}
                >
                  <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline-block truncate max-w-[90px]">{zone.code}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Location Quick List Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {LOCATION_ZONES.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  className={`p-2.5 rounded-lg border text-left font-mono text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-800 border-amber-400 text-amber-300'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{zone.code}</span>
                    <span className="text-[10px] text-neutral-500">{zone.name.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Location Findings Card */}
        <div className="lg:col-span-5 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header */}
            <div className="border-b border-neutral-800 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-neutral-950 border border-neutral-700 text-amber-400">
                  {selectedZone.code}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getDamageBadge(selectedZone.damageLevel)}`}>
                  {selectedZone.damageLevel}
                </span>
              </div>
              <h3 className="text-xl font-bold font-serif text-neutral-100">
                {selectedZone.name}
              </h3>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                {selectedZone.type}
              </p>
            </div>

            {/* Current Status Box */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold mb-1">
                PHYSICAL STATUS:
              </span>
              {selectedZone.status}
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              {selectedZone.description}
            </p>

            {/* Forensic Crime Scene Findings */}
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                FORENSIC FINDINGS AT LOCATION
              </h4>
              <ul className="space-y-2">
                {selectedZone.findings.map((f, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-neutral-300 text-xs font-mono flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Linked Evidence Files */}
            {selectedZone.associatedEvidenceIds.length > 0 && (
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                  <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                  ASSOCIATED EVIDENCE EXHIBITS
                </h4>
                <div className="space-y-1.5">
                  {selectedZone.associatedEvidenceIds.map((code) => {
                    const ev = EVIDENCE_ITEMS.find((e) => e.code === code || e.id === code);
                    return (
                      <button
                        key={code}
                        onClick={() => {
                          playSound('click', soundEnabled);
                          onOpenEvidence(code);
                        }}
                        className="w-full p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left text-xs font-mono text-neutral-200 flex items-center justify-between group transition cursor-pointer"
                      >
                        <span className="truncate">
                          <strong className="text-amber-400 mr-2">{code}</strong>
                          {ev?.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
