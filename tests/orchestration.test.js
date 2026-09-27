/**
 * Unit Tests: Modular Orchestration Engine, Explanation Engine & Storage Service
 * Validates deterministic multi-grade allocation, single-teacher constraint,
 * adaptive recalculation on teacher override, and transparent pedagogical rationales.
 */
'use strict';

const storageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] !== undefined ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
    key: (i) => Object.keys(store)[i] || null,
    get length() { return Object.keys(store).length; }
  };
})();
global.localStorage = storageMock;

const OrchestrationEngine = require('../src/core/orchestrationEngine.js');
const ExplanationEngine = require('../src/core/explanationEngine.js');
const StorageService = require('../src/services/storage.js');

describe('OrchestrationEngine Unit Tests', () => {
  describe('Input Validation', () => {
    test('Validates standard 3-grade multigrade configuration', () => {
      const valid = OrchestrationEngine.validateClassroomInput({
        selectedGrades: [1, 2, 3],
        teacherCount: 1,
        abilityLevel: 'beginner'
      });
      expect(valid.valid).toBe(true);
      expect(valid.errors).toHaveLength(0);
    });

    test('Rejects invalid grade outside Grades 1, 2, 3', () => {
      const result = OrchestrationEngine.validateClassroomInput({
        selectedGrades: [1, 4],
        teacherCount: 1
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid grade: 4'))).toBe(true);
    });

    test('Rejects teacherCount greater than 1 for single-teacher multigrade engine', () => {
      const result = OrchestrationEngine.validateClassroomInput({
        selectedGrades: [1, 2, 3],
        teacherCount: 2
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('teacherCount must be exactly 1'))).toBe(true);
    });

    test('Rejects invalid abilityLevel', () => {
      const result = OrchestrationEngine.validateClassroomInput({
        selectedGrades: [1, 2, 3],
        teacherCount: 1,
        abilityLevel: 'expert'
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid abilityLevel'))).toBe(true);
    });
  });

  describe('Deterministic Grade Allocation', () => {
    test('Ensures exactly ONE grade is teacher-led across all cycles', () => {
      for (let cycle = 1; cycle <= 3; cycle++) {
        const allocation = OrchestrationEngine.computeGradeAllocation({
          cycle,
          grades: [1, 2, 3],
          abilityLevel: 'beginner'
        });

        const modes = Object.values(allocation.allocations).map(a => a.mode);
        const teacherLedCount = modes.filter(m => m === 'teacher-led').length;
        expect(teacherLedCount).toBe(1);
      }
    });

    test('Assigns Grade 1 Teacher-Led in Cycle 1', () => {
      const alloc = OrchestrationEngine.computeGradeAllocation({ cycle: 1, grades: [1, 2, 3] });
      expect(alloc.teacherGrade).toBe(1);
      expect(alloc.allocations.grade1.mode).toBe('teacher-led');
      expect(alloc.allocations.grade2.mode).toBe('independent');
      expect(alloc.allocations.grade3.mode).toBe('peer');
    });

    test('Assigns Grade 2 Teacher-Led in Cycle 2', () => {
      const alloc = OrchestrationEngine.computeGradeAllocation({ cycle: 2, grades: [1, 2, 3] });
      expect(alloc.teacherGrade).toBe(2);
      expect(alloc.allocations.grade2.mode).toBe('teacher-led');
    });

    test('Assigns Grade 3 Teacher-Led in Cycle 3', () => {
      const alloc = OrchestrationEngine.computeGradeAllocation({ cycle: 3, grades: [1, 2, 3] });
      expect(alloc.teacherGrade).toBe(3);
      expect(alloc.allocations.grade3.mode).toBe('teacher-led');
    });
  });

  describe('Adaptive Recalculation & Teacher Override', () => {
    test('Recalculates allocation dynamically when teacher flags Grade 2 Needs Support', () => {
      const initial = {
        selectedGrades: [1, 2, 3],
        currentRotation: 1,
        currentGradeFocus: 1,
        abilityLevel: 'beginner'
      };

      const updated = OrchestrationEngine.recalculateAllocation({
        currentState: initial,
        overrideGrade: 2,
        reason: 'Students struggling with 2-digit subtraction borrowing'
      });

      expect(updated.currentGradeFocus).toBe(2);
      expect(updated.isAdaptiveOverride).toBe(true);
      expect(updated.overrideGrade).toBe(2);
      expect(updated.grades.grade2.mode).toBe('teacher-led');
      expect(updated.explanationRationale).toContain('Rotation changed because Grade 2 was marked as requiring additional teacher support.');
      expect(updated.auditTrail).toHaveLength(1);
      expect(updated.auditTrail[0].grade).toBe(2);
    });

    test('Throws error if overrideGrade is invalid', () => {
      expect(() => {
        OrchestrationEngine.recalculateAllocation({
          currentState: {},
          overrideGrade: 5
        });
      }).toThrow('Invalid override grade');
    });
  });

  describe('Rotation Plan Generation', () => {
    test('Generates a full 3-cycle rotation plan spanning 45 minutes', () => {
      const plan = OrchestrationEngine.generateRotationPlan({
        selectedGrades: [1, 2, 3],
        teacherCount: 1,
        abilityLevel: 'developing'
      });

      expect(plan.totalDurationMinutes).toBe(45);
      expect(plan.cycleDurationMinutes).toBe(15);
      expect(plan.cycles).toHaveLength(3);
      expect(plan.status).toBe('PLANNED');
    });
  });
});

describe('ExplanationEngine Unit Tests', () => {
  test('Generates factual pedagogical rationales for each grade mode', () => {
    const r1 = ExplanationEngine.generateGradeRationale({ grade: 1, mode: 'teacher-led' });
    expect(r1.length).toBeGreaterThanOrEqual(2);
    expect(r1[0]).toContain('phoneme');

    const r2 = ExplanationEngine.generateGradeRationale({ grade: 2, mode: 'independent' });
    expect(r2.length).toBeGreaterThanOrEqual(2);
    expect(r2[0]).toContain('numeral');

    const r3 = ExplanationEngine.generateGradeRationale({ grade: 3, mode: 'peer' });
    expect(r3.length).toBeGreaterThanOrEqual(2);
    expect(r3[0]).toContain('buyer-seller');
  });

  test('Produces adaptive override explanation when teacher flags support need', () => {
    const overrideRationale = ExplanationEngine.generateGradeRationale({
      grade: 2,
      mode: 'teacher-led',
      isOverride: true,
      overrideReason: 'Place-value regrouping difficulty'
    });

    expect(overrideRationale[0]).toContain('Rotation dynamically changed: Grade 2 was designated by the teacher');
    expect(overrideRationale[0]).toContain('Place-value regrouping difficulty');
  });

  test('Generates full classroom explanation with FLN alignment', () => {
    const full = ExplanationEngine.generateClassroomExplanation({
      currentGradeFocus: 1,
      isAdaptiveOverride: false
    });

    expect(full.summary).toContain('Teacher is currently providing direct instruction to Grade 1');
    expect(full.flnAlignment).toContain('NIPUN Bharat');
    expect(full.gradeRationales.grade1).toBeDefined();
    expect(full.gradeRationales.grade2).toBeDefined();
    expect(full.gradeRationales.grade3).toBeDefined();
  });
});

describe('StorageService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Migrates legacy vidyasetu_* keys to kakshasahay_* keys cleanly', () => {
    localStorage.setItem('vidyasetu_roster', JSON.stringify([{ name: 'Aarav', grade: 2 }]));
    localStorage.setItem('vidyasetu_lang', 'hi');

    const migrated = StorageService.migrateLegacyKeys();
    expect(migrated).toBe(2);

    expect(localStorage.getItem('vidyasetu_roster')).toBeNull();
    expect(localStorage.getItem('vidyasetu_lang')).toBeNull();
    expect(localStorage.getItem('kakshasahay_roster')).toContain('Aarav');
    expect(localStorage.getItem('kakshasahay_lang')).toBe('hi');
  });

  test('clearAllClassroomData clears only kakshasahay/vidyasetu keys and preserves unrelated keys', () => {
    localStorage.setItem('kakshasahay_roster', 'test');
    localStorage.setItem('kakshasahay_lang', 'hi');
    localStorage.setItem('third_party_token', 'preserve_me');

    const cleared = StorageService.clearAllClassroomData();
    expect(cleared).toBe(2);
    expect(localStorage.getItem('kakshasahay_roster')).toBeNull();
    expect(localStorage.getItem('kakshasahay_lang')).toBeNull();
    expect(localStorage.getItem('third_party_token')).toBe('preserve_me');
  });

  test('exportClassroomData produces valid JSON payload with app metadata', () => {
    localStorage.setItem('kakshasahay_ability_level', 'developing');
    const exportedStr = StorageService.exportClassroomData();
    const parsed = JSON.parse(exportedStr);

    expect(parsed.app).toBe('KakshaSahay');
    expect(parsed.version).toBe('1.2.0');
    expect(parsed.abilityLevel).toBe('developing');
    expect(parsed.exportTimestamp).toBeDefined();
  });
});
