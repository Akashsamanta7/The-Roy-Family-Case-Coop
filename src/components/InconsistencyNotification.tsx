import React from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { playSound } from '../utils/sound';

interface InconsistencyNotificationProps {
  message: string;
  onDismiss: () => void;
  onClickDetails?: () => void;
  soundEnabled: boolean;
}

export const InconsistencyNotification: React.FC<InconsistencyNotificationProps> = ({
  message,
  onDismiss,
  onClickDetails,
  soundEnabled,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] bg-neutral-900 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl shadow-amber-950/40 backdrop-blur-xl animate-slideUp flex items-start gap-3 text-xs font-mono">
      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 animate-bounce">
        <Sparkles className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-bold text-amber-400 tracking-wider uppercase text-[11px]">
            NEW CASE INCONSISTENCY IDENTIFIED
          </span>
          <button
            onClick={onDismiss}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-neutral-200 leading-relaxed font-sans text-xs mb-2">
          {message}
        </p>

        {onClickDetails && (
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              onClickDetails();
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
          >
            <span>Inspect in Timeline</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
