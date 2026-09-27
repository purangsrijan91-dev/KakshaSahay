# KakshaSahay — Testing Strategy & Quality Assurance Architecture

## 1. Quality Assurance Philosophy

KakshaSahay is built with an **evidence-driven verification architecture**. Every pedagogical claim, state transition, storage boundary, and accessibility target is defended by automated regression tests rather than manual promises.

---

## 2. Multi-Tier Test Suite Summary

```
+-----------------------------------------------------------------------------------+
| Tier 1: Unit & Domain Logic     | Jest (8 Suites, 60 Tests)             | 100% PASS |
| Tier 2: Pedagogical Benchmark   | Evaluation Harness (60 FLN Cases)    | 100% PASS |
| Tier 3: End-to-End Workflows    | Playwright Chromium (18 Scenarios)   | 100% PASS |
| Tier 4: Accessibility (A11y)    | Axe-core (WCAG 2.2 AA Strict Rules)  | 100% PASS |
| Tier 5: Static Analysis & Style | ESLint Flat Config (Zero Warnings)   | 100% PASS |
+-----------------------------------------------------------------------------------+
```

---

## 3. Test Suites & Commands

### 3.1. Unit Testing (Jest)
Runs unit test suites covering the decoupled state store, finite state machine, local storage encryption, input sanitization, 15-minute timer math, and orchestration allocation.

```bash
# Run all unit tests
npm test

# Run with test coverage
npm run test:coverage
```

#### Covered Test Files:
- `tests/orchestration.test.js`: Validates deterministic 3-grade allocation, 1-teacher constraints, input schema validation, adaptive teacher overrides, and full 45-minute rotation plan generation.
- `tests/storage.test.js`: Validates PBKDF2/AES-GCM encryption, legacy `vidyasetu_*` key migration to `kakshasahay_*`, diagnostic queue FIFO operations, and storage latency benchmarking.
- `tests/state.test.js`: Validates reactive subscriber notifications, 15-minute FSM state transitions, and centralized classroom state immutability.
- `tests/timer.test.js`: Validates hardware clock delta sync (`Date.now()`), pause/resume drift resistance, and phase toggles.
- `tests/sanitizer.test.js`: Validates HTML entity encoding preventing DOM XSS.
- `tests/pedagogical.test.js`: Validates vernacular dialect translations (Bhojpuri, Awadhi, Maithili, Bundelkhandi) and zero-cost TLM mappings.
- `tests/classroom.test.js`: Validates 3-grade simultaneous allocation and explainable rationale generation.
- `tests/level.test.js`: Validates TaRL micro-grouping level transitions (Beginner, Developing, Proficient).

---

### 3.2. Pedagogical Evaluation Benchmark Harness
Evaluates the offline curriculum engine against **60 authentic primary classroom prompts** across Grades 1, 2, and 3:

```bash
npm run evaluate
```

#### Benchmark Results:
- **Evaluated Cases:** 60
- **Passed Consistency Check:** 60 / 60 (100.0%)
- **Schema Conformance Rate:** 60 / 60 (100.0%)
- **Offline Determinism Rate:** 60 / 60 (100.0%)
- **Safety Boundary Compliance:** 60 / 60 (100.0%)
- Output persisted to: `evaluation/results.json`

---

### 3.3. End-to-End Workflow Verification (Playwright)
Executes 18 comprehensive browser-level workflows in a headless Chromium instance:

```bash
# Run all Playwright tests
npm run test:e2e
# or
npx playwright test
```

#### Automated End-to-End Scenarios:
1. **App Boot:** Verifies zero uncaught script runtime errors and valid branding.
2. **15-Minute Timer:** Verifies hardware clock countdown, focus switching, pause, and reset.
3. **Bhasha Setu:** Verifies localized pedagogical analogy generation without network calls.
4. **Absentee Catch-Up Triage:** Verifies 2-minute diagnostic execution and encrypted student persistence across page reloads.
5. **Zero-Cost TLM:** Verifies number train puzzle verification and random puzzle generation.
6. **Bilingual Toggle:** Verifies instantaneous UI switching between English and Hindi.
7. **Audio Concurrency & Cross-Tab Bus:** Verifies speech pre-emption, Page Visibility cancellation, and `BroadcastChannel` suppression.
8. **DOM Hygiene:** Verifies deprecated "How It Works" buttons and iframes are completely pruned from DOM.
9. **TaRL Micro-Grouping Selector:** Verifies ability-level switching and local persistence.
10. **Session Summary Handoff:** Verifies printable report rendering and clipboard copy actions.
11. **Centralized Classroom Dashboard:** Verifies simultaneous 3-grade allocation cards and explainable rationales.
12. **Demo Mode:** Verifies 1-click realistic multigrade scenario loading.
13. **Clear Local Data:** Verifies accessible confirmation modal and scoped `kakshasahay_*` key removal.
14. **AudioCoordinator API:** Verifies programmatic audio interface exposure.
15. **Start Classroom Session CTA:** Verifies primary hero button scrolls to dashboard and initiates the timer.
16. **Adaptive Teacher Override:** Verifies dynamic schedule recalculation and pedagogical explanation update when teacher flags a grade for support.
17. **Live Offline Diagnostics Modal:** Verifies automated self-checks (SW, storage latency, FSM clock, speech) and offline mode simulation.
18. **Data Export:** Verifies clean JSON download of active classroom rosters and metrics.

---

### 3.4. Accessibility Audit (Axe-core)
Audits the live DOM using Deque's automated `axe-core` accessibility engine:

```bash
npm run test:a11y
```

#### Validated WCAG 2.2 AA Criteria:
- `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` tag suites.
- Accessible names for all interactive buttons and inputs (`button-name`, `link-name`).
- Valid ARIA attributes and roles (`aria-roles`, `aria-valid-attr`, `aria-valid-attr-value`).
- Minimum touch target sizes ($\ge 40\times 40\text{px}$) for rural touchscreens.
- Violations: **0 violations**.

---

### 3.5. Static Code Analysis (ESLint)
Enforces modern JavaScript code quality and strict syntax boundaries:

```bash
npm run lint
```
- Total Errors: **0**
- Total Warnings: **0**
