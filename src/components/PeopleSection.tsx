import React, { useState } from 'react';
import { 
  User, 
  Search, 
  FolderArchive, 
  Eye, 
  X, 
  ExternalLink,
  Shield,
  MessageSquareQuote,
  Activity,
  Users
} from 'lucide-react';
import { SUSPECTS, EVIDENCE_ITEMS } from '../data/caseData';
import { SuspectPerson, OfficerId } from '../types';
import { OFFICERS } from '../data/officers';
import { playSound } from '../utils/sound';

interface PeopleSectionProps {
  onOpenEvidence: (evidenceCode: string) => void;
  onRecordPersonViewed: (personId: string, name: string) => void;
  viewedPeopleIds: string[];
  peopleReviewers?: Record<string, OfficerId[]>;
  soundEnabled: boolean;
}

export const PeopleSection: React.FC<PeopleSectionProps> = ({
  onOpenEvidence,
  onRecordPersonViewed,
  viewedPeopleIds,
  peopleReviewers = {},
  soundEnabled,
}) => {
  const [selectedPerson, setSelectedPerson] = useState<SuspectPerson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectPerson = (person: SuspectPerson) => {
    playSound('open_folder', soundEnabled);
    setSelectedPerson(person);
    onRecordPersonViewed(person.id, person.name);
  };

  const handleEvidenceClick = (evidenceId: string) => {
    playSound('click', soundEnabled);
    onOpenEvidence(evidenceId);
  };

  const filteredPeople = SUSPECTS.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.role.toLowerCase().includes(query) ||
      p.caseConnection.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold font-serif text-neutral-100 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            PERSONNEL & SUSPECT DOSSIERS
          </h2>
          <p className="text-xs font-mono text-neutral-400">
            {SUSPECTS.length} INDIVIDUALS CATALOGUED // SIT CROSS-EXAMINATION ARCHIVE
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dossier name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Grid of Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPeople.map((person) => {
          const isViewed = viewedPeopleIds.includes(person.id);
          const reviewers = peopleReviewers[person.id] || [];

          return (
            <div
              key={person.id}
              onClick={() => handleSelectPerson(person)}
              className={`group relative rounded-xl bg-neutral-900/70 border p-5 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-neutral-950/60 cursor-pointer flex flex-col justify-between ${
                isViewed ? 'border-neutral-800' : 'border-amber-500/30 bg-neutral-900/90'
              }`}
            >
              <div>
                {/* Top Badge & Status */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border ${person.avatarStyle.badgeColor}`}>
                    {person.avatarStyle.tag}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[140px]">
                    {person.status}
                  </span>
                </div>

                {/* Profile Identity */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-neutral-950 border border-neutral-700 flex items-center justify-center font-mono text-lg font-bold text-neutral-200 shadow-inner">
                    {person.avatarStyle.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-neutral-100 group-hover:text-amber-400 transition">
                      {person.name}
                    </h3>
                    <p className="text-xs font-mono text-neutral-400">{person.role}</p>
                    {person.alias && (
                      <span className="text-[10px] font-mono text-neutral-500 italic">
                        Alias: &ldquo;{person.alias}&rdquo;
                      </span>
                    )}
                  </div>
                </div>

                {/* Connection snippet */}
                <p className="text-xs text-neutral-300 line-clamp-3 mb-4 leading-relaxed font-sans">
                  {person.caseConnection}
                </p>
              </div>

              {/* Card Footer with Reviewer Avatars */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  {reviewers.length > 0 ? (
                    <div className="flex items-center -space-x-1" title={`Examined by: ${reviewers.map(r => OFFICERS[r]?.name || r).join(', ')}`}>
                      {reviewers.map((rId) => {
                        const off = OFFICERS[rId];
                        if (!off) return null;
                        return (
                          <div
                            key={rId}
                            className={`w-5 h-5 rounded-full text-[9px] font-bold font-mono flex items-center justify-center border ${off.avatarColor}`}
                          >
                            {off.avatarInitials}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-neutral-500 flex items-center gap-1">
                      <FolderArchive className="w-3.5 h-3.5 text-neutral-400" />
                      {person.associatedEvidenceIds.length} Linked Files
                    </span>
                  )}
                </div>

                <span className="text-amber-400 group-hover:underline flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  View Dossier
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Detail Modal / Panel */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center font-mono text-xl font-bold text-neutral-200">
                  {selectedPerson.avatarStyle.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-500 uppercase">CLASSIFIED CBI DOSSIER</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${selectedPerson.avatarStyle.badgeColor}`}>
                      {selectedPerson.avatarStyle.tag}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-neutral-100">{selectedPerson.name}</h3>
                  <p className="text-xs font-mono text-neutral-400">{selectedPerson.role}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPerson(null)}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs">
                <div>
                  <span className="text-neutral-500 block">STATUS</span>
                  <span className="font-semibold text-neutral-200">{selectedPerson.status}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">FAMILY RELATIONSHIP</span>
                  <span className="font-semibold text-neutral-200">{selectedPerson.relationship}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">TIMELINE NOTE</span>
                  <span className="font-semibold text-amber-400">{selectedPerson.timelineRole}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">AGE</span>
                  <span className="font-semibold text-neutral-200">{selectedPerson.age || 'N/A'}</span>
                </div>
              </div>

              {/* Case Connection */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  CASE CONNECTION
                </h4>
                <p className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-neutral-300 leading-relaxed font-sans">
                  {selectedPerson.caseConnection}
                </p>
              </div>

              {/* Known Statements */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-amber-400" />
                  RECORDED STATEMENTS & DEPOSITIONS
                </h4>
                <div className="space-y-2">
                  {selectedPerson.knownStatements.map((stmt, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 text-neutral-300 text-xs italic font-sans leading-relaxed">
                      {stmt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Observations */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  OFFICIAL INVESTIGATIVE OBSERVATIONS
                </h4>
                <ul className="space-y-2">
                  {selectedPerson.observations.map((obs, idx) => (
                    <li key={idx} className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/60 text-neutral-300 text-xs font-mono flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Associated Evidence */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-3 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-amber-400" />
                  ASSOCIATED EVIDENCE FILES ({selectedPerson.associatedEvidenceIds.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPerson.associatedEvidenceIds.map((evCode) => {
                    const ev = EVIDENCE_ITEMS.find((item) => item.code === evCode || item.id === evCode);
                    return (
                      <button
                        key={evCode}
                        onClick={() => {
                          setSelectedPerson(null);
                          handleEvidenceClick(evCode);
                        }}
                        className="p-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-left transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="overflow-hidden">
                          <span className="font-mono text-[10px] text-amber-400 font-bold block">{evCode}</span>
                          <span className="text-xs text-neutral-200 truncate block group-hover:text-amber-300">
                            {ev?.title || `Evidence ${evCode}`}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-end">
              <button
                onClick={() => setSelectedPerson(null)}
                className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold uppercase transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
