import React from 'react';
import { LogOut, ShieldAlert, X, ArrowLeft, RotateCcw, Check, Users } from 'lucide-react';
import { OfficerProfile } from '../types';
import { playSound } from '../utils/sound';

interface LeaveCaseModalProps {
  isOpen: boolean;
  roomId: string;
  currentOfficer?: OfficerProfile;
  soundEnabled: boolean;
  onClose: () => void;
  onLeaveToRoomSelect: () => void;
  onLeaveToTerminal: () => void;
}

export const LeaveCaseModal: React.FC<LeaveCaseModalProps> = ({
  isOpen,
  roomId,
  currentOfficer,
  soundEnabled,
  onClose,
  onLeaveToRoomSelect,
  onLeaveToTerminal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                CBI SESSION TERMINATION
              </span>
              <h3 className="text-lg font-bold font-serif text-neutral-100">
                LEAVE CASE INVESTIGATION
              </h3>
            </div>
          </div>
          <button
            id="btn-close-leave-modal"
            onClick={() => {
              playSound('click', soundEnabled);
              onClose();
            }}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Officer & Room Card */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {currentOfficer && (
                <div
                  className={`w-10 h-10 rounded-xl font-bold font-mono text-sm flex items-center justify-center border ${currentOfficer.avatarColor}`}
                >
                  {currentOfficer.avatarInitials}
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                  ACTIVE OFFICER
                </span>
                <span className="text-sm font-bold font-serif text-neutral-100 block">
                  {currentOfficer?.name || 'Investigator'}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  {currentOfficer?.rank} • {currentOfficer?.department}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                ROOM ID
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 inline-block mt-0.5">
                {roomId}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-neutral-300 text-xs font-sans leading-relaxed space-y-2">
            <p className="font-semibold text-amber-300 font-mono text-[11px] uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              SESSION PERSISTENCE NOTICE:
            </p>
            <p>
              Leaving this investigation will disconnect your active officer badge in room <strong className="text-neutral-100 font-mono">{roomId}</strong>.
            </p>
            <p className="text-neutral-400">
              All shared team progress, verified evidence logs, timeline records, and team notes are securely preserved on the server for when you or your team return.
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-5 border-t border-neutral-800 bg-neutral-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="btn-cancel-leave"
            onClick={() => {
              playSound('click', soundEnabled);
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>STAY ON CASE</span>
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
            <button
              id="btn-leave-to-rooms"
              onClick={() => {
                playSound('click', soundEnabled);
                onLeaveToRoomSelect();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>SWITCH ROOM / ROLE</span>
            </button>

            <button
              id="btn-official-exit-terminal"
              onClick={() => {
                playSound('evidence_stamp', soundEnabled);
                onLeaveToTerminal();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>OFFICIAL EXIT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
