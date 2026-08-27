import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Sparkles,
  ArrowRight,
  UserCheck,
  Award,
  HelpCircle
} from 'lucide-react';
import { VerdictResult } from '../types';
import { VERIFIED_CASE_ANALYSIS } from '../data/solution';
import { playSound } from '../utils/sound';

interface EndingModalProps {
  result: VerdictResult;
  onReturnToInvestigation: () => void;
  onRestartCase: () => void;
  soundEnabled: boolean;
}

export const EndingModal: React.FC<EndingModalProps> = ({
  result,
  onReturnToInvestigation,
  onRestartCase,
  soundEnabled,
}) => {
  useEffect(() => {
    if (result.ending === 'A_COMPLETE_TRUTH') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981'],
        });
      } catch {
        // Fallback
      }
    }
  }, [result.ending]);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl my-8 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
        
        {/* ========================================================
            ENDING A: THE COMPLETE TRUTH (CASE SOLVED)
           ======================================================== */}
        {result.ending === 'A_COMPLETE_TRUTH' && (
          <div className="flex flex-col">
            {/* Header Banner */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-950/80 via-neutral-900 to-neutral-950 border-b border-amber-500/40 relative overflow-hidden">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="stamp-gold text-xs">CASE SOLVED</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-neutral-100 mt-1">
                      ENDING A: THE COMPLETE TRUTH
                    </h2>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-neutral-400 block">SCORE</span>
                  <span className="text-2xl font-bold text-amber-400">
                    {result.score}/{result.totalQuestions} ({result.percentage}%)
                  </span>
                </div>
              </div>

              {/* Core 3 Key Findings */}
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-amber-500/30 space-y-2 font-mono text-xs sm:text-sm text-neutral-200">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span><strong>Ritam Roy</strong> physically carried out the fire.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span><strong>Madhurima Roy</strong> orchestrated the larger conspiracy.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span><strong>Yash Roy</strong> was wrongly convicted as the main perpetrator.</span>
                </p>
              </div>
            </div>

            {/* Comprehensive Case Revelation */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[55vh] overflow-y-auto text-xs sm:text-sm text-neutral-300">
              <h3 className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                COMPLETE FORENSIC RECONSTRUCTION
              </h3>

              <div className="space-y-3 font-sans leading-relaxed">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <h4 className="font-mono text-xs font-bold text-red-400 uppercase">
                    01. The Arson & The 03:50 AM Departure
                  </h4>
                  <p className="text-neutral-300 text-xs">
                    {VERIFIED_CASE_ANALYSIS.perpetratorSummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <h4 className="font-mono text-xs font-bold text-purple-400 uppercase">
                    02. Madhurima&apos;s Offshore Conspiracy & Escape
                  </h4>
                  <p className="text-neutral-300 text-xs">
                    {VERIFIED_CASE_ANALYSIS.conspiracySummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase">
                    03. Yash Roy&apos;s Exoneration
                  </h4>
                  <p className="text-neutral-300 text-xs">
                    {VERIFIED_CASE_ANALYSIS.wrongfulConvictionSummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <h4 className="font-mono text-xs font-bold text-blue-400 uppercase">
                    04. Subhash&apos;s Premeditated Poisoning
                  </h4>
                  <p className="text-neutral-300 text-xs">
                    {VERIFIED_CASE_ANALYSIS.forensicSubhashSummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <h4 className="font-mono text-xs font-bold text-cyan-400 uppercase">
                    05. The Fake Haunting & Power Tampering
                  </h4>
                  <p className="text-neutral-300 text-xs">
                    {VERIFIED_CASE_ANALYSIS.forensicHauntingSummary} {VERIFIED_CASE_ANALYSIS.infrastructureSummary}
                  </p>
                </div>
              </div>

              {/* Verified answers breakdown */}
              <div className="pt-4 border-t border-neutral-800">
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-bold mb-3">
                  EVALUATION BREAKDOWN
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {result.questionFeedback.map((fb) => (
                    <div key={fb.questionId} className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 flex items-start justify-between gap-3">
                      <div>
                        <span className="text-neutral-400 font-semibold block">Q{fb.questionNumber}: {fb.questionText}</span>
                        <span className="text-emerald-400 text-[11px] block mt-0.5">Your answer: {fb.userAnswer} ✓</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <button
                onClick={onRestartCase}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Investigation</span>
              </button>
              <button
                onClick={onReturnToInvestigation}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono uppercase cursor-pointer"
              >
                Review Case Files
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            ENDING B: PARTIAL TRUTH
           ======================================================== */}
        {result.ending === 'B_PARTIAL_TRUTH' && (
          <div className="flex flex-col">
            <div className="p-6 sm:p-8 bg-neutral-950 border-b border-amber-500/30">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                      INCOMPLETE DEDUCTION
                    </span>
                    <h2 className="text-2xl font-bold font-serif text-neutral-100 mt-1">
                      ENDING B: PARTIAL TRUTH
                    </h2>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-neutral-400 block">SCORE</span>
                  <span className="text-xl font-bold text-amber-400">
                    {result.score}/{result.totalQuestions} ({result.percentage}%)
                  </span>
                </div>
              </div>

              <p className="text-xs font-mono text-neutral-300 leading-relaxed">
                &ldquo;Your investigation uncovered important parts of the truth. But the full conspiracy remains incomplete.&rdquo;
              </p>
            </div>

            {/* Feedback & General Hints */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[55vh] overflow-y-auto text-xs">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-bold mb-3">
                  YOUR VERDICT BREAKDOWN
                </h3>
                <div className="space-y-2">
                  {result.questionFeedback.map((fb) => (
                    <div
                      key={fb.questionId}
                      className={`p-3 rounded-xl border font-mono ${
                        fb.isCorrect 
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-neutral-200' 
                          : 'bg-red-950/20 border-red-500/40 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold">Q{fb.questionNumber}: {fb.questionText}</span>
                        {fb.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        <span>Your answer: <strong className={fb.isCorrect ? 'text-emerald-300' : 'text-red-300'}>{fb.userAnswer || 'No answer'}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Investigation Hints */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="font-mono text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  INVESTIGATIVE HINTS:
                </h4>
                <ul className="space-y-1.5 text-neutral-400 font-mono text-[11px]">
                  <li>• Cross-examine the exact departure timestamp of mobile devices against thermal fire ignition.</li>
                  <li>• Inspect the autopsy report of Subhash to determine how he was incapacitated before the blaze.</li>
                  <li>• Audit the offshore financial wire and its connection to the staged paranormal activity.</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end">
              <button
                onClick={onReturnToInvestigation}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono uppercase flex items-center gap-2 cursor-pointer"
              >
                <span>RETURN TO INVESTIGATION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            ENDING C: VERDICT REJECTED
           ======================================================== */}
        {result.ending === 'C_VERDICT_REJECTED' && (
          <div className="flex flex-col">
            <div className="p-6 sm:p-8 bg-neutral-950 border-b border-red-500/40">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-400">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                      HIGH COURT REJECTION
                    </span>
                    <h2 className="text-2xl font-bold font-serif text-neutral-100 mt-1">
                      ENDING C: VERDICT REJECTED
                    </h2>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-neutral-400 block">SCORE</span>
                  <span className="text-xl font-bold text-red-400">
                    {result.score}/{result.totalQuestions} ({result.percentage}%)
                  </span>
                </div>
              </div>

              <p className="text-xs font-mono text-neutral-300 leading-relaxed">
                &ldquo;The evidence does not support your verdict.&rdquo;
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-4 text-xs font-mono text-neutral-400 leading-relaxed">
              <p>
                The Special Commission cannot accept your conclusions. Several critical timeline discrepancies, forensic toxicology results, or digital automation logs contradict your filed findings.
              </p>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
                <span className="text-amber-400 font-bold block mb-1">RECOMMENDED ACTIONS:</span>
                <p className="text-[11px] leading-relaxed">
                  Carefully re-read Evidence Files E001 through E007, study the People dossiers, and inspect the chronological timeline sequence before attempting another verdict.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end">
              <button
                onClick={onReturnToInvestigation}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono uppercase flex items-center gap-2 cursor-pointer"
              >
                <span>RETURN TO INVESTIGATION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
