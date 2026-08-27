import React, { useState } from 'react';
import { 
  FolderPlus, 
  LogIn, 
  Copy, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  Shield, 
  Users, 
  Percent, 
  Clock,
  Sparkles
} from 'lucide-react';
import { apiClient, RoomSummaryResponse } from '../../services/api';
import { playSound } from '../../utils/sound';

interface RoomSelectScreenProps {
  onRoomSelected: (roomId: string) => void;
  soundEnabled: boolean;
}

export const RoomSelectScreen: React.FC<RoomSelectScreenProps> = ({
  onRoomSelected,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'enter'>('create');
  
  // Create Room state
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Enter Room state
  const [inputRoomId, setInputRoomId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedSummary, setSearchedSummary] = useState<RoomSummaryResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    playSound('evidence_stamp', soundEnabled);
    try {
      const res = await apiClient.createRoom();
      if (res.success) {
        setCreatedRoomId(res.roomId);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyRoomId = () => {
    if (!createdRoomId) return;
    navigator.clipboard.writeText(createdRoomId);
    setHasCopied(true);
    playSound('click', soundEnabled);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleContinueFromCreated = () => {
    if (!createdRoomId) return;
    playSound('click', soundEnabled);
    onRoomSelected(createdRoomId);
  };

  const handleSearchRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomId.trim() || isSearching) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchedSummary(null);
    playSound('typewriter', soundEnabled);

    try {
      const summary = await apiClient.getRoomSummary(inputRoomId);
      if (summary.exists) {
        setSearchedSummary(summary);
        playSound('success', soundEnabled);
      } else {
        setSearchError('ROOM NOT FOUND. Check the Room ID and try again.');
        playSound('denied', soundEnabled);
      }
    } catch {
      setSearchError('Error contacting database. Please try again.');
      playSound('denied', soundEnabled);
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinFoundRoom = () => {
    if (!searchedSummary || !searchedSummary.exists) return;
    playSound('click', soundEnabled);
    onRoomSelected(searchedSummary.roomId);
  };

  return (
    <div className="relative min-h-screen bg-[#06080b] text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden classified-grid">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#06080b]/80 to-[#020305] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-fadeIn">
        {/* Terminal Header */}
        <div className="bg-neutral-950/90 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-amber-400 uppercase">
                INVESTIGATION ROOM DISPATCH
              </div>
              <div className="text-xs font-mono font-bold text-neutral-200 uppercase">
                SIT COOPERATIVE SESSION HUB
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded text-[10px] font-mono uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
            CASE #005
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-neutral-800 bg-neutral-950/50">
          <button
            id="tab-create-room"
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('create');
            }}
            className={`py-3.5 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-400 text-amber-300 bg-neutral-900/80'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>CREATE NEW ROOM</span>
          </button>
          <button
            id="tab-enter-room"
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('enter');
            }}
            className={`py-3.5 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'enter'
                ? 'border-amber-400 text-amber-300 bg-neutral-900/80'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>ENTER EXISTING ROOM</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {activeTab === 'create' ? (
            <div className="space-y-6">
              {!createdRoomId ? (
                <div className="space-y-5 text-center sm:text-left">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold font-serif text-neutral-100">
                      Create Investigation Room
                    </h2>
                    <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                      Initialize a collaborative investigation space for your Special Investigation Team (1–4 officers). All team notes, evidence discoveries, and verdict states will be securely saved under this Room ID.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 font-mono text-xs text-neutral-300">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>PERMANENT INVESTIGATION SESSION</span>
                    </div>
                    <p className="text-neutral-400 text-[11px]">
                      The generated Room ID allows officers to rejoin the investigation anytime from any terminal without losing progress.
                    </p>
                  </div>

                  <button
                    id="btn-generate-room"
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>{isCreating ? 'INITIALIZING ROOM IN DATABASE...' : 'GENERATE INVESTIGATION ROOM'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-scaleUp">
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold uppercase">INVESTIGATION ROOM CREATED</span>
                  </div>

                  {/* Room ID Highlight Card */}
                  <div className="p-6 rounded-2xl bg-neutral-950 border border-amber-500/40 text-center space-y-3 shadow-xl">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block font-bold">
                      YOUR ROOM ID
                    </span>
                    <div className="text-2xl sm:text-3xl font-mono font-extrabold tracking-widest text-amber-400 select-all py-1">
                      {createdRoomId}
                    </div>
                    <button
                      id="btn-copy-room-id"
                      onClick={handleCopyRoomId}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-200 transition cursor-pointer"
                    >
                      {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopied ? 'COPIED TO CLIPBOARD' : 'COPY ROOM ID'}</span>
                    </button>
                  </div>

                  {/* Warning Box */}
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300/90 text-xs font-mono space-y-1">
                    <div className="flex items-center gap-2 font-bold uppercase text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>SAVE THIS ROOM ID</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-neutral-300">
                      You and your fellow officers will need this Room ID to return to this investigation session later.
                    </p>
                  </div>

                  <button
                    id="btn-continue-from-room"
                    onClick={handleContinueFromCreated}
                    className="w-full py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                  >
                    <span>CONTINUE TO OFFICER IDENTITY</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold font-serif text-neutral-100">
                  Enter Investigation Room
                </h2>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  Provide your group's unique Room ID to restore saved progress, team notes, and evidence logs.
                </p>
              </div>

              <form onSubmit={handleSearchRoom} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1.5">
                    ENTER INVESTIGATION ROOM ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="input-existing-room-id"
                      autoFocus
                      placeholder="e.g. ROY-7KQ2-M9X4"
                      value={inputRoomId}
                      onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400/80 tracking-wider uppercase transition"
                    />
                    <button
                      type="submit"
                      id="btn-search-room"
                      disabled={isSearching || !inputRoomId.trim()}
                      className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold font-mono text-xs uppercase disabled:opacity-50 transition cursor-pointer"
                    >
                      {isSearching ? 'SEARCHING...' : 'FIND ROOM'}
                    </button>
                  </div>
                </div>

                {searchError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2.5 animate-shake">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <strong className="font-bold uppercase">ROOM NOT FOUND</strong>
                      <p className="text-[11px] text-red-400/90">{searchError}</p>
                    </div>
                  </div>
                )}
              </form>

              {/* Found Room Preview Box */}
              {searchedSummary && searchedSummary.exists && (
                <div className="p-5 rounded-2xl bg-neutral-950 border border-emerald-500/40 space-y-4 animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                      <Check className="w-4 h-4" />
                      <span>ROOM FOUND // SAVED SESSION DETECTED</span>
                    </div>
                    <span className="font-mono text-xs text-amber-400 font-bold">
                      {searchedSummary.roomId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] block uppercase">CASE FILE</span>
                      <span className="font-bold text-neutral-200">{searchedSummary.caseName}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] block uppercase">TEAM PROGRESS</span>
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        {searchedSummary.sharedProgress}% COMPLETED
                      </span>
                    </div>
                  </div>

                  {searchedSummary.previouslyConnectedOfficers.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1.5">
                        OFFICERS PREVIOUSLY CONNECTED:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {searchedSummary.previouslyConnectedOfficers.map((o) => (
                          <span
                            key={o.id}
                            className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300"
                          >
                            {o.name} ({o.rank})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    id="btn-join-found-room"
                    onClick={handleJoinFoundRoom}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                  >
                    <span>JOIN INVESTIGATION ROOM</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
