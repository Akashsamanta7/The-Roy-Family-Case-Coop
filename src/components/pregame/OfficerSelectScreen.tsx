import React, { useState } from 'react';
import { 
  Shield, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  UserCheck, 
  ArrowLeft,
  Crown
} from 'lucide-react';
import { OfficerId } from '../../types';
import { OFFICER_LIST, OFFICERS } from '../../data/officers';
import { apiClient, JoinRoomResponse } from '../../services/api';
import { playSound } from '../../utils/sound';

interface OfficerSelectScreenProps {
  roomId: string;
  onJoined: (response: JoinRoomResponse, officerId: OfficerId) => void;
  onBackToRoomSelect: () => void;
  soundEnabled: boolean;
}

export const OfficerSelectScreen: React.FC<OfficerSelectScreenProps> = ({
  roomId,
  onJoined,
  onBackToRoomSelect,
  soundEnabled,
}) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState<OfficerId>('arjun');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedOfficerName, setVerifiedOfficerName] = useState<string | null>(null);

  const selectedOfficer = OFFICERS[selectedOfficerId];

  const handleSelectOfficer = (id: OfficerId) => {
    playSound('click', soundEnabled);
    setSelectedOfficerId(id);
    setErrorMessage(null);
    setVerificationCode('');
  };

  const handleVerifyAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || isVerifying) return;

    setIsVerifying(true);
    setErrorMessage(null);
    playSound('typewriter', soundEnabled);

    try {
      const response = await apiClient.joinRoom(roomId, selectedOfficerId, verificationCode);
      if (response.success && response.room) {
        setVerifiedOfficerName(selectedOfficer.name);
        playSound('success', soundEnabled);
        setTimeout(() => {
          onJoined(response, selectedOfficerId);
        }, 1100);
      } else {
        setErrorMessage(response.message || 'Verification failed. Access denied.');
        playSound('denied', soundEnabled);
      }
    } catch {
      setErrorMessage('Connection error. Please try again.');
      playSound('denied', soundEnabled);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#06080b] text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden classified-grid">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#06080b]/80 to-[#020305] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-2xl bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-fadeIn">
        {/* Top Header */}
        <div className="bg-neutral-950/90 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToRoomSelect}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition cursor-pointer"
              title="Return to Room Selection"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-red-400 uppercase">
                OFFICER IDENTITY VERIFICATION
              </div>
              <div className="text-xs font-mono font-bold text-neutral-200 uppercase">
                ROOM: <span className="text-amber-400">{roomId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>SIT ASSIGNMENT</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {verifiedOfficerName ? (
            <div className="p-8 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  IDENTITY VERIFIED
                </div>
                <h2 className="text-2xl font-serif font-bold text-neutral-100">
                  Welcome, {verifiedOfficerName}
                </h2>
              </div>
              <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-amber-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>CONNECTING TO INVESTIGATION ROOM...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyAndJoin} className="space-y-6">
              {/* Officer Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-neutral-300 font-bold uppercase">
                  SELECT YOUR OFFICER IDENTITY
                </label>
                <p className="text-[11px] font-mono text-neutral-400">
                  Identify yourself before accessing the investigation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {OFFICER_LIST.map((officer) => {
                    const isSelected = selectedOfficerId === officer.id;

                    return (
                      <button
                        type="button"
                        key={officer.id}
                        onClick={() => handleSelectOfficer(officer.id)}
                        className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 border-amber-400/90 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center border ${officer.avatarColor}`}>
                              {officer.avatarInitials}
                            </div>
                            <div>
                              <div className="text-xs font-bold font-serif text-neutral-100 flex items-center gap-1.5">
                                {officer.name}
                                {officer.isTeamLead && (
                                  <Crown className="w-3 h-3 text-amber-400 shrink-0" title="Team Lead" />
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-neutral-400">
                                {officer.rank}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-amber-400/90 pt-2 border-t border-neutral-800/80">
                          {officer.role}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Verification Code Input */}
              <div className="space-y-2 p-5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono text-neutral-300 font-bold uppercase flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>PERSONAL VERIFICATION REQUIRED</span>
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    BADGE: {selectedOfficer.badgeNumber}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-neutral-400">
                  Enter the personal authorization code assigned to {selectedOfficer.name}.
                </p>

                <div className="pt-1">
                  <input
                    type="password"
                    id="input-officer-verification-code"
                    autoFocus
                    placeholder={`Enter authorization code for ${selectedOfficer.name}...`}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 tracking-wider uppercase transition"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <strong className="font-bold uppercase">VERIFICATION FAILED</strong>
                    <p className="text-[11px] text-red-400/90">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-verify-officer"
                disabled={isVerifying || !verificationCode.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                <span>{isVerifying ? 'VERIFYING CREDENTIALS...' : `CONFIRM AS ${selectedOfficer.name.toUpperCase()}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Session Rule Note */}
          <div className="pt-4 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-500 leading-relaxed">
            <span className="text-amber-500 font-bold">SESSION POLICY:</span> One active terminal allowed per officer identity. Logging in from a new tab/device safely takes over your officer identity and disconnects the older session.
          </div>
        </div>
      </div>
    </div>
  );
};
