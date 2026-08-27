import React from 'react';
import { ShieldAlert, LogOut, AlertOctagon } from 'lucide-react';
import { OfficerProfile } from '../../types';

interface SessionReplacedModalProps {
  officer: OfficerProfile;
  onAcknowledge: () => void;
}

export const SessionReplacedModal: React.FC<SessionReplacedModalProps> = ({
  officer,
  onAcknowledge,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border-2 border-red-500/60 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-scaleUp">
        <div className="w-16 h-16 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-400 flex items-center justify-center mx-auto shadow-xl shadow-red-950/80">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded bg-red-950/80 border border-red-500/40 text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">
            SECURITY NOTIFICATION // TERMINAL TAKEOVER
          </span>
          <h2 className="text-2xl font-bold font-serif text-neutral-100">
            SESSION REPLACED
          </h2>
          <p className="text-xs font-mono text-neutral-300 leading-relaxed">
            Your officer identity (<strong className="text-amber-400">{officer.name}</strong>) has been accessed from another browser session or device.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400 leading-relaxed">
          You have been safely disconnected from the active investigation to maintain session security.
        </div>

        <button
          onClick={onAcknowledge}
          className="w-full py-3.5 px-6 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer border border-neutral-700"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>RETURN TO CBI TERMINAL</span>
        </button>
      </div>
    </div>
  );
};
