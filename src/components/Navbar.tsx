import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  FolderArchive, 
  Clock, 
  Map, 
  BookOpen, 
  Gavel, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  Radio,
  Copy,
  Check,
  Crown
} from 'lucide-react';
import { DashboardTab, OfficerProfile, OfficerId, OfficerSessionState } from '../types';
import { TeamActivityBar } from './TeamActivityBar';
import { playSound } from '../utils/sound';

interface NavbarProps {
  roomId?: string;
  currentOfficer?: OfficerProfile;
  activeOfficerSessions?: Record<OfficerId, OfficerSessionState>;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  progressPercent: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLeaveCase: () => void;
  onOpenFeed?: () => void;
  unresolvedInconsistenciesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomId = 'ROY-LOCAL',
  currentOfficer,
  activeOfficerSessions = {} as Record<OfficerId, OfficerSessionState>,
  activeTab,
  onSelectTab,
  progressPercent,
  soundEnabled,
  onToggleSound,
  onLeaveCase,
  onOpenFeed,
  unresolvedInconsistenciesCount = 0,
}) => {
  const [hasCopiedRoom, setHasCopiedRoom] = useState(false);

  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'CASE OVERVIEW', icon: <FileText className="w-4 h-4" /> },
    { id: 'people', label: 'PEOPLE', icon: <Users className="w-4 h-4" /> },
    { id: 'evidence', label: 'EVIDENCE', icon: <FolderArchive className="w-4 h-4" /> },
    { id: 'timeline', label: 'TIMELINE', icon: <Clock className="w-4 h-4" />, badge: unresolvedInconsistenciesCount > 0 ? 'ALERT' : undefined },
    { id: 'roybari', label: 'ROY BARI', icon: <Map className="w-4 h-4" /> },
    { id: 'notes', label: 'DETECTIVE NOTES', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'verdict', label: 'FINAL VERDICT', icon: <Gavel className="w-4 h-4" /> },
  ];

  const handleTabClick = (tabId: DashboardTab) => {
    playSound('click', soundEnabled);
    onSelectTab(tabId);
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setHasCopiedRoom(true);
    playSound('click', soundEnabled);
    setTimeout(() => setHasCopiedRoom(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0f14]/95 border-b border-neutral-800 backdrop-blur-md">
      {/* Top Meta Bar - Balanced Across Full Screen */}
      <div className="w-full px-3 sm:px-6 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-neutral-800/60">
        {/* Left Side: Case Classification & Branding */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="font-mono text-xs font-bold text-red-400 tracking-wider">CBI #005</span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs sm:text-sm font-serif font-bold text-neutral-100 tracking-wide uppercase truncate">
              THE FIRE AT ROY BARI
            </span>
          </div>

          {/* Room ID Badge with click-to-copy */}
          <button
            id="btn-nav-room-id"
            onClick={handleCopyRoomId}
            title="Click to copy Investigation Room ID"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 hover:border-amber-500/40 transition cursor-pointer shrink-0 shadow-sm"
          >
            <span className="text-neutral-400 font-medium">ROOM:</span>
            <span className="font-bold">{roomId}</span>
            {hasCopiedRoom ? (
              <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
            ) : (
              <Copy className="w-3 h-3 text-neutral-500 hover:text-amber-400 ml-0.5" />
            )}
          </button>

          {/* Active Officer Identity Badge */}
          {currentOfficer && (
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-200 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${currentOfficer.avatarBorder}`} />
              <span className="font-bold">{currentOfficer.name}</span>
              {currentOfficer.isTeamLead && (
                <Crown className="w-3 h-3 text-amber-400 ml-0.5" title="Team Lead" />
              )}
            </div>
          )}
        </div>

        {/* Right Side: Multiplayer Activity, Live Feed, Progress & Official Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Active Officer Badge for tablet/mobile */}
          {currentOfficer && (
            <div className="flex xl:hidden items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-200">
              <div className={`w-4 h-4 rounded-full font-mono text-[9px] font-bold flex items-center justify-center border ${currentOfficer.avatarColor}`}>
                {currentOfficer.avatarInitials}
              </div>
              <span className="font-bold truncate max-w-[100px] sm:max-w-none">{currentOfficer.name}</span>
            </div>
          )}

          {/* Team Activity Status Indicator & Dropdown */}
          {currentOfficer && (
            <TeamActivityBar
              currentOfficer={currentOfficer}
              activeOfficerSessions={activeOfficerSessions}
              soundEnabled={soundEnabled}
              onOpenFeed={onOpenFeed}
            />
          )}

          {/* Live Activity Feed Button */}
          {onOpenFeed && (
            <button
              id="btn-open-live-feed"
              onClick={() => {
                playSound('click', soundEnabled);
                onOpenFeed();
              }}
              title="Open Live Investigation Feed"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 hover:border-amber-500/40 text-xs font-mono transition cursor-pointer shadow-sm"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">LIVE FEED</span>
            </button>
          )}

          {/* Shared Progress bar widget */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-900/90 px-3 py-1 rounded-xl border border-neutral-800">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                <span className="text-neutral-400">PROGRESS:</span>
                <span className="font-bold text-amber-400">{progressPercent}%</span>
              </div>
              <div className="w-20 sm:w-28 h-1 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Audio toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-neutral-300" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* Official Leave Case Button */}
          <button
            id="btn-leave-case"
            onClick={() => {
              playSound('click', soundEnabled);
              onLeaveCase();
            }}
            title="Officially leave case investigation and return to terminal or switch rooms"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-950/80 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/60 text-xs font-mono font-bold tracking-wider transition cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="whitespace-nowrap">LEAVE CASE</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="w-full px-2 sm:px-6 flex items-center overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isVerdict = tab.id === 'verdict';

          return (
            <button
              key={tab.id}
              id={`tab-nav-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 sm:px-5 py-3 text-xs sm:text-sm font-mono tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? isVerdict
                    ? 'text-amber-300 font-bold border-b-2 border-amber-400 bg-amber-950/20'
                    : 'text-neutral-100 font-bold border-b-2 border-neutral-200 bg-neutral-800/40'
                  : isVerdict
                  ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/20'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-neutral-950 animate-bounce">
                  <Sparkles className="w-2.5 h-2.5" />
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

