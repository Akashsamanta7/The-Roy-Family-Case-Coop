export type GameScreen = 
  | 'access_code'
  | 'room_select'
  | 'officer_select'
  | 'connecting'
  | 'opening'
  | 'briefing'
  | 'dashboard'
  | 'verdict';

export type DashboardTab = 
  | 'overview' 
  | 'people' 
  | 'evidence' 
  | 'timeline' 
  | 'roybari' 
  | 'notes' 
  | 'verdict';

export type OfficerId = 'arjun' | 'aditi' | 'kabir' | 'riya';

export interface OfficerProfile {
  id: OfficerId;
  name: string;
  rank: string;
  role: string;
  badgeNumber: string;
  verificationCode: string;
  avatarInitials: string;
  avatarColor: string;
  avatarBorder: string;
  department: string;
  bio: string;
  isTeamLead?: boolean;
}

export type OfficerStatus = 'active' | 'idle' | 'offline';

export type OfficerActivityAction = 
  | 'Viewing Case Overview'
  | 'Examining Evidence'
  | 'Reading Suspect Profiles'
  | 'Reviewing Timeline'
  | 'Inspecting Roy Bari Estate'
  | 'Writing Personal Notes'
  | 'Updating Team Notes'
  | 'Reviewing Final Verdict'
  | 'Submitting Verdict'
  | 'Idle'
  | 'Connected to Investigation Room'
  | 'Disconnected';

export interface OfficerSessionState {
  officerId: OfficerId;
  officerName: string;
  status: OfficerStatus;
  currentActivity: string;
  currentTab: DashboardTab;
  currentDetail?: string; // e.g. "E003" or "Subhash Chandra"
  lastPing: number; // timestamp
  sessionId: string; // unique session token for session replacement
}

export type NoteCategory = 'FACT' | 'QUESTION' | 'SUSPICION' | 'THEORY';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
  updatedAt: string;
  relatedPersonId?: string;
  relatedEvidenceId?: string;
  authorOfficerId: OfficerId;
  authorOfficerName: string;
  isTeamNote: boolean;
}

export type EvidenceCategory = 
  | 'Digital Forensics'
  | 'Financial Records'
  | 'Autopsy Reports'
  | 'Crime Scene Evidence'
  | 'Smart-Home Data'
  | 'Phone Data'
  | 'CBI Analysis';

export type ImportanceLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'CORROBORATING';

export interface EvidenceItem {
  id: string;
  code: string; // e.g. "E001"
  title: string;
  category: EvidenceCategory;
  date: string;
  time?: string;
  location?: string;
  importance: ImportanceLevel;
  status: 'VERIFIED' | 'UNSEALED' | 'RE-EXAMINED' | 'DISPUTED';
  summary: string;
  description: string[];
  forensicNotes?: string[];
  contradictionHint?: string;
  relatedPeopleIds: string[];
  relatedLocationId?: string;
  sourceDocNumber?: string;
  classificationLevel: 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET // CBI ARCHIVE';
}

export interface SuspectPerson {
  id: string;
  name: string;
  alias?: string;
  age?: number;
  role: string;
  status: string;
  relationship: string;
  caseConnection: string;
  knownStatements: string[];
  observations: string[];
  associatedEvidenceIds: string[];
  avatarStyle: {
    badgeColor: string;
    tag: string;
    initials: string;
  };
  interrogationSummary?: string;
  timelineRole: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  dateTimeStr: string;
  title: string;
  location: string;
  description: string;
  associatedEvidenceIds: string[];
  associatedPeopleIds: string[];
  isCriticalDiscrepancy?: boolean;
  category: 'MOVEMENT' | 'INFRASTRUCTURE' | 'INCIDENT' | 'RESPONSE';
}

export interface LocationZone {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  damageLevel: 'TOTAL DESTRUCTION' | 'HEAVY SMOKE & CHAR' | 'INSPECTED & INTACT' | 'EXTERIOR PERIMETER';
  summary: string;
  description: string;
  findings: string[];
  associatedEvidenceIds: string[];
  coordinates: { x: number; y: number };
}

export interface CaseDiscovery {
  id: string;
  title: string;
  category: 'TIMELINE' | 'FORENSIC' | 'FINANCIAL' | 'SECURITY' | 'INTELLIGENCE';
  discoveredAt: string;
  description: string;
  relatedEvidenceId?: string;
  isContradiction?: boolean;
}

export interface VerdictSubmission {
  q1_physical_perpetrator: string;
  q2_conspiracy_mastermind: string;
  q3_ritam_contradiction: string;
  q4_subhash_incapacitation: string;
  q5_haunting_explanation: string;
  q6_pre_fire_event: string;
  q7_wrongly_convicted: string;
}

export type EndingType = 'A_COMPLETE_TRUTH' | 'B_PARTIAL_TRUTH' | 'C_VERDICT_REJECTED';

export interface VerdictResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  ending: EndingType;
  questionFeedback: {
    questionId: string;
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  verdictDate: string;
  submittedByOfficerId: OfficerId;
  submittedByOfficerName: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  officerId: OfficerId;
  officerName: string;
  actionText: string;
  target?: string;
  category: 'EVIDENCE' | 'PERSON' | 'TIMELINE' | 'NOTE' | 'VERDICT' | 'PRESENCE' | 'DISCOVERY';
}

export interface OfficerVerdictDraft {
  answers: Partial<VerdictSubmission>;
  isReady: boolean;
  lastUpdated: string;
}

/**
 * MongoDB-compliant Room Schema representation
 */
export interface InvestigationRoomState {
  roomId: string;
  caseId: string;
  createdAt: string;
  lastActivity: string;
  sharedProgress: number;
  
  // Presence & Active Officers
  activeOfficers: Record<OfficerId, OfficerSessionState>;
  previouslyConnectedOfficers: OfficerId[];
  
  // Shared Evidence & Exploration History
  reviewedEvidenceIds: string[];
  evidenceReviewers: Record<string, OfficerId[]>; // evidenceId -> list of officerIds
  reviewedPeopleIds: string[];
  peopleReviewers: Record<string, OfficerId[]>;
  reviewedTimelineIds: string[];
  reviewedLocationIds: string[];
  
  // Dynamic Shared Discoveries
  discoveredInconsistencyIds: string[];
  discoveries: CaseDiscovery[];
  
  // Shared Team Notes & Personal Notes (keyed by officerId)
  teamNotes: Note[];
  personalNotesByOfficer: Record<OfficerId, Note[]>;
  
  // Shared Activity Stream
  activityLog: ActivityEvent[];
  
  // Verdict State
  officerVerdictDrafts: Record<OfficerId, OfficerVerdictDraft>;
  isVerdictUnderReview: boolean;
  officialVerdictResult: VerdictResult | null;
}

export interface GameProgressState {
  viewedEvidenceIds: string[];
  viewedPeopleIds: string[];
  viewedTimelineIds: string[];
  viewedLocationIds: string[];
  discoveredInconsistencies: string[];
  notes: Note[];
  verdictHistory: VerdictResult[];
  lastActiveTab: DashboardTab;
  hasStartedGame: boolean;
  soundEnabled: boolean;
}
