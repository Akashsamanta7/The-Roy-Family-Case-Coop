/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  GameScreen, 
  DashboardTab, 
  InvestigationRoomState,
  OfficerProfile,
  OfficerId,
  OfficerSessionState,
  Note, 
  CaseDiscovery, 
  VerdictResult,
  VerdictSubmission,
  ActivityEvent
} from './types';
import { INITIAL_DISCOVERIES } from './data/caseData';
import { OFFICERS } from './data/officers';
import { apiClient, JoinRoomResponse } from './services/api';
import { socketHub } from './services/socket';
import { getSavedRoom, createInitialRoomState } from './services/roomStore';
import { playSound } from './utils/sound';

import { OpeningScreen } from './components/OpeningScreen';
import { CaseAccessScreen } from './components/pregame/CaseAccessScreen';
import { RoomSelectScreen } from './components/pregame/RoomSelectScreen';
import { OfficerSelectScreen } from './components/pregame/OfficerSelectScreen';
import { SessionReplacedModal } from './components/pregame/SessionReplacedModal';
import { CaseBriefing } from './components/CaseBriefing';
import { Navbar } from './components/Navbar';
import { CaseOverview } from './components/CaseOverview';
import { PeopleSection } from './components/PeopleSection';
import { EvidenceSection } from './components/EvidenceSection';
import { TimelineSection } from './components/TimelineSection';
import { RoyBariSection } from './components/RoyBariSection';
import { DetectiveNotes } from './components/DetectiveNotes';
import { FinalVerdict } from './components/FinalVerdict';
import { EndingModal } from './components/EndingModal';
import { InconsistencyNotification } from './components/InconsistencyNotification';
import { LiveInvestigationFeed } from './components/LiveInvestigationFeed';
import { LeaveCaseModal } from './components/LeaveCaseModal';

const SESSION_ROOM_KEY = 'ROY_BARI_CURRENT_ROOM_ID';
const SESSION_OFFICER_KEY = 'ROY_BARI_CURRENT_OFFICER_ID';
const SOUND_KEY = 'ROY_BARI_SOUND_ENABLED';

