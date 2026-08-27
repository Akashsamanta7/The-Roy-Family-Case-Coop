import { VerdictSubmission, VerdictResult, EndingType, OfficerId } from '../types';

/**
 * HIDDEN INTERNAL SOLUTION DATA
 * This file contains the verified ground truth used exclusively for
 * verdict validation and ending computation. Never expose this data
 * directly during standard investigation gameplay.
 */
export const INTERNAL_VERIFIED_SOLUTION = {
  q1_physical_perpetrator: 'Ritam Roy',
  q2_conspiracy_mastermind: 'Madhurima Roy',
  q3_ritam_contradiction: 'Phone GPS data',
  q4_subhash_incapacitation: 'No smoke in his lungs',
  q5_haunting_explanation: 'Smart-home manipulation',
  q6_pre_fire_event: 'Power was cut',
  q7_wrongly_convicted: 'Yash Roy',
} as const;

export const VERIFIED_CASE_ANALYSIS = {
  perpetratorSummary: 
    "Ritam Roy physically poured the accelerant across three designated structural points and padlocked the main gate from the exterior. His mobile GPS telemetry conclusively logged his exit at 03:50 AM—eight full minutes before the 03:58 AM ignition—shattering his sworn statement that he fled upon detecting smoke.",
  
  conspiracySummary:
    "Madhurima Roy orchestrated the broader conspiracy and insurance/inheritance scheme. Two weeks prior, an offshore financial conduit wired ₹2,00,00,000 (₹2 Crore) to Ritam Roy. Madhurima faked paranormal phenomena to terrorize the estate, staged her own death, and fled the jurisdiction under an alias.",
  
  wrongfulConvictionSummary:
    "Yash Roy had departed the estate at 03:40 AM following an inheritance dispute and passed the Vidyasagar Setu toll gate at 04:02 AM. He was wrongfully framed as a convenient scapegoat by the original rushed investigation.",
  
  forensicSubhashSummary:
    "Caretaker Subhash sustained zero smoke inhalation (carboxyhemoglobin < 1.5%) and was heavily sedated with Diazepam prior to the blaze, rendering him incapable of sounding the alarm or opening the locked main gates.",
  
  forensicHauntingSummary:
    "The estate's alleged supernatural activity was an artificial setup consisting of automated smart-home scripts, timed lighting fluctuations, and concealed Bluetooth acoustic transducers in crawlspaces.",

  infrastructureSummary:
    "The estate's primary grid feed was deliberately severed at 03:55 AM (three minutes prior to fire start) and the main gates chained shut from outside, while the rear service corridor remained clear for the perpetrator's escape."
};

export const QUESTION_DEFINITIONS = [
  {
    id: 'q1_physical_perpetrator',
    number: 1,
    questionText: 'Who physically carried out the fire at Roy Bari Estate?',
    options: ['Yash Roy', 'Ritam Roy', 'Madhurima Roy', 'Unknown'],
    correctAnswer: 'Ritam Roy',
    explanation:
      'Digital forensics, mobile cell tower triangulation, and gate inspection prove Ritam Roy set the accelerant, secured the gate from outside, and departed at 03:50 AM.',
  },
  {
    id: 'q2_conspiracy_mastermind',
    number: 2,
    questionText: 'Who was responsible for the larger conspiracy and orchestration?',
    options: ['Yash Roy', 'Ritam Roy', 'Madhurima Roy', 'Unknown'],
    correctAnswer: 'Madhurima Roy',
    explanation:
      'Madhurima Roy funded the operation via a ₹2 Crore offshore transfer, rigged the fake smart-home hauntings, and staged her demise to abscond.',
  },
  {
    id: 'q3_ritam_contradiction',
    number: 3,
    questionText: "What evidence directly contradicts Ritam's account of escaping after smelling smoke?",
    options: ['Phone GPS data', 'Bank records', 'Autopsy findings', 'Smart-home records'],
    correctAnswer: 'Phone GPS data',
    explanation:
      'Ritam claimed he fled the house upon noticing smoke; however, his mobile GPS logs him leaving Roy Bari at 03:50 AM—eight minutes before the 03:58 AM fire began.',
  },
  {
    id: 'q4_subhash_incapacitation',
    number: 4,
    questionText: 'What evidence demonstrates that Caretaker Subhash was incapacitated before the fire started?',
    options: ['No smoke in his lungs', 'GPS data', 'Power failure', 'Gate damage'],
    correctAnswer: 'No smoke in his lungs',
    explanation:
      'The autopsy report E003 confirmed almost zero smoke in Subhash\'s lungs and toxic levels of diazepam sedatives, proving he was incapacitated before ignition.',
  },
  {
    id: 'q5_haunting_explanation',
    number: 5,
    questionText: 'What was the true explanation for the apparent haunting and paranormal phenomena?',
    options: ['Real paranormal activity', 'Smart-home manipulation', 'Electrical failure', 'Unknown'],
    correctAnswer: 'Smart-home manipulation',
    explanation:
      'CBI forensic recovered smart-hub automation logs, scheduled lighting routines, and concealed Bluetooth transducers engineered to simulate supernatural events.',
  },
  {
    id: 'q6_pre_fire_event',
    number: 6,
    questionText: 'What critical infrastructure event occurred at 03:55 AM before the fire started?',
    options: ['Power was cut', 'Police arrived', 'The gate opened', 'Fire alarms were triggered'],
    correctAnswer: 'Power was cut',
    explanation:
      'Power system logs E004 show estate electrical power was manually severed at 03:55 AM, exactly three minutes prior to the 03:58 AM fire ignition.',
  },
  {
    id: 'q7_wrongly_convicted',
    number: 7,
    questionText: 'Who was wrongly convicted as the main perpetrator and sentenced to death?',
    options: ['Yash Roy', 'Ritam Roy', 'Madhurima Roy', 'Unknown'],
    correctAnswer: 'Yash Roy',
    explanation:
      'Yash Roy was sentenced to death in the original flawed trial despite toll records and digital timeline proving his innocence.',
  },
];

/**
 * Validates player submission against internal ground truth
 */
export function validateVerdictSubmission(
  submission: VerdictSubmission,
  submittedByOfficerId: OfficerId = 'arjun',
  submittedByOfficerName: string = 'ACP Arjun Chatterjee'
): VerdictResult {
  let score = 0;
  const totalQuestions = QUESTION_DEFINITIONS.length;

  const questionFeedback = QUESTION_DEFINITIONS.map((q) => {
    const userAnswer = submission[q.id as keyof VerdictSubmission] || '';
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) {
      score += 1;
    }
    return {
      questionId: q.id,
      questionNumber: q.number,
      questionText: q.questionText,
      userAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const percentage = Math.round((score / totalQuestions) * 100);

  let ending: EndingType;
  if (score >= 6) {
    // 6 or 7 out of 7 -> Ending A
    ending = 'A_COMPLETE_TRUTH';
  } else if (score >= 4) {
    // 4 or 5 out of 7 -> Ending B
    ending = 'B_PARTIAL_TRUTH';
  } else {
    // 0 to 3 out of 7 -> Ending C
    ending = 'C_VERDICT_REJECTED';
  }

  return {
    score,
    totalQuestions,
    percentage,
    ending,
    questionFeedback,
    verdictDate: new Date().toISOString(),
    submittedByOfficerId,
    submittedByOfficerName,
  };
}
