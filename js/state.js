/**
 * KakshaSahay - Decoupled Reactive Pedagogy State Store & Centralized Classroom State Engine
 * Implements 15-Minute Multi-Grade Finite State Machine, 3-Grade Classroom Allocation,
 * Diagnostic Queue, Explainable Recommendation Engine, and Input Sanitizer.
 */
'use strict';

const StateStore = (() => {
  const DEFAULT_CYCLE_DURATION_SECONDS = 900; // 15-minute standard rotation cycle
  const DEFAULT_MAX_INPUT_LENGTH = 60;         // Maximum safe length for teacher inputs

  const subscribers = new Set();

  // Formal 15-Minute Multi-Grade FSM States
  const FSM_STATES = {
    STANDBY: 'STANDBY',
    PHASE_1_DIRECT_G1: 'PHASE_1_DIRECT_G1',         // Teacher with Grade 1; Grade 2/3 peer-slate activity
    ROTATION_TRANSITION: 'ROTATION_TRANSITION',     // Bell chime, switch guidance, audio prompt
    PHASE_2_DIRECT_G2_3: 'PHASE_2_DIRECT_G2_3',     // Teacher with Grade 2/3; Grade 1 independent slate activity
    DIAGNOSTIC_REMEDIATION: 'DIAGNOSTIC_REMEDIATION',// 2-min oral catchup evaluation
    PAUSED: 'PAUSED'
  };

  // Centralized Classroom Lifecycle States
  const CLASSROOM_STATES = {
    IDLE: 'IDLE',
    PLANNED: 'PLANNED',
    ACTIVE: 'ACTIVE',
    ROTATION_PENDING: 'ROTATION_PENDING',
    ROTATED: 'ROTATED',
    COMPLETED: 'COMPLETED'
  };

  // Structured Classroom State Template
  function createInitialClassroomState() {
    return {
      selectedGrades: [1, 2, 3],
      currentRotation: 1,
      totalRotationsPlanned: 3,
      currentGradeFocus: 1,
      classroomStatus: CLASSROOM_STATES.IDLE,
      grades: {
        grade1: {
          grade: 1,
          objective: 'वर्ण पहचान व 1-9 गिनती (Letter Recognition & Counting 1-9)',
          mode: 'teacher-led',
          status: 'active',
          activity: {
            title: 'Direct Foundational Phonics & Manipulative Counting',
            titleHindi: 'प्रत्यक्ष वर्ण पठन व कंकड़ मिलान',
            duration: 15,
            materials: ['Chalkboard (श्यामपट्ट)', 'Counting Pebbles (कंकड़/बीज)', 'Slates (स्लेट)'],
            teacherInvolvement: 'Direct interactive modeling and 1-on-1 articulation check',
            expectedOutput: 'Oral phoneme pronunciation & placing exact pebble count on slate'
          },
          rationale: 'Grade 1 concept is newly introduced foundational decoding; requires active teacher modeling.'
        },
        grade2: {
          grade: 2,
          objective: '2-अंकीय जोड़ व बंडल समझ (2-Digit Addition & Base-10 Bundles)',
          mode: 'independent',
          status: 'ready',
          activity: {
            title: 'Independent Slate Numeral & Bundle Decomposition',
            titleHindi: 'स्वतंत्र स्लेट अंक व बंडल अभ्यास',
            duration: 15,
            materials: ['Slates (तख्ती/स्लेट)', 'Chalk (खड़िया)', 'Twig Bundles (तीली बंडल)'],
            teacherInvolvement: 'Minimal supervision; teacher spot-checks first 2 examples during transition',
            expectedOutput: '5 completed addition problems with tally bundle drawings on student slates'
          },
          rationale: 'Grade 2 concept consolidates familiar numeral decomposition; requires minimal teacher supervision.'
        },
        grade3: {
          grade: 3,
          objective: 'दैनिक हाट समस्या समाधान (Market Context Word Problems)',
          mode: 'peer',
          status: 'ready',
          activity: {
            title: 'Collaborative Peer-Dyad Market Word Problems',
            titleHindi: 'सहपाठी हाट बाज़ार लेन-देन अभ्यास',
            duration: 15,
            materials: ['Pebble currency', 'Slates', 'Chalkboard Price List'],
            teacherInvolvement: 'Zero direct teacher intervention; peer dyads validate partner calculations',
            expectedOutput: 'Written slate ledger of 3 transactions initialed by peer buddy'
          },
          rationale: 'Grade 3 students collaborate in front-row dyads to quiz each other; reinforces collaborative mastery.'
        }
      },
      rotation: {
        active: false,
        cycle: 1,
        remainingSeconds: DEFAULT_CYCLE_DURATION_SECONDS,
        completedRotations: 0
      },
      absenteeStatus: {
        pendingCount: 0,
        screenedTodayCount: 0,
        activeBuddyPairs: 0
      },
      language: 'hi',
      connectivity: (typeof navigator !== 'undefined' && navigator.onLine) ? 'online' : 'offline',
      abilityLevel: 'beginner'
    };
  }

  const state = {
    schoolMode: 'rural', // 'rural' | 'urban'
    activeTab: 'classroom',
    gradeFocus: 1, // 1 = Grade 1 Direct, 2 = Grade 2/3 Direct, 3 = Grade 3 Direct
    timerRunning: false,
    secondsRemaining: DEFAULT_CYCLE_DURATION_SECONDS,
    startTime: null,
    targetEndTime: null,
    totalCycleSeconds: 900,
    fsmState: FSM_STATES.STANDBY,
    nipunScore: 68,
    edgeApiKey: '',
    speechAvailable: false,
    speechNotice: '',
    selectedDialect: 'awadhi_bhojpuri',
    remediationPendingCount: 0,
    diagnosticQueue: [],
    rotationLevel: 'beginner',
    classroom: createInitialClassroomState()
  };

  // Safe localStorage read on boot
  try {
    if (typeof localStorage !== 'undefined') {
      state.edgeApiKey = localStorage.getItem('kakshasahay_edge_api_key') || localStorage.getItem('vidyasetu_edge_api_key') || '';
      state.rotationLevel = localStorage.getItem('kakshasahay_rotation_level') || 'beginner';
      state.classroom.abilityLevel = state.rotationLevel;
      const storedRoster = localStorage.getItem('kakshasahay_absentee_roster');
      if (storedRoster) {
        try {
          const parsed = JSON.parse(storedRoster);
          state.remediationPendingCount = Array.isArray(parsed) ? parsed.length : 0;
          state.classroom.absenteeStatus.pendingCount = state.remediationPendingCount;
        } catch (_err) {}
      }
    }
  } catch (e) {
    console.warn('[StateStore] LocalStorage disabled or blocked:', e);
  }

  function getState() {
    return {
      ...state,
      classroom: JSON.parse(JSON.stringify(state.classroom))
    };
  }

  function getClassroomState() {
    return JSON.parse(JSON.stringify(state.classroom));
  }

  function setState(patch) {
    let changed = false;
    for (const [key, value] of Object.entries(patch)) {
      if (state[key] !== value) {
        state[key] = value;
        changed = true;
      }
    }
    if (changed) {
      notifySubscribers();
    }
  }

  function subscribe(listener) {
    subscribers.add(listener);
    try {
      listener(getState());
    } catch (e) {
      console.error('[StateStore] Error in listener callback:', e);
    }
    return () => subscribers.delete(listener);
  }

  function notifySubscribers() {
    const currentState = getState();
    subscribers.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error('[StateStore] Error dispatching to subscriber:', e);
      }
    });
  }

  // 15-Minute Multi-Grade FSM State Transitions
  function transitionFSM(action, payload = {}) {
    const prevFsm = state.fsmState;
    let nextFsm = prevFsm;

    switch (action) {
      case 'START_CYCLE':
        nextFsm = state.gradeFocus === 1 ? FSM_STATES.PHASE_1_DIRECT_G1 : FSM_STATES.PHASE_2_DIRECT_G2_3;
        transitionClassroomLifecycle('START_ROTATION');
        break;
      case 'PAUSE_CYCLE':
        nextFsm = FSM_STATES.PAUSED;
        break;
      case 'RESUME_CYCLE':
        nextFsm = state.gradeFocus === 1 ? FSM_STATES.PHASE_1_DIRECT_G1 : FSM_STATES.PHASE_2_DIRECT_G2_3;
        break;
      case 'TRIGGER_ROTATION':
        nextFsm = FSM_STATES.ROTATION_TRANSITION;
        transitionClassroomLifecycle('PENDING_ROTATION');
        break;
      case 'COMPLETE_ROTATION':
        nextFsm = state.gradeFocus === 1 ? FSM_STATES.PHASE_1_DIRECT_G1 : FSM_STATES.PHASE_2_DIRECT_G2_3;
        transitionClassroomLifecycle('ROTATE_CYCLE');
        break;
      case 'OPEN_DIAGNOSTIC':
        nextFsm = FSM_STATES.DIAGNOSTIC_REMEDIATION;
        break;
      case 'CLOSE_DIAGNOSTIC':
        nextFsm = state.timerRunning ? (state.gradeFocus === 1 ? FSM_STATES.PHASE_1_DIRECT_G1 : FSM_STATES.PHASE_2_DIRECT_G2_3) : FSM_STATES.STANDBY;
        break;
      default:
        console.warn('[StateStore] Unknown FSM action:', action);
    }

    if (nextFsm !== prevFsm) {
      setState({ fsmState: nextFsm, ...payload });
    }
  }

  // Centralized Classroom Lifecycle Transitions
  function transitionClassroomLifecycle(action, payload = {}) {
    const cr = state.classroom;
    const prevStatus = cr.classroomStatus;
    let nextStatus = prevStatus;

    switch (action) {
      case 'PLAN_CLASSROOM':
        nextStatus = CLASSROOM_STATES.PLANNED;
        break;
      case 'START_ROTATION':
        nextStatus = CLASSROOM_STATES.ACTIVE;
        cr.rotation.active = true;
        break;
      case 'PENDING_ROTATION':
        nextStatus = CLASSROOM_STATES.ROTATION_PENDING;
        break;
      case 'ROTATE_CYCLE':
        nextStatus = CLASSROOM_STATES.ROTATED;
        cr.currentRotation = (cr.currentRotation % 3) + 1;
        cr.rotation.cycle = cr.currentRotation;
        cr.rotation.completedRotations += 1;
        updateClassroomAllocation(cr.currentRotation, state.rotationLevel);
        break;
      case 'COMPLETE_SESSION':
        nextStatus = CLASSROOM_STATES.COMPLETED;
        cr.rotation.active = false;
        break;
      case 'RESET_CLASSROOM':
        nextStatus = CLASSROOM_STATES.IDLE;
        cr.rotation.active = false;
        cr.currentRotation = 1;
        cr.rotation.cycle = 1;
        updateClassroomAllocation(1, state.rotationLevel);
        break;
      default:
        console.warn('[StateStore] Unknown classroom action:', action);
    }

    cr.classroomStatus = nextStatus;
    Object.assign(cr, payload);
    notifySubscribers();
  }

  // Updates Classroom Allocations across all 3 grades based on active cycle and TaRL ability level
  function updateClassroomAllocation(cycle = 1, abilityLevel = 'beginner') {
    const cr = state.classroom;
    cr.currentRotation = cycle;
    cr.abilityLevel = abilityLevel;

    // Cycle 1: Grade 1 Teacher-Led, Grade 2 Independent, Grade 3 Peer
    if (cycle === 1) {
      cr.currentGradeFocus = 1;
      state.gradeFocus = 1;

      cr.grades.grade1.mode = 'teacher-led';
      cr.grades.grade1.status = 'active';
      cr.grades.grade1.activity = {
        title: abilityLevel === 'proficient'
          ? 'Direct Rapid Phonics & Sentence Construction'
          : 'Direct Foundational Phonics & Manipulative Counting',
        titleHindi: abilityLevel === 'proficient'
          ? 'कक्षा 1: प्रत्यक्ष सरल वाक्य पठन व निर्माण'
          : 'कक्षा 1: प्रत्यक्ष वर्ण ध्वनि व 1-से-1 कंकड़ मिलान',
        duration: 15,
        materials: ['Chalkboard (श्यामपट्ट)', 'Counting Pebbles (कंकड़)', 'Slates (स्लेट)'],
        teacherInvolvement: 'Direct interactive teacher modeling and single-student check',
        expectedOutput: 'Accurate oral articulation and slate letter/number writing'
      };
      cr.grades.grade1.rationale = 'Grade 1 is introducing active foundational literacy; requires direct teacher guidance.';

      cr.grades.grade2.mode = 'independent';
      cr.grades.grade2.status = 'ready';
      cr.grades.grade2.activity = {
        title: abilityLevel === 'proficient'
          ? 'Independent 2-Digit Subtraction with Regrouping'
          : 'Independent Slate Numeral & Bundle Decomposition',
        titleHindi: abilityLevel === 'proficient'
          ? 'कक्षा 2: स्वतंत्र 2-अंकीय घटाव व स्लेट अभ्यास'
          : 'कक्षा 2: स्वतंत्र स्लेट अंक व बंडल अभ्यास',
        duration: 15,
        materials: ['Slates (तख्ती/स्लेट)', 'Chalk (खड़िया)', 'Twig Bundles (तीली बंडल)'],
        teacherInvolvement: 'Self-paced; teacher spot-checks first 2 examples during rotation transition',
        expectedOutput: '5 completed addition/numeral decompositions with tally bundle drawings on slates'
      };
      cr.grades.grade2.rationale = 'Grade 2 consolidates familiar decomposition; requires minimal teacher supervision.';

      cr.grades.grade3.mode = 'peer';
      cr.grades.grade3.status = 'ready';
      cr.grades.grade3.activity = {
        title: 'Collaborative Peer-Dyad Market Word Problems',
        titleHindi: 'कक्षा 3: सहपाठी हाट बाज़ार लेन-देन अभ्यास',
        duration: 15,
        materials: ['Pebble currency (कंकड़ सिक्के)', 'Slates', 'Chalkboard Price List'],
        teacherInvolvement: 'Zero direct teacher intervention; peer dyads validate partner calculations',
        expectedOutput: 'Written slate ledger of 3 transactions initialed by peer buddy'
      };
      cr.grades.grade3.rationale = 'Grade 3 students collaborate in front-row dyads to quiz each other; reinforces collaborative mastery.';
    }
    // Cycle 2: Grade 2 Teacher-Led, Grade 3 Independent, Grade 1 Peer
    else if (cycle === 2) {
      cr.currentGradeFocus = 2;
      state.gradeFocus = 2;

      cr.grades.grade2.mode = 'teacher-led';
      cr.grades.grade2.status = 'active';
      cr.grades.grade2.activity = {
        title: 'Direct 2-Digit Addition & Regrouping Concepts',
        titleHindi: 'कक्षा 2: 2-अंकीय हासिल वाले जोड़ व स्थानीय मान की प्रत्यक्ष समझ',
        duration: 15,
        materials: ['Chalkboard (श्यामपट्ट)', 'Base-10 Pebble Bundles (10-10 की ढेरी)', 'Slates'],
        teacherInvolvement: 'Direct conceptual demonstration of carrying and place value',
        expectedOutput: 'Decomposing numbers into tens/units and solving 3 board examples'
      };
      cr.grades.grade2.rationale = 'Grade 2 is learning multi-digit regrouping; requires direct teacher conceptual explanation.';

      cr.grades.grade3.mode = 'independent';
      cr.grades.grade3.status = 'ready';
      cr.grades.grade3.activity = {
        title: 'Multi-Step Contextual Problem Solving on Slates',
        titleHindi: 'कक्षा 3: स्वतंत्र बहु-चरणीय इबारती सवाल',
        duration: 15,
        materials: ['Slates (तख्ती/स्लेट)', 'Chalk', 'Word Problem Prompt Board'],
        teacherInvolvement: 'Self-paced practice; teacher checks during next rotation interval',
        expectedOutput: '4 multi-step story problems solved individually on slates'
      };
      cr.grades.grade3.rationale = 'Grade 3 students apply familiar arithmetic independently without teacher interruption.';

      cr.grades.grade1.mode = 'peer';
      cr.grades.grade1.status = 'ready';
      cr.grades.grade1.activity = {
        title: 'Tactile Slate Tracing & Partner Phonics Rhyme Pairing',
        titleHindi: 'कक्षा 1: साथी छात्र के साथ स्लेट पर वर्ण अनुरेखण व बालगीत',
        duration: 15,
        materials: ['Slates', 'Chalk', 'Akshar Picture Cards'],
        teacherInvolvement: 'Senior peer buddy from front row guides letter tracing and listens to oral rhyme',
        expectedOutput: '5 letter repetitions on slate checked by Grade 3 peer mentor'
      };
      cr.grades.grade1.rationale = 'Grade 1 reinforces phonics via collaborative older peer buddy guidance.';
    }
    // Cycle 3: Grade 3 Teacher-Led, Grade 1 Independent, Grade 2 Peer
    else {
      cr.currentGradeFocus = 3;
      state.gradeFocus = 3;

      cr.grades.grade3.mode = 'teacher-led';
      cr.grades.grade3.status = 'active';
      cr.grades.grade3.activity = {
        title: 'Direct Reading Comprehension & Multi-Step Logic',
        titleHindi: 'कक्षा 3: गद्यांश अर्थग्रहण व तार्किक प्रश्नोत्तरी का सीधा शिक्षण',
        duration: 15,
        materials: ['Chalkboard', 'Textbook Paragraph', 'Slates'],
        teacherInvolvement: 'Direct guided reading and higher-order questioning',
        expectedOutput: '3 written analytical answers and oral inference summary'
      };
      cr.grades.grade3.rationale = 'Grade 3 requires deep reading inference and critical questioning from the teacher.';

      cr.grades.grade1.mode = 'independent';
      cr.grades.grade1.status = 'ready';
      cr.grades.grade1.activity = {
        title: 'Independent Tactile Shape & Number Matching',
        titleHindi: 'कक्षा 1: स्वतंत्र कंकड़ गिनती व स्लेट चित्र मिलान',
        duration: 15,
        materials: ['Slates', 'Chalk', 'Dried Seeds / Pebbles'],
        teacherInvolvement: 'Silent independent drawing and counting',
        expectedOutput: 'Drawn objects matching numbers 1 to 10 on slate'
      };
      cr.grades.grade1.rationale = 'Grade 1 works silently on concrete tactile tallying requiring zero teacher supervision.';

      cr.grades.grade2.mode = 'peer';
      cr.grades.grade2.status = 'ready';
      cr.grades.grade2.activity = {
        title: 'Peer Word-Building & Arithmetic Speed Quiz',
        titleHindi: 'कक्षा 2: सहपाठी शब्द निर्माण व गणितीय त्वरित प्रश्नोत्तरी',
        duration: 15,
        materials: ['Flashcards', 'Slates', 'Chalk'],
        teacherInvolvement: 'Partner timed challenge with peer scoring',
        expectedOutput: 'Partner-verified slate quiz score'
      };
      cr.grades.grade2.rationale = 'Grade 2 peer dyads cross-test each other on mental math and 2-letter word building.';
    }

    notifySubscribers();
    return cr;
  }

  // Generate factual explainable rationale for active recommendations
  function getExplainableRationale(cycle = 1, abilityLevel = 'beginner') {
    const activeGrade = cycle === 1 ? 1 : cycle === 2 ? 2 : 3;
    const independentGrade = cycle === 1 ? 2 : cycle === 2 ? 3 : 1;
    const peerGrade = cycle === 1 ? 3 : cycle === 2 ? 1 : 2;

    return {
      cycle,
      abilityLevel: abilityLevel.toUpperCase(),
      activeGradeFocus: `Grade ${activeGrade}`,
      reasons: [
        `Grade ${activeGrade} is assigned Teacher-Led instruction because its active learning objective requires teacher modeling and phonological/arithmetic scaffolding.`,
        `Grade ${independentGrade} is assigned Independent Slate Practice because the task uses familiar self-paced algorithms requiring minimal teacher supervision.`,
        `Grade ${peerGrade} is assigned Collaborative Peer Dyads because student pairs reinforce concepts through oral verbalization and buddy verification without disrupting the teacher.`,
        `All activities utilize 100% locally available zero-cost materials (slates, blackboard chalk, pebbles/seeds).`,
        `Execution is 100% offline-compatible with zero network dependencies or cloud latency.`
      ]
    };
  }

  // Clear all KakshaSahay-owned data from localStorage safely
  function clearClassroomData() {
    if (typeof localStorage !== 'undefined') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('kakshasahay_') || key.startsWith('vidyasetu_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }

    state.gradeFocus = 1;
    state.timerRunning = false;
    state.secondsRemaining = DEFAULT_CYCLE_DURATION_SECONDS;
    state.fsmState = FSM_STATES.STANDBY;
    state.remediationPendingCount = 0;
    state.diagnosticQueue = [];
    state.rotationLevel = 'beginner';
    state.classroom = createInitialClassroomState();

    notifySubscribers();
    return true;
  }

  // Input Sanitization Helper (Security Layer)
  function sanitizeInput(str, maxLength = DEFAULT_MAX_INPUT_LENGTH) {
    if (typeof str !== 'string') return '';
    return str
      .normalize('NFC')
      .replace(/[<>&"'`]/g, '') // Strip HTML tag and attribute delimiters
      .replace(/[\x00-\x1F\x7F]/g, '') // Strip control characters
      .trim()
      .substring(0, maxLength);
  }

  return {
    getState,
    getClassroomState,
    setState,
    subscribe,
    transitionFSM,
    transitionClassroomLifecycle,
    updateClassroomAllocation,
    getExplainableRationale,
    clearClassroomData,
    sanitizeInput,
    FSM_STATES,
    CLASSROOM_STATES
  };
})();

if (typeof window !== 'undefined') {
  window.StateStore = StateStore;
}
if (typeof globalThis !== 'undefined') {
  globalThis.StateStore = StateStore;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StateStore };
}
