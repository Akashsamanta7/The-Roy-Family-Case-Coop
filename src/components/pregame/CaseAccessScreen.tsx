import React, { useState } from 'react';
import { Shield, Lock, Terminal, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiClient } from '../../services/api';
import { playSound } from '../../utils/sound';

interface CaseAccessScreenProps {
  onAccessGranted: () => void;
  soundEnabled: boolean;
}

export const CaseAccessScreen: React.FC<CaseAccessScreenProps> = ({
  onAccessGranted,
  soundEnabled,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim() || isVerifying) return;

    setIsVerifying(true);
    setStatus('idle');
    setErrorMessage('');
    playSound('typewriter', soundEnabled);

    try {
      const res = await apiClient.verifyAccessCode(accessCode);
      if (res.success) {
        setStatus('granted');
        playSound('success', soundEnabled);
        setTimeout(() => {
          onAccessGranted();
        }, 900);
      } else {
        setStatus('denied');
        setErrorMessage(res.message);
        playSound('denied', soundEnabled);
      }
    } catch {
      setStatus('denied');
      setErrorMessage('Authorization server unreachable. Try again.');
      playSound('denied', soundEnabled);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#06080b] text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden classified-grid">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#06080b]/80 to-[#020305] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* Terminal Card */}
      <div className="relative z-10 w-full max-w-xl bg-neutral-900/90 border border-neutral-800/90 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-fadeIn">
        {/* Terminal Header */}
        <div className="bg-neutral-950/90 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950/50 border border-red-500/40 text-red-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-red-400 uppercase">
                GOVERNMENT OF INDIA // CBI DIVISION
              </div>
              <div className="text-xs font-mono font-bold text-neutral-200">
                RESTRICTED CASE DATABASE // LEVEL-4 CLEARANCE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono text-red-400 uppercase">SECURE</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2 border-b border-neutral-800/80 pb-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-amber-400 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>CASE FILE #005 // INDEPENDENT INQUIRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-neutral-100">
              THE FIRE AT <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-amber-500">ROY BARI</span>
            </h1>
            <p className="text-xs font-mono text-neutral-400">
              Special Investigation Team (SIT) Cooperative Terminal
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 font-bold uppercase tracking-wider">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>CASE ACCESS REQUIRED</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1.5">
                  ENTER CASE ACCESS CODE
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="input-case-access-code"
                    autoFocus
                    placeholder="Enter security access code..."
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400/80 tracking-widest uppercase transition"
                  />
                </div>
              </div>

              {/* Status Feedbacks */}
              {status === 'denied' && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <strong className="font-bold uppercase">ACCESS DENIED</strong>
                    <p className="text-[11px] text-red-400/90">{errorMessage || 'The case access code is invalid.'}</p>
                  </div>
                </div>
              )}

              {status === 'granted' && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="font-bold uppercase">ACCESS GRANTED</strong>
                    <p className="text-[11px] text-emerald-400/90">Identity approved. Unlocking Investigation Room selector...</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                id="btn-verify-access-code"
                disabled={isVerifying || !accessCode.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span>{isVerifying ? 'VERIFYING SECURITY CODE...' : 'ACCESS CASE DATABASE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
            <span>CBI KOLKATA ARCHIVES</span>
            <span>SECURE PROTOCOL TLS // SIT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
