/**
 * KakshaSahay - Explainable Multigrade Pedagogical Explanation Engine
 * Generates transparent, rule-driven pedagogical rationales for 1-teacher allocations.
 * Explicitly rejects opaque AI buzzwords in favor of inspectable FLN / TaRL rules.
 */
'use strict';

const PEDAGOGICAL_RATIONALES = {
  teacherLed: {
    1: [
      'Grade 1 introduces foundational grapheme-phoneme correspondences requiring real-time teacher modeling and immediate acoustic correction.',
      'Younger learners have not yet developed independent self-regulation routines, necessitating teacher-guided concrete manipulative activities.',
      'Oral language vocabulary acquisition requires active teacher questioning and choral repetition.'
    ],
    2: [
      'Grade 2 concepts bridge concrete arithmetic to abstract place-value representation, requiring teacher demonstration of base-10 bundle decomposition.',
      'Direct instruction is needed to ensure students transition smoothly from counting-all to counting-on strategies.',
      'Teacher introduces expanded notation before allowing independent slate drill.'
    ],
    3: [
      'Grade 3 word problems require mathematical comprehension and multi-step reasoning, where teacher modeling prevents conceptual misconceptions.',
      'Direct instruction guides students to extract mathematical operations from contextual village market narratives.',
      'Teacher demonstrates calculation validation strategies on the chalkboard.'
    ]
  },
  independent: {
    1: [
      'Grade 1 students practice tactile letter tracing and repetitive numeral formation on slates without requiring constant interruption.',
      'Consolidates tactile motor patterns established during previous direct teacher modeling.',
      'Zero-cost pebbles allow self-paced counting verification against chalkboard models.'
    ],
    2: [
      'Grade 2 consolidates 2-digit numeral decomposition through self-paced slate calculations.',
      'Students work with physical twig bundles to verify subtraction borrowing before recording answers.',
      'Promotes self-directed practice and sustained academic focus while teacher attends to another grade.'
    ],
    3: [
      'Grade 3 students apply familiar arithmetic algorithms to slate exercises independently.',
      'Consolidates multiplication as repeated addition using structured tally grids.',
      'Frees teacher attention for younger grades while keeping older students productively engaged.'
    ]
  },
  peer: {
    1: [
      'Grade 1 paired learners practice oral sound repetition and syllable rhyming with shoulder buddies.',
      'Cross-age or dyadic pairing reduces classroom anxiety and encourages verbal participation.'
    ],
    2: [
      'Grade 2 peer dyads exchange slates to check 2-digit addition sums, fostering collaborative accountability.',
      'Peer explanation verbalizes reasoning, which reinforces base-10 understanding.'
    ],
    3: [
      'Grade 3 students engage in structured buyer-seller roleplay using pebble currency to solve arithmetic problems collaboratively.',
      'Front-row dyadic checking allows immediate peer feedback without teacher bottleneck.',
      'Collaborative problem solving builds social-emotional learning and cooperative academic habits.'
    ]
  }
};

/**
 * Generates explainable rationale for a specific grade allocation
 * @param {Object} params
 * @param {number} params.grade - Grade level (1, 2, or 3)
 * @param {string} params.mode - 'teacher-led' | 'independent' | 'peer'
 * @param {boolean} [params.isOverride=false] - Whether this allocation arose from a teacher override
 * @param {string} [params.overrideReason=''] - Reason supplied for override
 * @returns {string[]} List of 2 to 3 factual pedagogical rationales
 */
function generateGradeRationale({ grade, mode, isOverride = false, overrideReason = '' }) {
  const g = Number(grade);
  const cleanMode = mode === 'teacher-led' ? 'teacherLed' : mode;

  if (isOverride && cleanMode === 'teacherLed') {
    return [
      `Rotation dynamically changed: Grade ${g} was designated by the teacher for immediate direct intervention (${overrideReason || 'identified foundational gap'}).`,
      PEDAGOGICAL_RATIONALES.teacherLed[g]?.[0] || 'Direct instruction addresses critical learning gap.',
      'Other grades have been shifted to self-regulated independent slate work and peer-led review to maintain classroom continuity.'
    ];
  }

  const bank = PEDAGOGICAL_RATIONALES[cleanMode]?.[g] || [
    `Grade ${g} is allocated to ${mode} mode to optimize 1-teacher classroom flow.`
  ];

  return bank.slice(0, 3);
}

/**
 * Generates comprehensive pedagogical explanation for the full classroom state
 * @param {Object} state - Full or partial classroom state
 * @returns {Object} Structured explanation breakdown
 */
function generateClassroomExplanation(state = {}) {
  const teacherGrade = state.currentGradeFocus || state.overrideGrade || 1;
  const isOverride = Boolean(state.isAdaptiveOverride || state.overrideGrade);
  const overrideReason = state.overrideReason || '';

  const rationales = {
    summary: isOverride
      ? `Rotation changed because Grade ${teacherGrade} was marked as requiring additional teacher support.`
      : `Teacher is currently providing direct instruction to Grade ${teacherGrade} while other grades work productively.`,
    gradeRationales: {
      grade1: generateGradeRationale({
        grade: 1,
        mode: state.grades?.grade1?.mode || (teacherGrade === 1 ? 'teacher-led' : 'independent'),
        isOverride: isOverride && teacherGrade === 1,
        overrideReason
      }),
      grade2: generateGradeRationale({
        grade: 2,
        mode: state.grades?.grade2?.mode || (teacherGrade === 2 ? 'teacher-led' : 'independent'),
        isOverride: isOverride && teacherGrade === 2,
        overrideReason
      }),
      grade3: generateGradeRationale({
        grade: 3,
        mode: state.grades?.grade3?.mode || (teacherGrade === 3 ? 'teacher-led' : 'peer'),
        isOverride: isOverride && teacherGrade === 3,
        overrideReason
      })
    },
    flnAlignment: 'All allocations directly fulfill NIPUN Bharat Foundational Literacy and Numeracy (FLN) pedagogical rotation standards.'
  };

  return rationales;
}

const ExplanationEngine = {
  PEDAGOGICAL_RATIONALES,
  generateGradeRationale,
  generateClassroomExplanation
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExplanationEngine;
}
if (typeof window !== 'undefined') {
  window.ExplanationEngine = ExplanationEngine;
}
