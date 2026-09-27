/**
 * KakshaSahay - Multigrade Classroom Orchestration Engine
 * Implements deterministic 3-grade allocation, 1-teacher constraints,
 * 15-minute rotation cycles, and adaptive teacher-override recalculations.
 * Aligned with NIPUN Bharat FLN guidelines for MGML (Multi-Grade Multi-Level) teaching.
 */
'use strict';

const ALLOCATION_MODES = {
  TEACHER_LED: 'teacher-led',
  INDEPENDENT: 'independent',
  PEER: 'peer'
};

const CLASSROOM_STATES = {
  IDLE: 'IDLE',
  PLANNED: 'PLANNED',
  ACTIVE: 'ACTIVE',
  ROTATED: 'ROTATED',
  COMPLETED: 'COMPLETED'
};

const DEFAULT_GRADE_CONFIG = {
  1: {
    grade: 1,
    name: 'Grade 1 (कक्षा 1)',
    standardObjective: 'वर्ण पहचान व 1-9 गिनती (Letter Recognition & Counting 1-9)',
    supervisionNeed: 'high',
    defaultDuration: 15,
    tlm: ['Chalkboard (श्यामपट्ट)', 'Counting Pebbles (कंकड़/बीज)', 'Slates (स्लेट)']
  },
  2: {
    grade: 2,
    name: 'Grade 2 (कक्षा 2)',
    standardObjective: '2-अंकीय जोड़ व बंडल समझ (2-Digit Addition & Base-10 Bundles)',
    supervisionNeed: 'medium',
    defaultDuration: 15,
    tlm: ['Slates (तख्ती/स्लेट)', 'Chalk (खड़िया)', 'Twig Bundles (तीली बंडल)']
  },
  3: {
    grade: 3,
    name: 'Grade 3 (कक्षा 3)',
    standardObjective: 'दैनिक हाट समस्या समाधान (Market Context Word Problems)',
    supervisionNeed: 'medium',
    defaultDuration: 15,
    tlm: ['Pebble currency (कंकड़ सिक्के)', 'Slates', 'Chalkboard Price List']
  }
};

/**
 * Validates classroom configuration input
 * @param {Object} input 
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateClassroomInput(input) {
  const errors = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Input must be a valid configuration object'] };
  }

  // Verify grades
  if (!Array.isArray(input.selectedGrades) || input.selectedGrades.length === 0) {
    errors.push('selectedGrades must be a non-empty array of grade numbers');
  } else {
    for (const g of input.selectedGrades) {
      if (![1, 2, 3].includes(Number(g))) {
        errors.push(`Invalid grade: ${g}. Only Grades 1, 2, and 3 are supported.`);
      }
    }
  }

  // Verify teacher count (must be exactly 1 for single-teacher multigrade classrooms)
  if (input.teacherCount !== undefined && input.teacherCount !== 1) {
    errors.push('teacherCount must be exactly 1 for multigrade classroom orchestration');
  }

  // Verify ability level
  const validLevels = ['beginner', 'developing', 'proficient'];
  if (input.abilityLevel && !validLevels.includes(input.abilityLevel)) {
    errors.push(`Invalid abilityLevel: ${input.abilityLevel}. Expected one of: ${validLevels.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Computes simultaneous 3-grade allocations for a given rotation cycle.
 * INVARIANT: Exactly one grade is assigned to 'teacher-led' at any given moment.
 * 
 * @param {Object} options
 * @param {number} [options.cycle=1] - Rotation cycle number (1, 2, or 3)
 * @param {number[]} [options.grades=[1,2,3]] - Active grades
 * @param {number|null} [options.focusGrade=null] - Explicit focus grade (overrides cycle default)
 * @param {number|null} [options.overrideGrade=null] - Urgent teacher intervention grade
 * @param {string} [options.abilityLevel='beginner'] - TaRL ability micro-group
 * @returns {Object} Structured grade allocation mapping
 */
