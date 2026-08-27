import React from 'react';
import { 
  Radio, 
  X, 
  Clock, 
  FolderArchive, 
  Users, 
  BookOpen, 
  Gavel, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ActivityEvent, OfficerId } from '../types';
import { OFFICERS } from '../data/officers';

interface LiveInvestigationFeedProps {
  isOpen: boolean;
  onClose: () => void;
  activityLog: ActivityEvent[];
}

export const LiveInvestigationFeed: React.FC<LiveInvestigationFeedProps> = ({
  isOpen,
  onClose,
  activityLog,
}) => {
  if (!isOpen) return null;

  const getCategoryIcon = (category: ActivityEvent['category']) => {
    switch (category) {
      case 'EVIDENCE':
        return <FolderArchive className="w-3.5 h-3.5 text-amber-400" />;
      case 'PERSON':
        return <Users className="w-3.5 h-3.5 text-blue-400" />;
      case 'TIMELINE':
        return <Clock className="w-3.5 h-3.5 text-cyan-400" />;
      case 'NOTE':
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      case 'VERDICT':
        return <Gavel className="w-3.5 h-3.5 text-red-400" />;
      case 'DISCOVERY':
        return <Sparkles className="w-3.5 h-3.5 text-amber-300" />;
      case 'PRESENCE':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-neutral-900/95 border-l border-neutral-800 shadow-2xl backdrop-blur-xl flex flex-col animate-slideLeft">
      {/* Feed Header */}
      <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-neutral-100 tracking-wider">
              LIVE INVESTIGATION FEED
            </h3>
            <p className="text-[10px] font-mono text-neutral-400">
              REAL-TIME SIT TEAM ACTIVITY LOG
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Feed Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {activityLog.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-xs font-mono">
            No team activity recorded yet.
          </div>
        ) : (
          activityLog.map((event) => {
            const officer = OFFICERS[event.officerId];

            return (
              <div
                key={event.id}
                className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    {getCategoryIcon(event.category)}
                    <span className="font-bold text-neutral-200">
                      {event.officerName}
                    </span>
                  </div>
                  <span className="text-neutral-500">{event.timestamp}</span>
                </div>

                <p className="text-xs font-mono text-neutral-300 leading-relaxed pl-5">
                  {event.actionText}
                </p>

                {event.target && (
                  <div className="pl-5 pt-0.5">
                    <span className="inline-block px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-amber-400 font-bold">
                      {event.target}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Feed Footer */}
      <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 text-center">
        SYNCHRONIZED ACROSS ACTIVE SIT TERMINALS
      </div>
    </div>
  );
};
