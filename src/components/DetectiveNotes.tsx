import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Tag, 
  Clock, 
  CheckSquare, 
  HelpCircle, 
  AlertOctagon, 
  Compass,
  FileText,
  Users,
  User,
  Shield,
  Lock,
  Globe
} from 'lucide-react';
import { Note, NoteCategory, OfficerProfile, OfficerId } from '../types';
import { playSound } from '../utils/sound';

interface DetectiveNotesProps {
  currentOfficer?: OfficerProfile;
  teamNotes: Note[];
  personalNotes: Note[];
  onAddNote: (
    note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'authorOfficerId' | 'authorOfficerName'>,
    isTeamNote: boolean
  ) => void;
  onUpdateNote: (id: string, updated: Partial<Note>, isTeamNote: boolean) => void;
  onDeleteNote: (id: string, isTeamNote: boolean) => void;
  soundEnabled: boolean;
}

export const DetectiveNotes: React.FC<DetectiveNotesProps> = ({
  currentOfficer,
  teamNotes,
  personalNotes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  soundEnabled,
}) => {
  const [scopeTab, setScopeTab] = useState<'TEAM' | 'PERSONAL'>('TEAM');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<NoteCategory>('THEORY');
  const [formIsTeam, setFormIsTeam] = useState<boolean>(scopeTab === 'TEAM');

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'ALL ENTRIES', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'FACT', label: 'FACTS', icon: <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'QUESTION', label: 'QUESTIONS', icon: <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'SUSPICION', label: 'SUSPICIONS', icon: <AlertOctagon className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'THEORY', label: 'THEORIES', icon: <Compass className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  const handleStartCreate = (isTeam: boolean) => {
    playSound('typewriter', soundEnabled);
    setFormTitle('');
    setFormContent('');
    setFormCategory('THEORY');
    setFormIsTeam(isTeam);
    setEditingNote(null);
    setIsCreating(true);
  };

  const handleStartEdit = (note: Note) => {
    playSound('typewriter', soundEnabled);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setFormIsTeam(note.isTeamNote);
    setEditingNote(note);
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    playSound('evidence_stamp', soundEnabled);

    if (editingNote) {
      onUpdateNote(
        editingNote.id,
        {
          title: formTitle.trim(),
          content: formContent.trim(),
          category: formCategory,
        },
        editingNote.isTeamNote
      );
    } else {
      onAddNote(
        {
          title: formTitle.trim(),
          content: formContent.trim(),
          category: formCategory,
          isTeamNote: formIsTeam,
        },
        formIsTeam
      );
    }

    setIsCreating(false);
    setEditingNote(null);
  };

  const handleDelete = (note: Note) => {
    playSound('click', soundEnabled);
    if (confirm(`Are you sure you want to discard this ${note.isTeamNote ? 'team' : 'personal'} note?`)) {
      onDeleteNote(note.id, note.isTeamNote);
    }
  };

  const getCategoryBadge = (cat: NoteCategory) => {
    switch (cat) {
      case 'FACT':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
      case 'QUESTION':
        return 'bg-blue-950/60 text-blue-400 border-blue-500/40';
      case 'SUSPICION':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/40';
      case 'THEORY':
        return 'bg-purple-950/60 text-purple-400 border-purple-500/40';
    }
  };

  const activeNotesList = scopeTab === 'TEAM' ? teamNotes : personalNotes;
  const filteredNotes = activeNotesList.filter((n) => {
    if (activeCategory === 'ALL') return true;
    return n.category === activeCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Journal Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold font-serif text-neutral-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            INVESTIGATION CASE NOTES & JOURNAL
          </h2>
          <p className="text-xs font-mono text-neutral-400">
            {teamNotes.length} TEAM NOTES SHARED // {personalNotes.length} PERSONAL DEDUCTIONS FOR {currentOfficer?.name?.toUpperCase() || 'OFFICER'}
          </p>
        </div>

        <button
          id="btn-new-note"
          onClick={() => handleStartCreate(scopeTab === 'TEAM')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono uppercase tracking-wider transition shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{scopeTab === 'TEAM' ? 'NEW TEAM NOTE' : 'NEW PERSONAL NOTE'}</span>
        </button>
      </div>

      {/* Primary Scope Tabs: TEAM NOTES vs PERSONAL NOTES */}
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
        <button
          id="tab-scope-team"
          onClick={() => {
            playSound('click', soundEnabled);
            setScopeTab('TEAM');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer border ${
            scopeTab === 'TEAM'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border-neutral-800 hover:bg-neutral-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>TEAM NOTES ({teamNotes.length})</span>
        </button>

        <button
          id="tab-scope-personal"
          onClick={() => {
            playSound('click', soundEnabled);
            setScopeTab('PERSONAL');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer border ${
            scopeTab === 'PERSONAL'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border-neutral-800 hover:bg-neutral-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>PERSONAL NOTES ({personalNotes.length})</span>
        </button>
      </div>

      {/* Scope Explanation Banner */}
      <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs font-mono">
        {scopeTab === 'TEAM' ? (
          <div className="flex items-center gap-2 text-neutral-300">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-400">TEAM NOTES:</strong> Visible to all officers in this room in real time. Officers can edit/delete their own notes.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-neutral-300">
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-cyan-400">PERSONAL NOTES:</strong> Encrypted and private to <strong className="text-neutral-100">{currentOfficer?.name}</strong>. Persisted to your officer identity.
            </span>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveCategory(cat.id);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider whitespace-nowrap transition cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-neutral-200 text-neutral-950 font-bold'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Note Creation / Editing Modal Form */}
      {isCreating && (
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-neutral-900 border border-amber-500/40 shadow-2xl space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-mono uppercase font-bold text-amber-400 flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              {editingNote ? 'EDIT NOTE ENTRY' : formIsTeam ? 'NEW TEAM NOTE (SHARED)' : 'NEW PERSONAL NOTE (CONFIDENTIAL)'}
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                Note Heading / Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Discrepancy between phone tower logs and fire origin..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as NoteCategory)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value="FACT">FACT (Verified Evidence)</option>
                <option value="QUESTION">QUESTION (Unanswered Gap)</option>
                <option value="SUSPICION">SUSPICION (Possible Foul Play)</option>
                <option value="THEORY">THEORY (Working Hypothesis)</option>
              </select>
            </div>
          </div>

          {!editingNote && (
            <div className="flex items-center gap-4 pt-1 font-mono text-xs">
              <label className="text-neutral-400 uppercase">Publish as:</label>
              <label className="flex items-center gap-1.5 text-amber-400 font-bold cursor-pointer">
                <input
                  type="radio"
                  name="noteScope"
                  checked={formIsTeam}
                  onChange={() => setFormIsTeam(true)}
                  className="accent-amber-400"
                />
                <span>Team Note (Shared with Room)</span>
              </label>
              <label className="flex items-center gap-1.5 text-cyan-400 font-bold cursor-pointer">
                <input
                  type="radio"
                  name="noteScope"
                  checked={!formIsTeam}
                  onChange={() => setFormIsTeam(false)}
                  className="accent-cyan-400"
                />
                <span>Personal Note (Private to You)</span>
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
              Case Deduction / Analysis
            </label>
            <textarea
              required
              rows={4}
              placeholder="Record your findings, contradictory timestamps, or hypotheses..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingNote ? 'UPDATE ENTRY' : 'SAVE ENTRY'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-neutral-600" />
            <p className="font-mono text-sm text-neutral-400 uppercase tracking-wider">
              No {scopeTab.toLowerCase()} notes in this category
            </p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              {scopeTab === 'TEAM'
                ? 'Create team notes to collaborate with other officers on working hypotheses and timeline contradictions.'
                : 'Log personal theories or evidence notes private to your officer identity.'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isAuthor = currentOfficer ? note.authorOfficerId === currentOfficer.id : true;
            const canEditOrDelete = isAuthor;

            return (
              <div
                key={note.id}
                className={`p-5 rounded-xl bg-neutral-900/80 border transition flex flex-col justify-between space-y-4 ${
                  note.isTeamNote ? 'border-neutral-800 hover:border-amber-500/30' : 'border-neutral-800 hover:border-cyan-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getCategoryBadge(note.category)}`}>
                        {note.category}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">
                        {note.isTeamNote ? 'TEAM NOTE' : 'PERSONAL'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-serif text-neutral-100 mb-1.5">
                    {note.title}
                  </h3>
                  <p className="text-xs text-neutral-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>

                {/* Note Footer with Author and Actions */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{note.authorOfficerName || 'Officer'}</span>
                  </div>

                  {canEditOrDelete && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 border border-neutral-800 transition cursor-pointer"
                        title="Edit Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note)}
                        className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 border border-neutral-800 transition cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