function computeGradeAllocation({
  cycle = 1,
  grades = [1, 2, 3],
  focusGrade = null,
  overrideGrade = null,
  abilityLevel = 'beginner'
} = {}) {
  const activeGrades = grades.map(Number);
  
  // Determine which grade receives direct teacher instruction
  let teacherGrade;
  if (overrideGrade !== null && activeGrades.includes(Number(overrideGrade))) {
    teacherGrade = Number(overrideGrade);
  } else if (focusGrade !== null && activeGrades.includes(Number(focusGrade))) {
    teacherGrade = Number(focusGrade);
  } else {
    // Normal cycle rotation
    const safeCycle = Math.max(1, Math.min(3, cycle));
    teacherGrade = activeGrades[(safeCycle - 1) % activeGrades.length];
  }

  // Other grades are split between independent and peer
  const otherGrades = activeGrades.filter(g => g !== teacherGrade);
  
  const result = {};

  // Assign Teacher-Led Grade
  result[`grade${teacherGrade}`] = {
    grade: teacherGrade,
    mode: ALLOCATION_MODES.TEACHER_LED,
    status: 'active',
    durationMinutes: 15,
    objective: DEFAULT_GRADE_CONFIG[teacherGrade]?.standardObjective || 'Core Competency',
    materials: DEFAULT_GRADE_CONFIG[teacherGrade]?.tlm || ['Chalkboard', 'Slates'],
    teacherInvolvement: 'Direct interactive instruction, modeling, and individual articulation checks',
    isTeacherFocus: true
  };

  // Assign remaining grades deterministically
  if (otherGrades.length > 0) {
    // The lowest remaining grade gets Independent, higher gets Peer (or vice-versa)
    const independentGrade = otherGrades[0];
    result[`grade${independentGrade}`] = {
      grade: independentGrade,
      mode: ALLOCATION_MODES.INDEPENDENT,
      status: 'ready',
      durationMinutes: 15,
      objective: DEFAULT_GRADE_CONFIG[independentGrade]?.standardObjective || 'Independent Practice',
      materials: DEFAULT_GRADE_CONFIG[independentGrade]?.tlm || ['Slates', 'Chalk'],
      teacherInvolvement: 'Minimal supervision; student self-checks work against chalkboard models',
      isTeacherFocus: false
    };
  }

  if (otherGrades.length > 1) {
    const peerGrade = otherGrades[1];
    result[`grade${peerGrade}`] = {
      grade: peerGrade,
      mode: ALLOCATION_MODES.PEER,
      status: 'ready',
      durationMinutes: 15,
      objective: DEFAULT_GRADE_CONFIG[peerGrade]?.standardObjective || 'Peer Collaborative Practice',
      materials: DEFAULT_GRADE_CONFIG[peerGrade]?.tlm || ['Pebbles', 'Slates'],
      teacherInvolvement: 'Zero direct teacher intervention; peer dyads validate partner calculations',
      isTeacherFocus: false
    };
  }

  return {
    cycle,
    teacherGrade,
    abilityLevel,
    isOverridden: overrideGrade !== null,
    allocations: result
  };
}

/**
 * Adaptive Recalculation: Allows teacher to flag a grade needing immediate support
 * and deterministically shifts the rotation schedule while preserving multigrade flow.
 * 
 * @param {Object} options
 * @param {Object} options.currentState - Current classroom state
 * @param {number} options.overrideGrade - Grade requiring direct intervention (1, 2, or 3)
 * @param {string} [options.reason='Teacher identified foundational concept struggle']
 * @returns {Object} Updated classroom state with recalculation audit trail
 */
function recalculateAllocation({ currentState = {}, overrideGrade, reason = 'Teacher identified foundational concept struggle' }) {
  const gradeNum = Number(overrideGrade);
  if (![1, 2, 3].includes(gradeNum)) {
    throw new Error(`Invalid override grade: ${overrideGrade}. Must be 1, 2, or 3.`);
  }

  const selectedGrades = currentState.selectedGrades || [1, 2, 3];
  const abilityLevel = currentState.abilityLevel || 'beginner';
  const currentCycle = currentState.currentRotation || 1;

  const allocationResult = computeGradeAllocation({
    cycle: currentCycle,
    grades: selectedGrades,
    overrideGrade: gradeNum,
    abilityLevel
  });

  const rationaleText = `Rotation changed because Grade ${gradeNum} was marked as requiring additional teacher support. (${reason})`;

  return {
    ...currentState,
    currentGradeFocus: gradeNum,
    isAdaptiveOverride: true,
    overrideGrade: gradeNum,
    overrideReason: reason,
    overrideTimestamp: Date.now(),
    explanationRationale: rationaleText,
    grades: allocationResult.allocations,
    auditTrail: [
      ...(currentState.auditTrail || []),
      {
        timestamp: new Date().toISOString(),
        action: 'TEACHER_ADAPTIVE_OVERRIDE',
        grade: gradeNum,
        reason,
        cycle: currentCycle
      }
    ]
  };
}

/**
 * Generates a full 3-cycle rotation plan for a 45-minute multigrade block
 * @param {Object} input - Validated classroom configuration
 * @returns {Object} Full rotation plan
 */
function generateRotationPlan(input = {}) {
  const validation = validateClassroomInput(input);
  if (!validation.valid) {
    throw new Error(`Invalid classroom input: ${validation.errors.join('; ')}`);
  }

  const grades = input.selectedGrades || [1, 2, 3];
  const abilityLevel = input.abilityLevel || 'beginner';

  const cycles = [1, 2, 3].map(cycle => {
    return computeGradeAllocation({
      cycle,
      grades,
      abilityLevel
    });
  });

  return {
    totalDurationMinutes: 45,
    cycleDurationMinutes: 15,
    abilityLevel,
    plannedGrades: grades,
    cycles,
    generatedAt: new Date().toISOString(),
    status: CLASSROOM_STATES.PLANNED
  };
}

const OrchestrationEngine = {
  ALLOCATION_MODES,
  CLASSROOM_STATES,
  DEFAULT_GRADE_CONFIG,
  validateClassroomInput,
  computeGradeAllocation,
  recalculateAllocation,
  generateRotationPlan
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OrchestrationEngine;
}
if (typeof window !== 'undefined') {
  window.OrchestrationEngine = OrchestrationEngine;
}
