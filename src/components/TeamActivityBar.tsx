import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  ChevronDown, 
  Crown, 
  X, 
  Radio, 
  CircleDot, 
  Eye, 
  Activity 
} from 'lucide-react';
import { OfficerProfile, OfficerId, OfficerSessionState } from '../types';
import { OFFICER_LIST, OFFICERS } from '../data/officers';
import { playSound } from '../utils/sound';

interface TeamActivityBarProps {
  currentOfficer: OfficerProfile;
  activeOfficerSessions: Record<OfficerId, OfficerSessionState>;
  soundEnabled: boolean;
  onOpenFeed?: () => void;
}

export const TeamActivityBar: React.FC<TeamActivityBarProps> = ({
  currentOfficer,
  activeOfficerSessions,
  soundEnabled,
  onOpenFeed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const togglePanel = () => {
    playSound('click', soundEnabled);
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getStatusColor = (status: 'active' | 'idle' | 'offline') => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500 ring-4 ring-emerald-500/20';
      case 'idle':
        return 'bg-amber-400 ring-4 ring-amber-400/20';
      case 'offline':
        return 'bg-neutral-600';
    }
  };

  const getStatusLabel = (status: 'active' | 'idle' | 'offline') => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'idle':
        return 'Idle';
      case 'offline':
        return 'Offline';
    }
  };

  const activeCount = Object.values(activeOfficerSessions || {}).filter(
    (o) => (o as OfficerSessionState)?.status === 'active'
  ).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Top compact indicator (Google Docs / Google Sheets Style) */}
      <button
        id="btn-team-activity-toggle"
        onClick={togglePanel}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 transition shadow-sm cursor-pointer"
        title="View Special Investigation Team Activity"
      >
        <div className="flex items-center -space-x-1.5">
          {OFFICER_LIST.map((officer) => {
            const session = activeOfficerSessions[officer.id];
            const status = session?.status || 'offline';
            const isCurrent = officer.id === currentOfficer.id;

            return (
              <div
                key={officer.id}
                className={`relative w-6 h-6 rounded-full font-mono text-[10px] font-bold flex items-center justify-center border ${
                  officer.avatarColor
                } ${isCurrent ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-neutral-900' : ''}`}
                title={`${officer.name} (${getStatusLabel(status)})`}
              >
                <span>{officer.avatarInitials}</span>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-neutral-950 ${getStatusColor(
                    status
                  )}`}
                />
              </div>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono">
          <span className="text-neutral-400">TEAM:</span>
          <span className="text-emerald-400 font-bold">{Math.max(1, activeCount)}/4 ACTIVE</span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
      </button>

      {/* Team Activity Panel Dropdown - positioned safely without clipping */}
      {isOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scaleUp">
          {/* Panel Header */}
          <div className="bg-neutral-950/90 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-200 uppercase">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>SIT INVESTIGATOR ROSTER</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Officers List */}
          <div className="p-3 space-y-2 max-h-[60vh] sm:max-h-80 overflow-y-auto">
            {OFFICER_LIST.map((officer) => {
              const session = activeOfficerSessions[officer.id];
              const status = session?.status || 'offline';
              const isCurrent = officer.id === currentOfficer.id;
              const activityText = session?.currentActivity || 'Offline';

              return (
                <div
                  key={officer.id}
                  className={`p-3 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-neutral-950 border-amber-500/40 shadow-sm'
                      : 'bg-neutral-950/50 border-neutral-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center border ${officer.avatarColor}`}>
                        {officer.avatarInitials}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-serif text-neutral-100 flex items-center gap-1.5">
                          <span>{officer.name}</span>
                          {officer.isTeamLead && (
                            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Team Lead" />
                          )}
                          {isCurrent && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          {officer.rank} • {officer.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status)}`} />
                      <span className={status === 'active' ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                        {getStatusLabel(status)}
                      </span>
                    </div>
                  </div>

                  {/* Live Activity Line */}
                  <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center gap-2 text-[11px] font-mono">
                    <Eye className="w-3 h-3 text-neutral-500 shrink-0" />
                    <span className="text-neutral-300 truncate">
                      {activityText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action */}
          {onOpenFeed && (
            <div className="p-3 bg-neutral-950/90 border-t border-neutral-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFeed();
                }}
                className="w-full py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer border border-neutral-800"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>OPEN LIVE INVESTIGATION FEED</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
