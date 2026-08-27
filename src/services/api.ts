import { 
  OfficerId, 
  InvestigationRoomState, 
  ActivityEvent, 
  Note, 
  VerdictResult,
  VerdictSubmission,
  DashboardTab,
  CaseDiscovery
} from '../types';
import { 
  generateRoomId, 
  createInitialRoomState, 
  getSavedRoom, 
  saveRoomState, 
  calculateSharedProgress 
} from './roomStore';
import { socketHub } from './socket';
import { OFFICERS, validateCaseAccessCode, validateOfficerVerification } from '../data/officers';
import { validateVerdictSubmission } from '../data/solution';

export interface JoinRoomResponse {
  success: boolean;
  message?: string;
  room?: InvestigationRoomState;
  sessionId?: string;
  isReplaced?: boolean;
}

export interface RoomSummaryResponse {
  exists: boolean;
  roomId: string;
  caseName: string;
  sharedProgress: number;
  activeOfficersCount: number;
  previouslyConnectedOfficers: {
    id: OfficerId;
    name: string;
    rank: string;
    role: string;
  }[];
}

/**
 * Backend API Client & Controller
 * Matches the future REST API endpoints for Render + MongoDB
 */
class InvestigationApiClient {
  /**
   * POST /api/auth/access-code
   */
  public async verifyAccessCode(code: string): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 250)); // realistic network latency
    const isValid = validateCaseAccessCode(code);
    if (!isValid) {
      return {
        success: false,
        message: 'The case access code is invalid. Access Denied.',
      };
    }
    return {
      success: true,
      message: 'Access Granted. Case File #005 unlocked.',
    };
  }

  /**
   * POST /api/rooms
   */
  public async createRoom(): Promise<{ success: boolean; roomId: string; room: InvestigationRoomState }> {
    await new Promise((r) => setTimeout(r, 200));
    const roomId = generateRoomId();
    const room = createInitialRoomState(roomId);
    saveRoomState(room);
    return { success: true, roomId, room };
  }

  /**
   * GET /api/rooms/:roomId
   */
  public async getRoomSummary(roomId: string): Promise<RoomSummaryResponse> {
    await new Promise((r) => setTimeout(r, 150));
    const cleanId = roomId.trim().toUpperCase();
    const room = getSavedRoom(cleanId);

    if (!room) {
      return {
        exists: false,
        roomId: cleanId,
        caseName: 'The Fire at Roy Bari',
        sharedProgress: 0,
        activeOfficersCount: 0,
        previouslyConnectedOfficers: [],
      };
    }

    const previousOfficerDetails = (room.previouslyConnectedOfficers || []).map((id) => ({
      id,
      name: OFFICERS[id]?.name || id,
      rank: OFFICERS[id]?.rank || 'Officer',
      role: OFFICERS[id]?.role || 'Investigator',
    }));

    return {
      exists: true,
      roomId: cleanId,
      caseName: 'The Fire at Roy Bari',
      sharedProgress: room.sharedProgress,
      activeOfficersCount: Object.values(room.activeOfficers).filter((o) => o.status === 'active').length,
      previouslyConnectedOfficers: previousOfficerDetails,
    };
  }

  /**
   * GET /api/rooms/:roomId/state
   */
  public async getRoomState(roomId: string): Promise<InvestigationRoomState | null> {
    return getSavedRoom(roomId);
  }

  /**
   * POST /api/rooms/:roomId/join
   */
  public async joinRoom(
    roomId: string,
    officerId: OfficerId,
    verificationCode: string
  ): Promise<JoinRoomResponse> {
    await new Promise((r) => setTimeout(r, 300));
    const cleanId = roomId.trim().toUpperCase();
    let room = getSavedRoom(cleanId);

    if (!room) {
      return {
        success: false,
        message: 'Investigation Room not found. Check the Room ID and try again.',
      };
    }

    // Verify officer credentials
    const isCodeValid = validateOfficerVerification(officerId, verificationCode);
    if (!isCodeValid) {
      return {
        success: false,
        message: 'Personal verification code is invalid for this officer.',
      };
    }

    // Check maximum 4 active officers limit
    const now = Date.now();
    const activeOfficersList = Object.values(room.activeOfficers).filter(
      (o) => o.status === 'active' && o.officerId !== officerId && now - o.lastPing < 30000
    );

    if (activeOfficersList.length >= 4) {
      return {
        success: false,
        message: 'INVESTIGATION TEAM FULL — Maximum active officers reached: 4/4.',
      };
    }

    const newSessionId = `sess-${officerId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const officerProfile = OFFICERS[officerId];

    // Update active officers list
    room.activeOfficers[officerId] = {
      officerId,
      officerName: officerProfile.name,
      status: 'active',
      currentActivity: 'Connected to Investigation Room',
      currentTab: 'overview',
      lastPing: now,
      sessionId: newSessionId,
    };

    if (!room.previouslyConnectedOfficers.includes(officerId)) {
      room.previouslyConnectedOfficers.push(officerId);
    }

    // Log Activity
    const actEvent: ActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      officerId,
      officerName: officerProfile.name,
      actionText: `joined the investigation room.`,
      category: 'PRESENCE',
    };
    room.activityLog = [actEvent, ...(room.activityLog || [])].slice(0, 80);
    room.lastActivity = new Date().toISOString();

    saveRoomState(room);

    // Broadcast officer joined to room
    socketHub.connect(cleanId, officerId, newSessionId);
    socketHub.emit('officer:joined', {
      officerId,
      officerName: officerProfile.name,
      sessionId: newSessionId,
      activity: room.activeOfficers[officerId],
      event: actEvent,
    });

    return {
      success: true,
      room,
      sessionId: newSessionId,
    };
  }

  /**
   * POST /api/rooms/:roomId/leave
   */
  public async leaveRoom(roomId: string, officerId: OfficerId): Promise<void> {
    const room = getSavedRoom(roomId);
    if (room && room.activeOfficers[officerId]) {
      room.activeOfficers[officerId].status = 'offline';
      room.activeOfficers[officerId].currentActivity = 'Offline';
      room.lastActivity = new Date().toISOString();

      const actEvent: ActivityEvent = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        officerId,
        officerName: OFFICERS[officerId]?.name || officerId,
        actionText: `disconnected from the investigation.`,
        category: 'PRESENCE',
      };
      room.activityLog = [actEvent, ...(room.activityLog || [])].slice(0, 80);
      saveRoomState(room);

      socketHub.emit('officer:disconnected', {
        officerId,
        event: actEvent,
      });
    }
    socketHub.disconnect();
  }

  /**
   * POST /api/rooms/:roomId/activity
   */
  public async updateActivity(
    roomId: string,
    officerId: OfficerId,
    activity: { tab: DashboardTab; detail?: string; actionText: string; isMajorAction?: boolean }
  ): Promise<void> {
    const room = getSavedRoom(roomId);
    if (!room) return;

    if (room.activeOfficers[officerId]) {
      room.activeOfficers[officerId].currentTab = activity.tab;
      room.activeOfficers[officerId].currentDetail = activity.detail;
      room.activeOfficers[officerId].currentActivity = activity.actionText;
      room.activeOfficers[officerId].status = 'active';
      room.activeOfficers[officerId].lastPing = Date.now();
    }

    let createdEvent: ActivityEvent | null = null;

    if (activity.isMajorAction) {
      createdEvent = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        officerId,
        officerName: OFFICERS[officerId]?.name || officerId,
        actionText: activity.actionText,
        target: activity.detail,
        category: activity.tab === 'evidence' ? 'EVIDENCE' : activity.tab === 'people' ? 'PERSON' : activity.tab === 'timeline' ? 'TIMELINE' : 'PRESENCE',
      };
      room.activityLog = [createdEvent, ...(room.activityLog || [])].slice(0, 80);
    }

    room.lastActivity = new Date().toISOString();
    saveRoomState(room);

    socketHub.emit('officer:activity', {
      officerId,
      activity: room.activeOfficers[officerId],
      event: createdEvent,
    });
  }

  /**
   * Record Evidence Review in Shared Room
   */
  public async recordEvidenceViewed(
    roomId: string,
    officerId: OfficerId,
    evidenceId: string,
    evidenceCode: string,
    evidenceTitle: string
  ): Promise<InvestigationRoomState | null> {
    const room = getSavedRoom(roomId);
    if (!room) return null;

    const isFirstView = !room.reviewedEvidenceIds.includes(evidenceId);
    if (isFirstView) {
      room.reviewedEvidenceIds.push(evidenceId);
    }

    if (!room.evidenceReviewers[evidenceId]) {
      room.evidenceReviewers[evidenceId] = [];
    }
    if (!room.evidenceReviewers[evidenceId].includes(officerId)) {
      room.evidenceReviewers[evidenceId].push(officerId);
    }

    // Check dynamic discoveries
    this.checkDiscoveries(room);

    room.sharedProgress = calculateSharedProgress(room);

    const actEvent: ActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      officerId,
      officerName: OFFICERS[officerId]?.name || officerId,
      actionText: `reviewed exhibit: ${evidenceCode} (${evidenceTitle})`,
      target: evidenceCode,
      category: 'EVIDENCE',
    };
    room.activityLog = [actEvent, ...(room.activityLog || [])].slice(0, 80);
    room.lastActivity = new Date().toISOString();

    saveRoomState(room);

    socketHub.emit('evidence:reviewed', {
      evidenceId,
      officerId,
      roomState: room,
      event: actEvent,
    });

    return room;
  }

  /**
   * Record Person Profile Review in Shared Room
   */
  public async recordPersonViewed(
    roomId: string,
    officerId: OfficerId,
    personId: string,
    personName: string
  ): Promise<InvestigationRoomState | null> {
    const room = getSavedRoom(roomId);
    if (!room) return null;

    const isFirst = !room.reviewedPeopleIds.includes(personId);
    if (isFirst) {
      room.reviewedPeopleIds.push(personId);
    }

    if (!room.peopleReviewers[personId]) {
      room.peopleReviewers[personId] = [];
    }
    if (!room.peopleReviewers[personId].includes(officerId)) {
      room.peopleReviewers[personId].push(officerId);
    }

    room.sharedProgress = calculateSharedProgress(room);

    const actEvent: ActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      officerId,
      officerName: OFFICERS[officerId]?.name || officerId,
      actionText: `examined dossier for: ${personName}`,
      target: personName,
      category: 'PERSON',
    };
    room.activityLog = [actEvent, ...(room.activityLog || [])].slice(0, 80);
    room.lastActivity = new Date().toISOString();

    saveRoomState(room);

    socketHub.emit('person:reviewed', {
      personId,
      officerId,
      roomState: room,
      event: actEvent,
    });

    return room;
  }

  /**
   * Record Timeline Event Review in Shared Room
   */
  public async recordTimelineViewed(
    roomId: string,
    officerId: OfficerId,
    timelineId: string,
    timeTitle: string
  ): Promise<InvestigationRoomState | null> {
    const room = getSavedRoom(roomId);
    if (!room) return null;

    if (!room.reviewedTimelineIds.includes(timelineId)) {
      room.reviewedTimelineIds.push(timelineId);
    }

    this.checkDiscoveries(room);
    room.sharedProgress = calculateSharedProgress(room);
    room.lastActivity = new Date().toISOString();

    saveRoomState(room);

    socketHub.emit('timeline:reviewed', {
      timelineId,
      officerId,
      roomState: room,
    });

    return room;
  }

  /**
   * Record Location Zone in Shared Room
   */
  public async recordLocationViewed(
    roomId: string,
    officerId: OfficerId,
    locationId: string
  ): Promise<InvestigationRoomState | null> {
    const room = getSavedRoom(roomId);
    if (!room) return null;

    if (!room.reviewedLocationIds.includes(locationId)) {
      room.reviewedLocationIds.push(locationId);
    }

    room.sharedProgress = calculateSharedProgress(room);
    room.lastActivity = new Date().toISOString();

    saveRoomState(room);

    socketHub.emit('location:reviewed', {
      locationId,
      officerId,
      roomState: room,
    });

    return room;
  }

  /**
   * POST /api/rooms/:roomId/notes (Team or Personal)
   */
  public async createNote(
    roomId: string,
    officerId: OfficerId,
    noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'authorOfficerId' | 'authorOfficerName'>,
    isTeamNote: boolean
  ): Promise<{ note: Note; room: InvestigationRoomState }> {
    const room = getSavedRoom(roomId) || createInitialRoomState(roomId);
    const now = new Date().toISOString();
    const officer = OFFICERS[officerId];

    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: now,
      updatedAt: now,
      authorOfficerId: officerId,
      authorOfficerName: officer.name,
      isTeamNote,
    };

    if (isTeamNote) {
      room.teamNotes = [newNote, ...room.teamNotes];
    } else {
      if (!room.personalNotesByOfficer[officerId]) {
        room.personalNotesByOfficer[officerId] = [];
      }
      room.personalNotesByOfficer[officerId] = [newNote, ...room.personalNotesByOfficer[officerId]];
    }

    room.sharedProgress = calculateSharedProgress(room);

    const actEvent: ActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      officerId,
      officerName: officer.name,
      actionText: isTeamNote ? `added a Team Note: "${newNote.title}"` : `logged a personal journal note.`,
      category: 'NOTE',
    };
    room.activityLog = [actEvent, ...(room.activityLog || [])].slice(0, 80);
    room.lastActivity = now;

    saveRoomState(room);

    socketHub.emit('note:created', {
      note: newNote,
      isTeamNote,
      officerId,
      roomState: room,
      event: isTeamNote ? actEvent : undefined,
    });

    return { note: newNote, room };
  }

  /**
   * PATCH /api/rooms/:roomId/notes/:noteId
   */
  public async updateNote(
    roomId: string,
    officerId: OfficerId,
    noteId: string,
    updates: Partial<Note>,
    isTeamNote: boolean
  ): Promise<InvestigationRoomState> {
    const room = getSavedRoom(roomId) || createInitialRoomState(roomId);
    const now = new Date().toISOString();

    if (isTeamNote) {
      room.teamNotes = room.teamNotes.map((n) =>
        n.id === noteId ? { ...n, ...updates, updatedAt: now } : n
      );
    } else {
      if (room.personalNotesByOfficer[officerId]) {
        room.personalNotesByOfficer[officerId] = room.personalNotesByOfficer[officerId].map((n) =>
          n.id === noteId ? { ...n, ...updates, updatedAt: now } : n
        );
      }
    }

    room.lastActivity = now;
    saveRoomState(room);

    socketHub.emit('note:updated', {
      noteId,
      updates,
      isTeamNote,
      officerId,
      roomState: room,
    });

    return room;
  }

  /**
   * DELETE /api/rooms/:roomId/notes/:noteId
   */
  public async deleteNote(
    roomId: string,
    officerId: OfficerId,
    noteId: string,
    isTeamNote: boolean
  ): Promise<InvestigationRoomState> {
    const room = getSavedRoom(roomId) || createInitialRoomState(roomId);
    const now = new Date().toISOString();

    if (isTeamNote) {
      room.teamNotes = room.teamNotes.filter((n) => n.id !== noteId);
    } else {
      if (room.personalNotesByOfficer[officerId]) {
        room.personalNotesByOfficer[officerId] = room.personalNotesByOfficer[officerId].filter(
          (n) => n.id !== noteId
        );
      }
    }

    room.lastActivity = now;
    saveRoomState(room);

    socketHub.emit('note:deleted', {
      noteId,
      isTeamNote,
      officerId,
      roomState: room,
    });

    return room;
  }

  /**
   * Broadcast Verdict Draft Updates (when answering questions)
   */
  public async updateVerdictDraft(
    roomId: string,
    officerId: OfficerId,
    answers: Partial<VerdictSubmission>,
    isReady: boolean
  ): Promise<InvestigationRoomState> {
    const room = getSavedRoom(roomId) || createInitialRoomState(roomId);
    const now = new Date().toISOString();

    room.officerVerdictDrafts[officerId] = {
      answers,
      isReady,
      lastUpdated: now,
    };
    room.isVerdictUnderReview = true;
    room.lastActivity = now;

    saveRoomState(room);

    socketHub.emit('verdict:updated', {
      officerId,
      draft: room.officerVerdictDrafts[officerId],
      roomState: room,
    });

    return room;
  }

  /**
   * Notify Room that an officer opened Final Verdict
   */
  public async notifyVerdictOpened(roomId: string, officerId: OfficerId): Promise<void> {
    const officer = OFFICERS[officerId];
    socketHub.emit('verdict:opened', {
      officerId,
      officerName: officer?.name || officerId,
      message: `${officer?.name || 'An officer'} is reviewing the Final Verdict.`,
    });
  }

  /**
   * POST /api/rooms/:roomId/verdict (Submit Final Official Verdict by ACP Arjun Chatterjee)
   */
  public async submitOfficialVerdict(
    roomId: string,
    officerId: OfficerId,
    submission: VerdictSubmission
  ): Promise<{ result: VerdictResult; room: InvestigationRoomState }> {
    const room = getSavedRoom(roomId) || createInitialRoomState(roomId);
    const officer = OFFICERS[officerId];

    const result = validateVerdictSubmission(submission);
    const fullResult: VerdictResult = {
      ...result,
      submittedByOfficerId: officerId,
      submittedByOfficerName: officer.name,
    };

    room.officialVerdictResult = fullResult;
    room.lastActivity = new Date().toISOString();

    const actEvent: ActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      officerId,
      officerName: officer.name,
      actionText: `submitted the OFFICIAL CASE VERDICT (${result.ending.replace(/_/g, ' ')}).`,
      category: 'VERDICT',
    };
    room.activityLog = [actEvent, ...(room.activityLog || [])].slice(0, 80);

    saveRoomState(room);

    socketHub.emit('verdict:submitted', {
      officerId,
      result: fullResult,
      roomState: room,
      event: actEvent,
    });

    return { result: fullResult, room };
  }

  /**
   * Check dynamic discoveries based on reviewed evidence
   */
  private checkDiscoveries(room: InvestigationRoomState) {
    const newDiscs: CaseDiscovery[] = [...room.discoveries];

    if (room.reviewedEvidenceIds.includes('E001') && room.reviewedEvidenceIds.includes('E002')) {
      if (!newDiscs.some((d) => d.id === 'disc-timeline-inconsistency')) {
        newDiscs.push({
          id: 'disc-timeline-inconsistency',
          title: 'Departure & Fire Discrepancy',
          category: 'TIMELINE',
          discoveredAt: '14 May 2026',
          description: "Ritam Roy's mobile device left Roy Bari approximately eight minutes before the estimated start of the fire.",
          isContradiction: true,
        });
      }
    }

    if (room.reviewedEvidenceIds.includes('E003')) {
      if (!newDiscs.some((d) => d.id === 'disc-subhash-toxicology')) {
        newDiscs.push({
          id: 'disc-subhash-toxicology',
          title: 'Caretaker Chemical Incapacitation',
          category: 'FORENSIC',
          discoveredAt: '15 May 2026',
          description: 'Autopsy confirmed absence of smoke in Subhash’s respiratory tract and heavy Diazepam sedation.',
        });
      }
    }

    if (room.reviewedEvidenceIds.includes('E005')) {
      if (!newDiscs.some((d) => d.id === 'disc-financial-wire')) {
        newDiscs.push({
          id: 'disc-financial-wire',
          title: 'Offshore Transfer Connection',
          category: 'FINANCIAL',
          discoveredAt: '28 April 2026',
          description: 'A ₹2 Crore wire transfer was received by Ritam Roy from an offshore entity linked to Madhurima Roy.',
        });
      }
    }

    if (room.reviewedEvidenceIds.includes('E006')) {
      if (!newDiscs.some((d) => d.id === 'disc-smart-home-spoof')) {
        newDiscs.push({
          id: 'disc-smart-home-spoof',
          title: 'Smart-Home Manipulation Logs',
          category: 'SECURITY',
          discoveredAt: '16 May 2026',
          description: 'Apparent supernatural phenomena were generated by automated smart dimmer routines and hidden Bluetooth transducers.',
        });
      }
    }

    if (room.reviewedEvidenceIds.includes('E007')) {
      if (!newDiscs.some((d) => d.id === 'disc-madhurima-intel')) {
        newDiscs.push({
          id: 'disc-madhurima-intel',
          title: 'Digital Flight & Trust Intelligence',
          category: 'INTELLIGENCE',
          discoveredAt: '17 May 2026',
          description: 'Encrypted cloud communications and foreign passenger manifests suggest Madhurima Roy orchestrated offshore liquidation.',
        });
      }
    }

    room.discoveries = newDiscs;
  }
}

export const apiClient = new InvestigationApiClient();
