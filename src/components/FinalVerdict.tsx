import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Send, 
  RotateCcw,
  AlertTriangle,
  FileCheck,
  Crown,
  Users,
  Share2,
  Lock,
  Radio
} from 'lucide-react';
import { QUESTION_DEFINITIONS } from '../data/solution';
import { VerdictSubmission, VerdictResult, OfficerProfile, OfficerId, OfficerVerdictDraft } from '../types';
import { playSound } from '../utils/sound';
import { OFFICERS } from '../data/officers';

interface FinalVerdictProps {
  currentOfficer?: OfficerProfile;
  officerVerdictDrafts?: Record<OfficerId, OfficerVerdictDraft>;
  onUpdateDraft?: (answers: Partial<VerdictSubmission>, isReady: boolean) => void;
  onSubmitVerdict: (submission: VerdictSubmission) => void;
  onNotifyVerdictOpened?: () => void;
  soundEnabled: boolean;
}

export const FinalVerdict: React.FC<FinalVerdictProps> = ({ 
  currentOfficer,
  officerVerdictDrafts = {} as Record<OfficerId, OfficerVerdictDraft>,
  onUpdateDraft,
  onSubmitVerdict,
  onNotifyVerdictOpened,
  soundEnabled 
}) => {
  const isTeamLead = currentOfficer?.isTeamLead ?? true;
  const initialAnswers = (currentOfficer && officerVerdictDrafts[currentOfficer.id]?.answers) || {};
  
  const [answers, setAnswers] = useState<Partial<VerdictSubmission>>(initialAnswers);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);

  // Notify team that this officer is reviewing verdict
  useEffect(() => {
    if (onNotifyVerdictOpened) {
      onNotifyVerdictOpened();
    }
  }, [onNotifyVerdictOpened]);

  const handleSelectOption = (questionId: string, option: string) => {
    playSound('click', soundEnabled);
    const updated = {
      ...answers,
      [questionId]: option,
    };
    setAnswers(updated);
    setErrorMsg(null);
    setShareSuccessMsg(null);

    // Save draft in background
    if (onUpdateDraft) {
      onUpdateDraft(updated, false);
    }
  };

  const answeredCount = Object.keys(answers).filter(
    (k) => !!answers[k as keyof VerdictSubmission]
  ).length;
  const isComplete = answeredCount === QUESTION_DEFINITIONS.length;

  const handleShareDraftWithTeam = () => {
    playSound('evidence_stamp', soundEnabled);
    if (onUpdateDraft) {
      onUpdateDraft(answers, isComplete);
    }
    setShareSuccessMsg('Drafted findings shared with ACP Arjun Chatterjee and the SIT.');
    setTimeout(() => setShareSuccessMsg(null), 4000);
  };

  const handleReviewSubmission = () => {
    if (!isTeamLead) {
      setErrorMsg(
        'OFFICIAL SUBMISSION RESTRICTED — Only ACP Arjun Chatterjee (Team Lead) can submit the official team verdict. Share your proposed answers with the Team Lead for final filing.'
      );
      playSound('denied', soundEnabled);
      return;
    }

    if (!isComplete) {
      setErrorMsg(`Please answer all 7 questions before submitting the official verdict. (${answeredCount}/7 answered)`);
      playSound('denied', soundEnabled);
      return;
    }

    playSound('evidence_stamp', soundEnabled);
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    setShowConfirmModal(false);
    const submission = answers as VerdictSubmission;
    onSubmitVerdict(submission);
  };

  const handleResetForm = () => {
    if (confirm('Clear all selected answers and reset verdict form?')) {
      playSound('click', soundEnabled);
      setAnswers({});
      setErrorMsg(null);
      if (onUpdateDraft) {
        onUpdateDraft({}, false);
      }
    }
  };

  // Check how many other officers have drafted
  const otherOfficersDrafting = Object.entries(officerVerdictDrafts).filter(
    ([id, draft]) => id !== currentOfficer?.id && Object.keys(draft.answers || {}).length > 0
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
            <Gavel className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-red-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>HIGH COURT SPECIAL INQUIRY COMMISSION // COOPERATIVE VERDICT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-100 flex items-center gap-2.5">
              <span>Final Case Evaluation & Indictment</span>
              {isTeamLead && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  TEAM LEAD AUTHORIZATION
                </span>
              )}
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              Collaborate with your fellow officers to establish the complete truth behind the fire, murder of Subhash Das, offshore conspiracy, and staged paranormal cover-ups.
            </p>
          </div>
        </div>

        {/* Team Discussion & Drafting Status */}
        {otherOfficersDrafting.length > 0 && (
          <div className="mt-5 p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-neutral-300">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>TEAM ACTIVITY:</strong> {otherOfficersDrafting.length} other officer(s) drafting responses.
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {otherOfficersDrafting.map(([id, d]) => {
                const off = OFFICERS[id as OfficerId];
                return (
                  <span
                    key={id}
                    className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-amber-400 font-mono"
                    title={`${off?.name}: ${Object.keys(d.answers).length}/7 answered`}
                  >
                    {off?.name?.split(' ')[0]}: {Object.keys(d.answers).length}/7
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress of questions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between font-mono text-xs">
          <span className="text-neutral-400">
            YOUR DRAFT: <strong className="text-amber-400">{answeredCount} of {QUESTION_DEFINITIONS.length}</strong> questions answered
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShareDraftWithTeam}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
              title="Share your drafted answers with your team"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Draft with Team</span>
            </button>
            <button
              onClick={handleResetForm}
              className="text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Selections</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {shareSuccessMsg && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{shareSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2 animate-shake">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {QUESTION_DEFINITIONS.map((q) => {
          const selectedAnswer = answers[q.id as keyof VerdictSubmission];

          return (
            <div
              key={q.id}
              className={`p-6 rounded-2xl border transition-all duration-200 ${
                selectedAnswer
                  ? 'bg-neutral-900/80 border-neutral-700/80 shadow-lg'
                  : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-6 h-6 rounded-full bg-neutral-950 border border-neutral-700 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {q.number}
                </span>
                <h3 className="text-base font-bold font-serif text-neutral-100">
                  {q.questionText}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                {q.options.map((option) => {
                  const isSelected = selectedAnswer === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectOption(q.id, option)}
                      className={`p-3.5 rounded-xl border text-left font-mono text-xs transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10 font-bold'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-400 bg-amber-400' : 'border-neutral-700'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-neutral-950" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Action Bar */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase text-neutral-400 block">
            {isTeamLead ? 'TEAM LEAD FILING STATUS' : 'OFFICER DRAFT STATUS'}
          </span>
          <span className="text-sm font-bold text-neutral-200">
            {isComplete
              ? isTeamLead
                ? 'All questions answered — Ready for official submission'
                : 'All questions drafted — Share your findings with ACP Arjun Chatterjee'
              : `${QUESTION_DEFINITIONS.length - answeredCount} questions remaining`}
          </span>
        </div>

        {isTeamLead ? (
          <button
            id="btn-submit-verdict"
            onClick={handleReviewSubmission}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl cursor-pointer ${
              isComplete
                ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>SUBMIT OFFICIAL TEAM VERDICT</span>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareDraftWithTeam}
              className="px-6 py-3.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold font-mono text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Share2 className="w-4 h-4" />
              <span>SHARE WITH TEAM LEAD</span>
            </button>
            <button
              onClick={handleReviewSubmission}
              className="px-6 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-400 font-bold font-mono text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition border border-neutral-700"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>SUBMISSION RESTRICTED</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
                <Gavel className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-neutral-100">
                  Confirm Official Team Verdict
                </h3>
                <p className="text-xs font-mono text-neutral-400">
                  FILED BY: ACP ARJUN CHATTERJEE (TEAM LEAD)
                </p>
              </div>
            </div>

            <p className="text-xs font-mono text-neutral-300 leading-relaxed">
              You are about to file the definitive investigative report for your Special Investigation Team. The conclusions will be submitted for High Court scrutiny, and all connected officers will simultaneously view the case outcome.
            </p>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Total Questions Answered:</span>
                <span className="font-bold text-neutral-200">7 / 7</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Procedural Authorization:</span>
                <span className="font-bold text-amber-400">CBI Special Team Lead</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono cursor-pointer"
              >
                Review Answers
              </button>
              <button
                id="btn-confirm-submit"
                onClick={handleFinalSubmit}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
