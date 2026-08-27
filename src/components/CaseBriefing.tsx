import React from 'react';
import { ShieldAlert, Database, Calendar, MapPin, Clock, Skull, UserX, CheckCircle, ArrowRight, UserCheck, Crown, LogOut } from 'lucide-react';
import { CASE_META } from '../data/caseData';
import { OfficerProfile } from '../types';
import { playSound } from '../utils/sound';

interface CaseBriefingProps {
  currentOfficer?: OfficerProfile;
  roomId?: string;
  onEnterDatabase: () => void;
  onLeaveCase?: () => void;
  soundEnabled: boolean;
}

export const CaseBriefing: React.FC<CaseBriefingProps> = ({ 
  currentOfficer,
  roomId = 'ROY-LOCAL',
  onEnterDatabase, 
  onLeaveCase,
  soundEnabled 
}) => {
  const handleEnter = () => {
    playSound('open_folder', soundEnabled);
    onEnterDatabase();
  };

  return (
    <div className="min-h-screen bg-[#07090c] text-neutral-200 flex flex-col items-center justify-center p-4 sm:p-8 classified-grid">
      <div className="w-full max-w-4xl bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Top folder decoration */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono tracking-widest text-red-400 uppercase font-semibold">
                CONFIDENTIAL DOSSIER // ROOM: {roomId}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-100">
                CASE BRIEFING & REOPENING MANDATE
              </h2>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="stamp-red text-xs">REOPENED</span>
          </div>
        </div>

        {/* Officer Assignment Banner */}
        {currentOfficer && (
          <div className="mb-6 p-4 rounded-xl bg-neutral-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center border ${currentOfficer.avatarColor}`}>
                {currentOfficer.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 text-neutral-100 font-bold font-serif text-sm">
                  <span>{currentOfficer.name}</span>
                  {currentOfficer.isTeamLead && (
                    <Crown className="w-3.5 h-3.5 text-amber-400" title="Team Lead" />
                  )}
                </div>
                <div className="text-neutral-400 text-[11px]">
                  {currentOfficer.rank} • {currentOfficer.department}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 font-bold">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>ACTIVE SIT INVESTIGATOR</span>
            </div>
          </div>
        )}

        {/* Case Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 mb-8 font-mono text-xs">
          <div className="space-y-1">
            <span className="text-neutral-500 flex items-center gap-1"><Database className="w-3 h-3 text-blue-400" /> CASE</span>
            <p className="font-semibold text-neutral-200 truncate">{CASE_META.caseName}</p>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-400" /> LOCATION</span>
            <p className="font-semibold text-neutral-200">Kolkata</p>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 flex items-center gap-1"><Calendar className="w-3 h-3 text-neutral-400" /> DATE</span>
            <p className="font-semibold text-neutral-200">{CASE_META.incidentDate}</p>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 flex items-center gap-1"><Clock className="w-3 h-3 text-red-400" /> FIRE START</span>
            <p className="font-semibold text-red-400">{CASE_META.estimatedFireStart}</p>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 flex items-center gap-1"><Skull className="w-3 h-3 text-red-400" /> FATALITIES</span>
            <p className="font-semibold text-red-400">{CASE_META.fatalities} Victims</p>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 flex items-center gap-1"><UserX className="w-3 h-3 text-amber-400" /> CONVICT</span>
            <p className="font-semibold text-amber-400 truncate">{CASE_META.originalConvict}</p>
          </div>
        </div>

        {/* Narrative Briefing */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-neutral-300 mb-8">
          <p className="border-l-2 border-red-500/50 pl-4 py-1 text-neutral-200 font-medium">
            On 14 May 2026, a devastating fire destroyed Roy Bari Estate and killed ten people.
          </p>
          <p>
            The investigation led to the conviction of <strong className="text-amber-400 font-semibold">Yash Roy</strong>, who was sentenced to death. The case appeared closed.
          </p>
          <p>
            However, newly recovered evidence and CBI digital forensic findings revealed serious inconsistencies in the original investigation.
          </p>
          <p className="text-neutral-300 font-medium">
            Your Special Investigation Team has been assigned to independently review the case.
          </p>
        </div>

        {/* Objectives Box */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 mb-8">
          <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400" />
            YOUR INVESTIGATION OBJECTIVES:
          </h3>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-mono font-bold">01.</span>
              <span><strong>Review the evidence:</strong> Inspect digital forensics, financial paper trails, and medical findings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-mono font-bold">02.</span>
              <span><strong>Study the people involved:</strong> Cross-examine witness accounts, survivor depositions, and financial ties.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-mono font-bold">03.</span>
              <span><strong>Examine the timeline:</strong> Identify minute-by-minute contradictions and physical impossibilities.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-mono font-bold">04.</span>
              <span><strong>Collaborate & deduce:</strong> Share team notes, discuss contradictions, and submit the final official verdict.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          {onLeaveCase && (
            <button
              id="btn-briefing-leave-case"
              onClick={() => {
                playSound('click', soundEnabled);
                onLeaveCase();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-red-300 hover:text-red-200 bg-red-950/30 hover:bg-red-950/70 border border-red-500/30 hover:border-red-500/60 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>LEAVE CASE / SWITCH OFFICER</span>
            </button>
          )}

          <button
            id="btn-enter-case-database"
            onClick={handleEnter}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Database className="w-4 h-4 text-neutral-950" />
            <span>ENTER CASE DATABASE</span>
            <ArrowRight className="w-4 h-4 text-neutral-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
