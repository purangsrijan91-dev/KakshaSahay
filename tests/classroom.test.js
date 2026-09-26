/**
 * Unit Tests: Centralized Classroom State Model & Multigrade Lifecycle Transitions
 * Tests Phase 1, Phase 2, Phase 5 (Explainability), and Phase 36 (Local Data Control).
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

const { StateStore } = require('../js/state.js');

describe('Centralized Classroom State Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    StateStore.clearClassroomData();
  });

  test('Initializes 3-Grade multigrade allocation with Grade 1 Teacher-Led in Cycle 1', () => {
    const cr = StateStore.getClassroomState();

    expect(cr.selectedGrades).toEqual([1, 2, 3]);
    expect(cr.currentRotation).toBe(1);
    expect(cr.currentGradeFocus).toBe(1);
    expect(cr.classroomStatus).toBe(StateStore.CLASSROOM_STATES.IDLE);

    // Grade 1 should be teacher-led
    expect(cr.grades.grade1.mode).toBe('teacher-led');
    expect(cr.grades.grade1.status).toBe('active');
    expect(cr.grades.grade1.activity.materials).toContain('Chalkboard (श्यामपट्ट)');

    // Grade 2 should be independent
    expect(cr.grades.grade2.mode).toBe('independent');
    expect(cr.grades.grade2.status).toBe('ready');

    // Grade 3 should be peer
    expect(cr.grades.grade3.mode).toBe('peer');
    expect(cr.grades.grade3.status).toBe('ready');
  });

  test('Rotates 3-Grade allocation cleanly on Cycle 2: Grade 2 Teacher-Led, Grade 3 Independent, Grade 1 Peer', () => {
    const cr = StateStore.updateClassroomAllocation(2, 'developing');

    expect(cr.currentRotation).toBe(2);
    expect(cr.currentGradeFocus).toBe(2);

    expect(cr.grades.grade2.mode).toBe('teacher-led');
    expect(cr.grades.grade2.status).toBe('active');

    expect(cr.grades.grade3.mode).toBe('independent');
    expect(cr.grades.grade3.status).toBe('ready');

    expect(cr.grades.grade1.mode).toBe('peer');
    expect(cr.grades.grade1.status).toBe('ready');
  });

  test('Rotates 3-Grade allocation cleanly on Cycle 3: Grade 3 Teacher-Led, Grade 1 Independent, Grade 2 Peer', () => {
    const cr = StateStore.updateClassroomAllocation(3, 'proficient');

    expect(cr.currentRotation).toBe(3);
    expect(cr.currentGradeFocus).toBe(3);

    expect(cr.grades.grade3.mode).toBe('teacher-led');
    expect(cr.grades.grade3.status).toBe('active');

    expect(cr.grades.grade1.mode).toBe('independent');
    expect(cr.grades.grade1.status).toBe('ready');

    expect(cr.grades.grade2.mode).toBe('peer');
    expect(cr.grades.grade2.status).toBe('ready');
  });

  test('Produces explainable pedagogical rationale for current classroom configuration', () => {
    const rationale = StateStore.getExplainableRationale(1, 'beginner');

    expect(rationale.cycle).toBe(1);
    expect(rationale.activeGradeFocus).toBe('Grade 1');
    expect(rationale.reasons.length).toBeGreaterThanOrEqual(4);

    // Verifies key explanation properties
    const combinedText = rationale.reasons.join(' ');
    expect(combinedText).toContain('Teacher-Led');
    expect(combinedText).toContain('Independent');
    expect(combinedText).toContain('Collaborative Peer Dyads');
    expect(combinedText).toContain('zero-cost materials');
    expect(combinedText).toContain('100% offline-compatible');
  });

  test('Transitions through complete classroom lifecycle states safely', () => {
    // 1. Plan classroom
    StateStore.transitionClassroomLifecycle('PLAN_CLASSROOM');
    expect(StateStore.getClassroomState().classroomStatus).toBe(StateStore.CLASSROOM_STATES.PLANNED);

    // 2. Start rotation
    StateStore.transitionClassroomLifecycle('START_ROTATION');
    expect(StateStore.getClassroomState().classroomStatus).toBe(StateStore.CLASSROOM_STATES.ACTIVE);
    expect(StateStore.getClassroomState().rotation.active).toBe(true);

    // 3. Pending rotation transition
    StateStore.transitionClassroomLifecycle('PENDING_ROTATION');
    expect(StateStore.getClassroomState().classroomStatus).toBe(StateStore.CLASSROOM_STATES.ROTATION_PENDING);

    // 4. Rotate cycle
    StateStore.transitionClassroomLifecycle('ROTATE_CYCLE');
    expect(StateStore.getClassroomState().classroomStatus).toBe(StateStore.CLASSROOM_STATES.ROTATED);
    expect(StateStore.getClassroomState().currentRotation).toBe(2);

    // 5. Complete session
    StateStore.transitionClassroomLifecycle('COMPLETE_SESSION');
    expect(StateStore.getClassroomState().classroomStatus).toBe(StateStore.CLASSROOM_STATES.COMPLETED);
    expect(StateStore.getClassroomState().rotation.active).toBe(false);

    // 6. Reset
    StateStore.transitionClassroomLifecycle('RESET_CLASSROOM');
    expect(StateStore.getClassroomState().classroomStatus).toBe(StateStore.CLASSROOM_STATES.IDLE);
    expect(StateStore.getClassroomState().currentRotation).toBe(1);
  });

  test('clearClassroomData removes only KakshaSahay-owned keys from localStorage', () => {
    localStorage.setItem('kakshasahay_rotation_level', 'proficient');
    localStorage.setItem('kakshasahay_absentee_roster', JSON.stringify([{ name: 'Test' }]));
    localStorage.setItem('unrelated_app_key', 'preserve_me');

    StateStore.clearClassroomData();

    expect(localStorage.getItem('kakshasahay_rotation_level')).toBeNull();
    expect(localStorage.getItem('kakshasahay_absentee_roster')).toBeNull();
    expect(localStorage.getItem('unrelated_app_key')).toBe('preserve_me');
  });
});
