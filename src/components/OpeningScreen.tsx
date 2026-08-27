import React from 'react';
import { Shield, Flame, ChevronRight, FileSearch, Lock } from 'lucide-react';
import { playSound } from '../utils/sound';

interface OpeningScreenProps {
  onBegin: () => void;
  soundEnabled: boolean;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onBegin, soundEnabled }) => {
  const handleStart = () => {
    playSound('evidence_stamp', soundEnabled);
    onBegin();
  };

  return (
    <div className="relative min-h-screen bg-[#07090c] text-neutral-100 flex flex-col items-center justify-center p-6 select-none overflow-hidden classified-grid">
      {/* Ambient background glow & vignettes */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#07090c]/80 to-[#030406] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Classified Header Badge */}
      <div className="z-10 flex items-center gap-3 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-950/30 backdrop-blur-md mb-8">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs tracking-[0.25em] font-mono uppercase text-red-400 font-semibold">
          CASE FILE #005 // STATUS: REOPENED
        </span>
      </div>

      {/* Main Cinematic Title Container */}
      <div className="z-10 max-w-4xl text-center flex flex-col items-center space-y-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 border border-neutral-700/60 shadow-2xl shadow-red-950/50 mb-2">
          <Flame className="w-8 h-8 text-amber-500" />
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-neutral-100 font-serif">
          THE FIRE AT <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-amber-500">ROY BARI</span>
        </h1>

        {/* Cinematic Tri-Line Subtitle */}
        <div className="space-y-1.5 text-base sm:text-xl font-mono tracking-widest text-neutral-300">
          <p className="text-red-400/90 font-medium">TEN DEAD.</p>
          <p className="text-neutral-400">ONE MAN CONVICTED.</p>
          <p className="text-amber-400/90 font-semibold">THE EVIDENCE TELLS A DIFFERENT STORY.</p>
        </div>

        {/* Narrative Teaser Box */}
        <div className="max-w-xl p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-md shadow-xl text-sm text-neutral-400 leading-relaxed font-sans mt-4">
          <p className="italic">
            &ldquo;New forensic evidence has reopened a case that was believed to be closed.&rdquo;
          </p>
          <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              CBI SPECIAL INQUIRY ARCHIVE
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              LEVEL 4 CLASSIFIED ACCESS
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-6">
          <button
            id="btn-begin-investigation"
            onClick={handleStart}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold tracking-wider uppercase text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 transition-all duration-200 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <FileSearch className="w-5 h-5 text-neutral-950" />
            <span>BEGIN INVESTIGATION</span>
            <ChevronRight className="w-5 h-5 text-neutral-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="z-10 mt-16 text-center text-xs font-mono text-neutral-600 tracking-wider">
        CENTRAL BUREAU OF INVESTIGATION // DIGITAL FORENSIC DIVISION // KOLKATA
      </div>
    </div>
  );
};
