import { OfficerProfile, OfficerId } from '../types';

export const CASE_ACCESS_CODES = [
  'CBI-ROY-005',
  'ROY-BARI-2026',
  'ROY005',
  'ROY-2026',
  'CBI005',
  'ROY-BARI',
  'FIRE-ROY-BARI',
];

export const VALID_CASE_CODE_HINT = 'CBI-ROY-005';

export const OFFICERS: Record<OfficerId, OfficerProfile> = {
  arjun: {
    id: 'arjun',
    name: 'ACP Arjun Chatterjee',
    rank: 'Assistant Commissioner of Police',
    role: 'Team Lead & Lead Investigator',
    badgeNumber: 'CBI-WB-9041',
    verificationCode: 'ACP-9041',
    avatarInitials: 'AC',
    avatarColor: 'bg-red-500/20 text-red-400 border-red-500/50',
    avatarBorder: 'border-red-500',
    department: 'Special Crimes & High Court Liaison',
    bio: 'Veteran CBI commanding officer supervising the Special Investigation Team. Holds exclusive procedural authorization for filing the official team verdict.',
    isTeamLead: true,
  },
  aditi: {
    id: 'aditi',
    name: 'Inspector Aditi Sharma',
    rank: 'Inspector',
    role: 'Digital and Forensic Investigation',
    badgeNumber: 'CBI-DF-4412',
    verificationCode: 'INSP-4412',
    avatarInitials: 'AS',
    avatarColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    avatarBorder: 'border-cyan-500',
    department: 'Central Cyber & Digital Forensics Wing',
    bio: 'Specialist in mobile telemetry, IoT smart-hub logs, cell-tower metadata, and digital surveillance reconstruction.',
    isTeamLead: false,
  },
  kabir: {
    id: 'kabir',
    name: 'Inspector Kabir Singh',
    rank: 'Inspector',
    role: 'Field Investigation & Interrogations',
    badgeNumber: 'CBI-FI-7823',
    verificationCode: 'INSP-7823',
    avatarInitials: 'KS',
    avatarColor: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    avatarBorder: 'border-amber-500',
    department: 'Crime Scene Reconnaissance & Witness Interrogation',
    bio: 'Specialist in physical perimeter audits, accelerant ignition core mapping, and witness testimony cross-examination.',
    isTeamLead: false,
  },
  riya: {
    id: 'riya',
    name: 'Sub-Inspector Riya Mukherjee',
    rank: 'Sub-Inspector',
    role: 'Records and Case Analysis',
    badgeNumber: 'CBI-RA-3390',
    verificationCode: 'SI-3390',
    avatarInitials: 'RM',
    avatarColor: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    avatarBorder: 'border-purple-500',
    department: 'Financial Intelligence & Historical Archive Analysis',
    bio: 'Specialist in cross-border wire transfers, estate deed registries, and historical timeline discrepancy correlation.',
    isTeamLead: false,
  },
};

export const OFFICER_LIST: OfficerProfile[] = Object.values(OFFICERS);

/**
 * Validates the case access code entered by the user
 */
export function validateCaseAccessCode(input: string): boolean {
  const normalized = input.trim().toUpperCase().replace(/[\s\-_]/g, '');
  return CASE_ACCESS_CODES.some(
    (code) => code.toUpperCase().replace(/[\s\-_]/g, '') === normalized
  );
}

/**
 * Validates an officer's personal verification code.
 * Accepts the formal code (e.g. "ACP-9041") or numeric PIN (e.g. "9041")
 */
export function validateOfficerVerification(officerId: OfficerId, code: string): boolean {
  const officer = OFFICERS[officerId];
  if (!officer) return false;

  const cleanInput = code.trim().toUpperCase().replace(/[\s\-_]/g, '');
  const cleanOfficial = officer.verificationCode.toUpperCase().replace(/[\s\-_]/g, '');
  const numericOnly = officer.verificationCode.replace(/\D/g, '');

  return cleanInput === cleanOfficial || cleanInput === numericOnly || cleanInput === `CBI${numericOnly}`;
}
