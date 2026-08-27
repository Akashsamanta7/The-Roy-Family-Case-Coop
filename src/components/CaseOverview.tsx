import React from 'react';
import { 
  Building2, 
  HelpCircle, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  FolderArchive, 
  Clock, 
  FileEdit,
  Gavel
} from 'lucide-react';
import { CASE_META, SUSPECTS, EVIDENCE_ITEMS } from '../data/caseData';
import { CaseDiscovery, DashboardTab } from '../types';
import { playSound } from '../utils/sound';

interface CaseOverviewProps {
  discoveries: CaseDiscovery[];
  onNavigateTab: (tab: DashboardTab) => void;
  viewedEvidenceCount: number;
  viewedPeopleCount: number;
  progressPercent: number;
  soundEnabled: boolean;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({
  discoveries,
  onNavigateTab,
  viewedEvidenceCount,
  viewedPeopleCount,
  progressPercent,
  soundEnabled,
}) => {
  const handleJump = (tab: DashboardTab) => {
    playSound('click', soundEnabled);
    onNavigateTab(tab);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Summary Card */}
      <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Building2 className="w-64 h-64 text-neutral-100" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>SPECIAL INQUIRY DOSSIER // {CASE_META.caseNumber}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-100 mb-2">
              The Fire at Roy Bari Estate
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Ten casualties confirmed on 14 May 2026. Yash Roy was sentenced to death in the original trial. You are re-evaluating the physical and digital evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-overview-proceed-verdict"
              onClick={() => handleJump('verdict')}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wider font-mono uppercase transition shadow-lg shadow-amber-500/10 flex items-center gap-2 cursor-pointer"
            >
              <Gavel className="w-4 h-4" />
              <span>SUBMIT FINAL VERDICT</span>
            </button>
          </div>
        </div>

        {/* Core Metadata Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-neutral-800 font-mono text-xs">
          <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/60">
            <span className="text-neutral-500 uppercase block">CASE STATUS</span>
            <span className="font-bold text-red-400 mt-1 block">REOPENED</span>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/60">
            <span className="text-neutral-500 uppercase block">LOCATION</span>
            <span className="font-bold text-neutral-200 mt-1 block">Roy Bari Estate</span>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/60">
            <span className="text-neutral-500 uppercase block">FATALITIES</span>
            <span className="font-bold text-red-400 mt-1 block">10 Fatalities</span>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/60">
            <span className="text-neutral-500 uppercase block">ORIGINAL CONVICT</span>
            <span className="font-bold text-amber-400 mt-1 block">Yash Roy</span>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/60">
            <span className="text-neutral-500 uppercase block">FIRE ORIGIN</span>
            <span className="font-bold text-cyan-400 mt-1 block">Under investigation</span>
          </div>
        </div>
      </div>

      {/* Two-column layout: Primary Questions vs Important Discoveries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Primary Case Questions & Quick Jump */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <h3 className="font-mono text-sm uppercase tracking-widest font-bold text-neutral-200">
                PRIMARY INVESTIGATION QUESTIONS
              </h3>
            </div>
            
            <ul className="space-y-3">
              {CASE_META.primaryQuestions.map((q, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/60 text-sm font-mono text-neutral-300 hover:border-neutral-700 transition"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-semibold tracking-wide">{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Jump Action Hub */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <button
              onClick={() => handleJump('people')}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/80 border border-neutral-800 text-left transition flex flex-col justify-between h-28 group cursor-pointer"
            >
              <div className="flex items-center justify-between text-neutral-400 group-hover:text-amber-400">
                <Users className="w-5 h-5" />
                <span>{viewedPeopleCount}/{SUSPECTS.length}</span>
              </div>
              <div>
                <span className="font-bold text-neutral-200 block">PEOPLE</span>
                <span className="text-[11px] text-neutral-500">Examine Suspects</span>
              </div>
            </button>

            <button
              onClick={() => handleJump('evidence')}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/80 border border-neutral-800 text-left transition flex flex-col justify-between h-28 group cursor-pointer"
            >
              <div className="flex items-center justify-between text-neutral-400 group-hover:text-cyan-400">
                <FolderArchive className="w-5 h-5" />
                <span>{viewedEvidenceCount}/{EVIDENCE_ITEMS.length}</span>
              </div>
              <div>
                <span className="font-bold text-neutral-200 block">EVIDENCE</span>
                <span className="text-[11px] text-neutral-500">Unseal Files</span>
              </div>
            </button>

            <button
              onClick={() => handleJump('timeline')}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/80 border border-neutral-800 text-left transition flex flex-col justify-between h-28 group cursor-pointer"
            >
              <div className="flex items-center justify-between text-neutral-400 group-hover:text-red-400">
                <Clock className="w-5 h-5" />
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div>
                <span className="font-bold text-neutral-200 block">TIMELINE</span>
                <span className="text-[11px] text-neutral-500">Examine 03:00 - 04:12</span>
              </div>
            </button>

            <button
              onClick={() => handleJump('notes')}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/80 border border-neutral-800 text-left transition flex flex-col justify-between h-28 group cursor-pointer"
            >
              <div className="flex items-center justify-between text-neutral-400 group-hover:text-emerald-400">
                <FileEdit className="w-5 h-5" />
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div>
                <span className="font-bold text-neutral-200 block">NOTES</span>
                <span className="text-[11px] text-neutral-500">Log Hypotheses</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: IMPORTANT DISCOVERIES */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="font-mono text-sm uppercase tracking-widest font-bold text-neutral-200">
                  IMPORTANT DISCOVERIES
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 text-neutral-400">
                {discoveries.length} Logged
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 flex-1">
              {discoveries.map((disc) => (
                <div 
                  key={disc.id}
                  className={`p-3.5 rounded-xl border transition text-xs font-mono ${
                    disc.isContradiction 
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' 
                      : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${disc.isContradiction ? 'text-amber-400' : 'text-cyan-400'}`} />
                      {disc.title}
                    </span>
                    <span className="text-[10px] text-neutral-500">{disc.category}</span>
                  </div>
                  <p className="text-neutral-400 font-sans text-xs leading-relaxed">
                    {disc.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Hint footer */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
              <span>EXPLORATION RATE: {progressPercent}%</span>
              <span>UNCOVER CONTRADICTIONS IN EVIDENCE & TIMELINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
