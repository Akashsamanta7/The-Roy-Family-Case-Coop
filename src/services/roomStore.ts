import { 
  InvestigationRoomState, 
  OfficerId, 
  OfficerSessionState, 
  Note, 
  ActivityEvent, 
  VerdictResult,
  VerdictSubmission,
  CaseDiscovery
} from '../types';
import { INITIAL_DISCOVERIES } from '../data/caseData';
import { OFFICERS } from '../data/officers';

const ROOM_STORAGE_PREFIX = 'ROY_BARI_ROOM_V2_';
const ROOM_LIST_KEY = 'ROY_BARI_ALL_ROOMS_INDEX_V2';

/**
 * Generates a human-friendly, non-sequential CBI Room ID
 * e.g. "ROY-7KQ2-M9X4"
 */
export function generateRoomId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ROY-${p1}-${p2}`;
}

export function normalizeRoomId(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

/**
 * Creates initial clean room state
 */
export function createInitialRoomState(roomId: string): InvestigationRoomState {
  const now = new Date().toISOString();
  
  const initialOfficerSessions: Record<OfficerId, OfficerSessionState> = {
    arjun: {
      officerId: 'arjun',
      officerName: OFFICERS.arjun.name,
      status: 'offline',
      currentActivity: 'Offline',
      currentTab: 'overview',
      lastPing: 0,
      sessionId: '',
    },
    aditi: {
      officerId: 'aditi',
      officerName: OFFICERS.aditi.name,
      status: 'offline',
      currentActivity: 'Offline',
      currentTab: 'overview',
      lastPing: 0,
      sessionId: '',
    },
    kabir: {
      officerId: 'kabir',
      officerName: OFFICERS.kabir.name,
      status: 'offline',
      currentActivity: 'Offline',
      currentTab: 'overview',
      lastPing: 0,
      sessionId: '',
    },
    riya: {
      officerId: 'riya',
      officerName: OFFICERS.riya.name,
      status: 'offline',
      currentActivity: 'Offline',
      currentTab: 'overview',
      lastPing: 0,
      sessionId: '',
    },
  };

  const initialTeamNotes: Note[] = [
    {
      id: 'team-note-init-1',
      title: 'High Court Mandate & Team Strategy',
      content: 'Independent SIT convened to review the Roy Bari fire tragedy. Priority tasks: (1) Re-evaluate digital timestamps of Ritam Roy, (2) Verify Subhash toxicology, (3) Cross-examine smart-home anomalies.',
      category: 'FACT',
      createdAt: now,
      updatedAt: now,
      authorOfficerId: 'arjun',
      authorOfficerName: 'ACP Arjun Chatterjee',
      isTeamNote: true,
    },
  ];

  return {
    roomId,
    caseId: 'CBI-CR-2026-005',
    createdAt: now,
    lastActivity: now,
    sharedProgress: 12,
    activeOfficers: initialOfficerSessions,
    previouslyConnectedOfficers: [],
    reviewedEvidenceIds: [],
    evidenceReviewers: {},
    reviewedPeopleIds: [],
    peopleReviewers: {},
    reviewedTimelineIds: [],
    reviewedLocationIds: [],
    discoveredInconsistencyIds: [],
    discoveries: [...INITIAL_DISCOVERIES],
    teamNotes: initialTeamNotes,
    personalNotesByOfficer: {
      arjun: [],
      aditi: [],
      kabir: [],
      riya: [],
    },
    activityLog: [
      {
        id: `act-${Date.now()}-init`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        officerId: 'arjun',
        officerName: 'CBI System',
        actionText: 'Investigation Room created. Case File #005 unsealed.',
        category: 'PRESENCE',
      },
    ],
    officerVerdictDrafts: {
      arjun: { answers: {}, isReady: false, lastUpdated: now },
      aditi: { answers: {}, isReady: false, lastUpdated: now },
      kabir: { answers: {}, isReady: false, lastUpdated: now },
      riya: { answers: {}, isReady: false, lastUpdated: now },
    },
    isVerdictUnderReview: false,
    officialVerdictResult: null,
  };
}

/**
 * Calculates shared team progress percentage (0-100%)
 */
export function calculateSharedProgress(room: InvestigationRoomState): number {
  const evidenceScore = Math.min(40, (room.reviewedEvidenceIds.length / 8) * 40);
  const peopleScore = Math.min(25, (room.reviewedPeopleIds.length / 6) * 25);
  const timelineScore = Math.min(15, (room.reviewedTimelineIds.length / 8) * 15);
  const locationScore = Math.min(10, (room.reviewedLocationIds.length / 6) * 10);
  const notesScore = Math.min(10, Math.max(0, room.teamNotes.length - 1) * 3.33);

  const total = Math.round(evidenceScore + peopleScore + timelineScore + locationScore + notesScore);
  return Math.min(100, Math.max(0, total));
}

/**
 * Storage helpers for Room Persistence
 */
export function getSavedRoom(roomId: string): InvestigationRoomState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${ROOM_STORAGE_PREFIX}${roomId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed to load room from storage:', err);
    return null;
  }
}

export function saveRoomState(state: InvestigationRoomState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${ROOM_STORAGE_PREFIX}${state.roomId}`, JSON.stringify(state));
    
    // Maintain index of known room IDs
    const rawList = localStorage.getItem(ROOM_LIST_KEY);
    const list: string[] = rawList ? JSON.parse(rawList) : [];
    if (!list.includes(state.roomId)) {
      list.unshift(state.roomId);
      localStorage.setItem(ROOM_LIST_KEY, JSON.stringify(list.slice(0, 30)));
    }
  } catch (err) {
    console.error('Failed to persist room state:', err);
  }
}

export function getRecentRoomIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ROOM_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
