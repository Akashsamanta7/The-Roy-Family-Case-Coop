import React, { useState, useEffect } from 'react';
import { 
  FolderArchive, 
  Search, 
  FileText, 
  ExternalLink, 
  X, 
  AlertTriangle,
  Clock,
  MapPin,
  Tag,
  Shield,
  FileEdit,
  CheckCircle,
  Eye,
  Users
} from 'lucide-react';
import { EVIDENCE_ITEMS, SUSPECTS } from '../data/caseData';
import { EvidenceCategory, EvidenceItem, OfficerId } from '../types';
import { OFFICERS } from '../data/officers';
import { playSound } from '../utils/sound';

interface EvidenceSectionProps {
  selectedEvidenceCode?: string | null;
  onClearSelectedCode?: () => void;
  onRecordEvidenceViewed: (evidenceId: string, evidenceCode: string, title: string) => void;
  onOpenPerson: (personId: string) => void;
  onQuickAddNote: (title: string, content: string) => void;
  viewedEvidenceIds: string[];
  evidenceReviewers?: Record<string, OfficerId[]>;
  soundEnabled: boolean;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  selectedEvidenceCode,
  onClearSelectedCode,
  onRecordEvidenceViewed,
  onOpenPerson,
  onQuickAddNote,
  viewedEvidenceIds,
  evidenceReviewers = {},
  soundEnabled,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<EvidenceItem | null>(null);

  // If parent requests a specific evidence code to open (e.g. from people or timeline jump)
  useEffect(() => {
    if (selectedEvidenceCode) {
      const match = EVIDENCE_ITEMS.find(
        (e) => e.code === selectedEvidenceCode || e.id === selectedEvidenceCode
      );
      if (match) {
        setActiveEvidenceModal(match);
        onRecordEvidenceViewed(match.id, match.code, match.title);
      }
    }
  }, [selectedEvidenceCode]);

  const categories: string[] = [
    'ALL',
    'Phone Data',
    'Crime Scene Evidence',
    'Autopsy Reports',
    'Digital Forensics',
    'Financial Records',
    'Smart-Home Data',
  ];

  const handleOpenModal = (ev: EvidenceItem) => {
    playSound('open_folder', soundEnabled);
    setActiveEvidenceModal(ev);
    onRecordEvidenceViewed(ev.id, ev.code, ev.title);
  };

  const handleCloseModal = () => {
    setActiveEvidenceModal(null);
    if (onClearSelectedCode) onClearSelectedCode();
  };

  const handlePersonJump = (personId: string) => {
    handleCloseModal();
    playSound('click', soundEnabled);
    onOpenPerson(personId);
  };

