import { GameProgressState, Note, VerdictResult, DashboardTab } from '../types';

const STORAGE_KEY = 'ROY_BARI_INVESTIGATION_STATE_V1';

const DEFAULT_STATE: GameProgressState = {
  viewedEvidenceIds: [],
  viewedPeopleIds: [],
  viewedTimelineIds: [],
  viewedLocationIds: [],
  discoveredInconsistencies: [],
  notes: [
    {
      id: 'init-note-1',
      title: 'Initial Case Reopening Directive',
      content: 'Independent review sanctioned by High Court. Original conviction of Yash Roy heavily contested due to missing digital forensics and sudden capital sentencing.',
      category: 'FACT',
      authorOfficerId: 'arjun',
      authorOfficerName: 'ACP Arjun Chatterjee',
      isTeamNote: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  verdictHistory: [],
  lastActiveTab: 'overview',
  hasStartedGame: false,
  soundEnabled: true,
};

export function loadGameState(): GameProgressState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (err) {
    console.error('Failed to load game state from storage:', err);
    return DEFAULT_STATE;
  }
}

export function saveGameState(state: GameProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save game state to storage:', err);
  }
}

export function resetGameState(): GameProgressState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear game state:', err);
  }
  return DEFAULT_STATE;
}

/**
 * Calculates investigation completion percentage (0 - 100%)
 * based on meaningful investigative milestones:
 * - Evidence viewed (8 items = up to 40%)
 * - People inspected (6 people = up to 25%)
 * - Timeline inspected (8 events = up to 15%)
 * - Locations explored (6 zones = up to 10%)
 * - Detective notes created (up to 10%)
 */
export function calculateProgress(state: GameProgressState): number {
  const evidenceScore = Math.min(40, (state.viewedEvidenceIds.length / 8) * 40);
  const peopleScore = Math.min(25, (state.viewedPeopleIds.length / 6) * 25);
  const timelineScore = Math.min(15, (state.viewedTimelineIds.length / 8) * 15);
  const locationScore = Math.min(10, (state.viewedLocationIds.length / 6) * 10);
  const notesScore = Math.min(10, Math.max(0, (state.notes.length - 1)) * 3.33);

  const total = Math.round(evidenceScore + peopleScore + timelineScore + locationScore + notesScore);
  return Math.min(100, Math.max(0, total));
}