export default function App() {
  // Navigation & Flow State
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('opening');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Selected Room & Officer
  const [currentRoomId, setCurrentRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(SESSION_ROOM_KEY) || '';
    }
    return '';
  });

  const [currentOfficerId, setCurrentOfficerId] = useState<OfficerId | null>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem(SESSION_OFFICER_KEY) as OfficerId) || null;
    }
    return null;
  });

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SOUND_KEY);
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Room State (shared across collaborative players)
  const [roomState, setRoomState] = useState<InvestigationRoomState>(() => {
    return createInitialRoomState(currentRoomId || 'ROY-LOCAL');
  });

  // Session Replaced Modal State
  const [isSessionReplaced, setIsSessionReplaced] = useState(false);

  // Leave Case Confirmation Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Live Activity Feed Drawer
  const [isFeedOpen, setIsFeedOpen] = useState(false);

  // Cross-component jumping
  const [targetEvidenceCode, setTargetEvidenceCode] = useState<string | null>(null);

  // Floating inconsistency notification
  const [inconsistencyToast, setInconsistencyToast] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: '' });

  // Active ending modal
  const [activeVerdictResult, setActiveVerdictResult] = useState<VerdictResult | null>(null);

  // Active Officer Profile
  const currentOfficer = currentOfficerId ? OFFICERS[currentOfficerId] : undefined;

  // Persist sound
  useEffect(() => {
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
  }, [soundEnabled]);

  // Load existing room state if available on mount
  useEffect(() => {
    if (currentRoomId) {
      const saved = getSavedRoom(currentRoomId);
      if (saved) {
        setRoomState(saved);
        if (saved.officialVerdictResult) {
          setActiveVerdictResult(saved.officialVerdictResult);
        }
      }
    }
  }, [currentRoomId]);

  // Setup Socket.IO & Realtime Event Listeners
  useEffect(() => {
    // 1. Session Replaced (Takeover)
    const unsubReplaced = socketHub.on('session:replaced', () => {
      setIsSessionReplaced(true);
      playSound('denied', soundEnabled);
    });

    // 2. Officer Joined
    const unsubJoined = socketHub.on<{ officerId: OfficerId; activity: OfficerSessionState; event?: ActivityEvent }>(
      'officer:joined',
      ({ officerId, activity, event }) => {
        setRoomState((prev) => {
          const nextOfficers = { ...prev.activeOfficers, [officerId]: activity };
          const nextLog = event ? [event, ...prev.activityLog].slice(0, 80) : prev.activityLog;
          return { ...prev, activeOfficers: nextOfficers, activityLog: nextLog };
        });
        if (officerId !== currentOfficerId) {
          playSound('alert_discovery', soundEnabled);
        }
      }
    );

    // 3. Officer Disconnected
    const unsubDisconnected = socketHub.on<{ officerId: OfficerId; event?: ActivityEvent }>(
      'officer:disconnected',
      ({ officerId, event }) => {
        setRoomState((prev) => {
          if (!prev.activeOfficers[officerId]) return prev;
          const nextOfficers = {
            ...prev.activeOfficers,
            [officerId]: {
              ...prev.activeOfficers[officerId],
              status: 'offline' as const,
              currentActivity: 'Offline',
            },
          };
          const nextLog = event ? [event, ...prev.activityLog].slice(0, 80) : prev.activityLog;
          return { ...prev, activeOfficers: nextOfficers, activityLog: nextLog };
        });
      }
    );

    // 4. Officer Activity
    const unsubActivity = socketHub.on<{ officerId: OfficerId; activity: OfficerSessionState; event?: ActivityEvent }>(
      'officer:activity',
      ({ officerId, activity, event }) => {
        setRoomState((prev) => {
          const nextOfficers = { ...prev.activeOfficers, [officerId]: activity };
          const nextLog = event ? [event, ...prev.activityLog].slice(0, 80) : prev.activityLog;
          return { ...prev, activeOfficers: nextOfficers, activityLog: nextLog };
        });
      }
    );

    // 5. Evidence Reviewed
    const unsubEvidence = socketHub.on<{ evidenceId: string; officerId: OfficerId; roomState: InvestigationRoomState; event?: ActivityEvent }>(
      'evidence:reviewed',
      ({ roomState: incomingRoom, event }) => {
        setRoomState(incomingRoom);
        if (event && event.officerId !== currentOfficerId) {
          playSound('click', soundEnabled);
        }
      }
    );

    // 6. Person Reviewed
    const unsubPerson = socketHub.on<{ personId: string; officerId: OfficerId; roomState: InvestigationRoomState }>(
      'person:reviewed',
      ({ roomState: incomingRoom }) => {
        setRoomState(incomingRoom);
      }
    );

    // 7. Timeline Reviewed
    const unsubTimeline = socketHub.on<{ timelineId: string; officerId: OfficerId; roomState: InvestigationRoomState }>(
      'timeline:reviewed',
      ({ roomState: incomingRoom }) => {
        setRoomState(incomingRoom);
      }
    );

    // 8. Location Reviewed
    const unsubLocation = socketHub.on<{ locationId: string; officerId: OfficerId; roomState: InvestigationRoomState }>(
      'location:reviewed',
      ({ roomState: incomingRoom }) => {
        setRoomState(incomingRoom);
      }
    );

    // 9. Notes Synced (Created, Updated, Deleted)
    const unsubNoteCreated = socketHub.on<{ note: Note; isTeamNote: boolean; roomState: InvestigationRoomState; event?: ActivityEvent }>(
      'note:created',
      ({ roomState: incomingRoom, isTeamNote, event }) => {
        if (isTeamNote) {
          setRoomState(incomingRoom);
          if (event && event.officerId !== currentOfficerId) {
            playSound('typewriter', soundEnabled);
          }
        }
      }
    );

    const unsubNoteUpdated = socketHub.on<{ roomState: InvestigationRoomState; isTeamNote: boolean }>(
      'note:updated',
      ({ roomState: incomingRoom, isTeamNote }) => {
        if (isTeamNote) {
          setRoomState(incomingRoom);
        }
      }
    );

    const unsubNoteDeleted = socketHub.on<{ roomState: InvestigationRoomState; isTeamNote: boolean }>(
      'note:deleted',
      ({ roomState: incomingRoom, isTeamNote }) => {
        if (isTeamNote) {
          setRoomState(incomingRoom);
        }
      }
    );

    // 10. Verdict Events
    const unsubVerdictOpened = socketHub.on<{ officerId: OfficerId; officerName: string; message: string }>(
      'verdict:opened',
      ({ officerId, message }) => {
        if (officerId !== currentOfficerId) {
          setInconsistencyToast({ show: true, message });
          playSound('alert_discovery', soundEnabled);
        }
      }
    );

    const unsubVerdictUpdated = socketHub.on<{ roomState: InvestigationRoomState }>(
      'verdict:updated',
      ({ roomState: incomingRoom }) => {
        setRoomState(incomingRoom);
      }
    );

    const unsubVerdictSubmitted = socketHub.on<{ result: VerdictResult; roomState: InvestigationRoomState }>(
      'verdict:submitted',
      ({ result, roomState: incomingRoom }) => {
        setRoomState(incomingRoom);
        setActiveVerdictResult(result);
        if (result.ending === 'A_COMPLETE_TRUTH') {
          playSound('success', soundEnabled);
        } else {
          playSound('alert_discovery', soundEnabled);
        }
      }
    );

    return () => {
      unsubReplaced();
      unsubJoined();
      unsubDisconnected();
      unsubActivity();
      unsubEvidence();
      unsubPerson();
      unsubTimeline();
      unsubLocation();
      unsubNoteCreated();
      unsubNoteUpdated();
      unsubNoteDeleted();
      unsubVerdictOpened();
      unsubVerdictUpdated();
      unsubVerdictSubmitted();
    };
  }, [currentOfficerId, soundEnabled]);

  // Report Activity when tab or view changes
  const reportOfficerActivity = useCallback(
    (tab: DashboardTab, actionText: string, isMajor: boolean = false, detail?: string) => {
      if (!currentRoomId || !currentOfficerId) return;
      apiClient.updateActivity(currentRoomId, currentOfficerId, {
        tab,
        actionText,
        isMajorAction: isMajor,
        detail,
      });
    },
    [currentRoomId, currentOfficerId]
  );

  // Tab Selection
  const handleSelectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    const tabLabels: Record<DashboardTab, string> = {
      overview: 'Reviewing Case Overview',
      people: 'Examining Suspect Dossiers',
      evidence: 'Inspecting Evidence Archive',
      timeline: 'Analyzing Incident Timeline',
      roybari: 'Investigating Roy Bari Estate',
      notes: 'Consulting Detective Notes',
      verdict: 'Reviewing Final Verdict',
    };
    reportOfficerActivity(tab, tabLabels[tab], true);
  };

  // Pre-Game Flow Handlers
  const handleBeginFromOpening = () => {
    setCurrentScreen('access_code');
  };

  const handleAccessGranted = () => {
    setCurrentScreen('room_select');
  };

  const handleRoomSelected = (roomId: string) => {
    setCurrentRoomId(roomId);
    sessionStorage.setItem(SESSION_ROOM_KEY, roomId);
    setCurrentScreen('officer_select');
  };

  const handleOfficerJoined = (response: JoinRoomResponse, officerId: OfficerId) => {
    if (response.room) {
      setRoomState(response.room);
    }
    setCurrentOfficerId(officerId);
    sessionStorage.setItem(SESSION_OFFICER_KEY, officerId);

    // If room already has progress/started, go to dashboard, else briefing
    if (response.room && response.room.sharedProgress > 15) {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('briefing');
    }
  };

  const handleEnterDatabaseFromBriefing = () => {
    setCurrentScreen('dashboard');
    setActiveTab('overview');
    reportOfficerActivity('overview', 'Entered Investigation Database', true);
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleOpenLeaveModal = () => {
    setIsLeaveModalOpen(true);
  };

  const handleLeaveToRoomSelect = () => {
    if (currentRoomId && currentOfficerId) {
      apiClient.leaveRoom(currentRoomId, currentOfficerId);
    }
    sessionStorage.removeItem(SESSION_OFFICER_KEY);
    setCurrentOfficerId(null);
    setIsLeaveModalOpen(false);
    setCurrentScreen('room_select');
  };

  const handleLeaveToTerminal = () => {
    if (currentRoomId && currentOfficerId) {
      apiClient.leaveRoom(currentRoomId, currentOfficerId);
    }
    sessionStorage.removeItem(SESSION_ROOM_KEY);
    sessionStorage.removeItem(SESSION_OFFICER_KEY);
    setCurrentRoomId('');
    setCurrentOfficerId(null);
    setIsLeaveModalOpen(false);
    setCurrentScreen('opening');
    setActiveTab('overview');
    setActiveVerdictResult(null);
  };

  const handleResetCase = () => {
    handleOpenLeaveModal();
  };

  // In-Game Tracking & Synchronized Interactions
  const handleRecordEvidenceViewed = async (evidenceId: string, evidenceCode: string, title: string) => {
    if (!currentRoomId || !currentOfficerId) return;
    const updated = await apiClient.recordEvidenceViewed(
      currentRoomId,
      currentOfficerId,
      evidenceId,
      evidenceCode,
      title
    );
    if (updated) {
      setRoomState(updated);
    }
  };

  const handleRecordPersonViewed = async (personId: string, name: string) => {
    if (!currentRoomId || !currentOfficerId) return;
    const updated = await apiClient.recordPersonViewed(currentRoomId, currentOfficerId, personId, name);
    if (updated) {
      setRoomState(updated);
    }
  };

  const handleRecordTimelineViewed = async (timelineId: string) => {
    if (!currentRoomId || !currentOfficerId) return;
    const updated = await apiClient.recordTimelineViewed(
      currentRoomId,
      currentOfficerId,
      timelineId,
      `Timeline ${timelineId}`
    );
    if (updated) {
      setRoomState(updated);
    }
  };

  const handleRecordLocationViewed = async (locationId: string) => {
    if (!currentRoomId || !currentOfficerId) return;
    const updated = await apiClient.recordLocationViewed(currentRoomId, currentOfficerId, locationId);
    if (updated) {
      setRoomState(updated);
    }
  };

  // Detective Notes
  const handleAddNote = async (
    newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'authorOfficerId' | 'authorOfficerName'>,
    isTeamNote: boolean
  ) => {
    if (!currentRoomId || !currentOfficerId) return;
    const res = await apiClient.createNote(currentRoomId, currentOfficerId, newNote, isTeamNote);
    setRoomState(res.room);
  };

  const handleUpdateNote = async (id: string, updated: Partial<Note>, isTeamNote: boolean) => {
    if (!currentRoomId || !currentOfficerId) return;
    const nextRoom = await apiClient.updateNote(currentRoomId, currentOfficerId, id, updated, isTeamNote);
    setRoomState(nextRoom);
  };

  const handleDeleteNote = async (id: string, isTeamNote: boolean) => {
    if (!currentRoomId || !currentOfficerId) return;
    const nextRoom = await apiClient.deleteNote(currentRoomId, currentOfficerId, id, isTeamNote);
    setRoomState(nextRoom);
  };

  const handleQuickAddNoteFromEvidence = (title: string, content: string) => {
    handleAddNote(
      {
        title,
        content,
        category: 'THEORY',
        isTeamNote: true,
      },
      true
    );
  };

  // Verdict Drafts & Submission
  const handleUpdateVerdictDraft = (answers: Partial<VerdictSubmission>, isReady: boolean) => {
    if (!currentRoomId || !currentOfficerId) return;
    apiClient.updateVerdictDraft(currentRoomId, currentOfficerId, answers, isReady);
  };

  const handleNotifyVerdictOpened = () => {
    if (!currentRoomId || !currentOfficerId) return;
    apiClient.notifyVerdictOpened(currentRoomId, currentOfficerId);
  };

  const handleSubmitOfficialVerdict = async (submission: VerdictSubmission) => {
    if (!currentRoomId || !currentOfficerId) return;
    const res = await apiClient.submitOfficialVerdict(currentRoomId, currentOfficerId, submission);
    setRoomState(res.room);
    setActiveVerdictResult(res.result);
  };

  // Personal notes for current officer
  const currentOfficerPersonalNotes = currentOfficerId
    ? roomState.personalNotesByOfficer[currentOfficerId] || []
    : [];

  return (
    <div className="min-h-screen bg-[#07090c] text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. OPENING CINEMATIC SCREEN */}
      {currentScreen === 'opening' && (
        <OpeningScreen
          onBegin={handleBeginFromOpening}
          soundEnabled={soundEnabled}
        />
      )}

      {/* 2. CASE ACCESS CODE SCREEN */}
      {currentScreen === 'access_code' && (
        <CaseAccessScreen
          onAccessGranted={handleAccessGranted}
          soundEnabled={soundEnabled}
        />
      )}

      {/* 3. ROOM SELECTION SCREEN (Create or Enter) */}
      {currentScreen === 'room_select' && (
        <RoomSelectScreen
          onRoomSelected={handleRoomSelected}
          soundEnabled={soundEnabled}
        />
      )}

      {/* 4. OFFICER IDENTITY & VERIFICATION SCREEN */}
      {currentScreen === 'officer_select' && (
        <OfficerSelectScreen
          roomId={currentRoomId}
          onJoined={handleOfficerJoined}
          onBackToRoomSelect={() => setCurrentScreen('room_select')}
          soundEnabled={soundEnabled}
        />
      )}

      {/* 5. CASE BRIEFING SCREEN */}
      {currentScreen === 'briefing' && (
        <CaseBriefing
          currentOfficer={currentOfficer}
          roomId={currentRoomId}
          onEnterDatabase={handleEnterDatabaseFromBriefing}
          onLeaveCase={handleOpenLeaveModal}
          soundEnabled={soundEnabled}
        />
      )}

      {/* 6. MAIN INVESTIGATION DASHBOARD */}
      {currentScreen === 'dashboard' && (
        <div className="flex-1 flex flex-col">
          <Navbar
            roomId={currentRoomId || 'ROY-LOCAL'}
            currentOfficer={currentOfficer}
            activeOfficerSessions={roomState.activeOfficers}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            progressPercent={roomState.sharedProgress}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onLeaveCase={handleOpenLeaveModal}
            onOpenFeed={() => setIsFeedOpen(true)}
            unresolvedInconsistenciesCount={roomState.discoveries.filter((d) => d.isContradiction).length}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
            {activeTab === 'overview' && (
              <CaseOverview
                discoveries={roomState.discoveries}
                onNavigateTab={handleSelectTab}
                viewedEvidenceCount={roomState.reviewedEvidenceIds.length}
                viewedPeopleCount={roomState.reviewedPeopleIds.length}
                progressPercent={roomState.sharedProgress}
                soundEnabled={soundEnabled}
              />
            )}

            {activeTab === 'people' && (
              <PeopleSection
                onOpenEvidence={(code) => {
                  setTargetEvidenceCode(code);
                  setActiveTab('evidence');
                }}
                onRecordPersonViewed={handleRecordPersonViewed}
                viewedPeopleIds={roomState.reviewedPeopleIds}
                peopleReviewers={roomState.peopleReviewers}
                soundEnabled={soundEnabled}
              />
            )}

            {activeTab === 'evidence' && (
              <EvidenceSection
                selectedEvidenceCode={targetEvidenceCode}
                onClearSelectedCode={() => setTargetEvidenceCode(null)}
                onRecordEvidenceViewed={handleRecordEvidenceViewed}
                onOpenPerson={() => setActiveTab('people')}
                onQuickAddNote={handleQuickAddNoteFromEvidence}
                viewedEvidenceIds={roomState.reviewedEvidenceIds}
                evidenceReviewers={roomState.evidenceReviewers}
                soundEnabled={soundEnabled}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineSection
                onOpenEvidence={(code) => {
                  setTargetEvidenceCode(code);
                  setActiveTab('evidence');
                }}
                onOpenPerson={() => setActiveTab('people')}
                onRecordTimelineViewed={handleRecordTimelineViewed}
                viewedTimelineIds={roomState.reviewedTimelineIds}
                viewedEvidenceIds={roomState.reviewedEvidenceIds}
                soundEnabled={soundEnabled}
              />
            )}

            {activeTab === 'roybari' && (
              <RoyBariSection
                onOpenEvidence={(code) => {
                  setTargetEvidenceCode(code);
                  setActiveTab('evidence');
                }}
                onRecordLocationViewed={handleRecordLocationViewed}
                viewedLocationIds={roomState.reviewedLocationIds}
                soundEnabled={soundEnabled}
              />
            )}

            {activeTab === 'notes' && (
              <DetectiveNotes
                currentOfficer={currentOfficer}
                teamNotes={roomState.teamNotes}
                personalNotes={currentOfficerPersonalNotes}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                soundEnabled={soundEnabled}
              />
            )}

            {activeTab === 'verdict' && (
              <FinalVerdict
                currentOfficer={currentOfficer}
                officerVerdictDrafts={roomState.officerVerdictDrafts}
                onUpdateDraft={handleUpdateVerdictDraft}
                onSubmitVerdict={handleSubmitOfficialVerdict}
                onNotifyVerdictOpened={handleNotifyVerdictOpened}
                soundEnabled={soundEnabled}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-neutral-900 bg-[#090b0e] py-4 px-6 text-center text-xs font-mono text-neutral-600">
            CBI SPECIAL INVESTIGATION TEAM // CASE FILE #005 // ROOM: {currentRoomId || 'SECURE'}
          </footer>
        </div>
      )}

      {/* Live Activity Feed Drawer */}
      <LiveInvestigationFeed
        isOpen={isFeedOpen}
        onClose={() => setIsFeedOpen(false)}
        activityLog={roomState.activityLog}
      />

      {/* Dynamic Contradiction Notification Toast */}
      {inconsistencyToast.show && (
        <InconsistencyNotification
          message={inconsistencyToast.message}
          onDismiss={() => setInconsistencyToast({ show: false, message: '' })}
          onClickDetails={() => {
            setInconsistencyToast({ show: false, message: '' });
            setActiveTab('timeline');
          }}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Session Replaced Modal (Takeover) */}
      {isSessionReplaced && currentOfficer && (
        <SessionReplacedModal
          officer={currentOfficer}
          onAcknowledge={() => {
            setIsSessionReplaced(false);
            setCurrentOfficerId(null);
            setCurrentScreen('opening');
          }}
        />
      )}

      {/* Ending Modal (A, B, or C) */}
      {activeVerdictResult && (
        <EndingModal
          result={activeVerdictResult}
          onReturnToInvestigation={() => {
            setActiveVerdictResult(null);
            setActiveTab('overview');
          }}
          onRestartCase={handleResetCase}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Official Leave Case Confirmation Modal */}
      <LeaveCaseModal
        isOpen={isLeaveModalOpen}
        roomId={currentRoomId || 'SECURE'}
        currentOfficer={currentOfficer}
        soundEnabled={soundEnabled}
        onClose={() => setIsLeaveModalOpen(false)}
        onLeaveToRoomSelect={handleLeaveToRoomSelect}
        onLeaveToTerminal={handleLeaveToTerminal}
      />
    </div>
  );
}