  const filteredEvidence = EVIDENCE_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      item.title.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold font-serif text-neutral-100 flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-amber-400" />
            DIGITAL EVIDENCE ARCHIVE
          </h2>
          <p className="text-xs font-mono text-neutral-400">
            {EVIDENCE_ITEMS.length} PHYSICAL & FORENSIC EXHIBITS CATALOGUED // REAL-TIME TEAM DISCOVERY
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence ID, title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playSound('click', soundEnabled);
              setSelectedCategory(cat);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvidence.map((ev) => {
          const isViewed = viewedEvidenceIds.includes(ev.id);
          const isCritical = ev.importance === 'CRITICAL';
          const reviewers = evidenceReviewers[ev.id] || [];

          return (
            <div
              key={ev.id}
              onClick={() => handleOpenModal(ev)}
              className={`group rounded-xl bg-neutral-900/70 border p-5 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-neutral-950/60 cursor-pointer flex flex-col justify-between ${
                isViewed 
                  ? 'border-neutral-800' 
                  : isCritical 
                  ? 'border-amber-500/40 bg-neutral-900/90' 
                  : 'border-neutral-700/60'
              }`}
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-neutral-950 border border-neutral-700 text-amber-400">
                      {ev.code}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                      {ev.category}
                    </span>
                  </div>
                  {isCritical && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/60 text-red-400 border border-red-500/30">
                      CRITICAL
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold font-serif text-neutral-100 group-hover:text-amber-400 transition mb-2">
                  {ev.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed mb-4 font-sans">
                  {ev.summary}
                </p>
              </div>

              {/* Card Footer with Reviewer Avatars */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  {reviewers.length > 0 ? (
                    <div className="flex items-center -space-x-1" title={`Reviewed by: ${reviewers.map(r => OFFICERS[r]?.name || r).join(', ')}`}>
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
                    <span className="text-neutral-500 text-[11px]">Unreviewed</span>
                  )}
                </div>

                <span className="text-amber-400 group-hover:underline flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  Inspect Exhibit
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Classified Evidence Inspector Modal */}
      {activeEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header Bar */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-amber-400 font-mono text-sm font-bold">
                  {activeEvidenceModal.code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-red-400 tracking-wider">
                      {activeEvidenceModal.classificationLevel}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">•</span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      DOC REF: {activeEvidenceModal.sourceDocNumber || 'CBI-EXHIBIT'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-neutral-100">
                    {activeEvidenceModal.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs">
                <div>
                  <span className="text-neutral-500 block">CATEGORY</span>
                  <span className="font-semibold text-neutral-200">{activeEvidenceModal.category}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">DATE & TIME</span>
                  <span className="font-semibold text-neutral-200">
                    {activeEvidenceModal.date} {activeEvidenceModal.time ? `• ${activeEvidenceModal.time}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">LOCATION</span>
                  <span className="font-semibold text-neutral-200 truncate">{activeEvidenceModal.location || 'Roy Bari'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">STATUS</span>
                  <span className="font-semibold text-cyan-400">{activeEvidenceModal.status}</span>
                </div>
              </div>

              {/* Main Summary */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-neutral-200 font-sans leading-relaxed text-sm">
                <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold block mb-1">
                  OFFICIAL SUMMARY:
                </span>
                {activeEvidenceModal.summary}
              </div>

              {/* Detailed Description */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  EVIDENCE DETAILS & TRANSCRIPT
                </h4>
                <div className="space-y-2">
                  {activeEvidenceModal.description.map((paragraph, idx) => (
                    <p key={idx} className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/60 text-neutral-300 text-xs font-mono leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Forensic Notes */}
              {activeEvidenceModal.forensicNotes && activeEvidenceModal.forensicNotes.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    CFSL FORENSIC ANALYSIS
                  </h4>
                  <ul className="space-y-2">
                    {activeEvidenceModal.forensicNotes.map((note, idx) => (
                      <li key={idx} className="p-3 rounded-lg bg-cyan-950/10 border border-cyan-500/20 text-neutral-300 text-xs font-mono flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Associated Suspects */}
              {activeEvidenceModal.relatedPeopleIds.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    LINKED SUSPECTS & WITNESSES
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeEvidenceModal.relatedPeopleIds.map((pId) => {
                      const person = SUSPECTS.find((s) => s.id === pId);
                      if (!person) return null;
                      return (
                        <button
                          key={pId}
                          onClick={() => handlePersonJump(pId)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-xs font-mono text-neutral-200 flex items-center gap-2 transition cursor-pointer"
                        >
                          <span className={`w-2 h-2 rounded-full ${person.avatarStyle.badgeColor}`} />
                          <span>{person.name}</span>
                          <ExternalLink className="w-3 h-3 text-neutral-500" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
              <button
                onClick={() => {
                  playSound('typewriter', soundEnabled);
                  onQuickAddNote(
                    `Note on ${activeEvidenceModal.code} - ${activeEvidenceModal.title}`,
                    `Analyzed ${activeEvidenceModal.code}: ${activeEvidenceModal.summary}`
                  );
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-2 transition cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 text-amber-400" />
                <span>Log to Detective Notes</span>
              </button>

              <button
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold uppercase transition cursor-pointer"
              >
                Close Exhibit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
