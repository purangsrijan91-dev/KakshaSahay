# KakshaSahay (कक्षासहाय) — Primary Classroom Companion

> **Offline-first structured pedagogical automation for primary classrooms where one frontline teacher manages multiple grades.**  
> Aligned with the **NIPUN Bharat Mission** for Foundational Literacy and Numeracy (FLN).

[![FLN Mission: NIPUN Bharat](https://img.shields.io/badge/FLN%20Mission-NIPUN%20Bharat%20Aligned-amber.svg)](https://www.education.gov.in/shikshak-parv/nipun-bharat.html)
[![Live Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages%20Live-emerald.svg)](https://purangsrijan91-dev.github.io/KakshaSahay/)
[![PWA Architecture](https://img.shields.io/badge/PWA-Service%20Worker%20Active-blue.svg)](#offline-first-pwa-architecture)
[![A11y Standard](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA%20Audited-green.svg)](docs/accessibility-audit.md)
[![Automated Tests](https://img.shields.io/badge/Tests-Jest%20%26%20Playwright%20Passing-success.svg)](#automated-testing--engineering-rigor)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🧭 Executive Summary & Problem Context

In rural government primary schools (*Prathmik Vidyalaya*) and municipal slum schools across India, a single frontline teacher is routinely required to manage children from **Grades 1, 2, and 3 simultaneously** within a single classroom.

### Evidenced Classroom Statistics (ASER 2024 Citations)
* **Prevalence of Multigrade Teaching:** According to the **Annual Status of Education Report (ASER 2024)**, over **two-thirds (65.8%)** of rural Standard I/II classrooms in primary schools across India operate in a multigrade configuration where one teacher instructs multiple grades in the same physical room.
* **Small School Density:** Nationally, **52.1% of government primary schools** have total student enrollments of **60 or fewer students**, necessitating multigrade staffing models where 1 or 2 teachers cover all primary grades (ASER 2024 Rural Findings).
* **The Multigrade Dilemma:** When the teacher delivers direct instruction to Grade 1, Grades 2 and 3 frequently fall into off-task noise or idle time. This foundational challenge is compounded by:
  1. **Linguistic Friction:** Children speak regional domestic dialects at home (Awadhi, Bhojpuri, Bundeli, Chhattisgarhi, Maithili) and struggle with textbook formal Hindi.
  2. **Seasonal Absenteeism:** 2–4 week learning interruptions driven by agricultural crop harvesting (rabi/kharif) or family wage migration.
  3. **Severe Resource Deprivation:** Absence of printed learning materials, electricity, or student digital devices.

**KakshaSahay** addresses this not by attempting to replace the teacher with an autonomous chatbot or expensive individual tablets, but by providing an **offline-first classroom orchestrator** that structures time, differentiates by ability (TaRL), bridges dialects, triages absenteeism, and generates zero-cost slate activities.

---

## ⚖️ Positioning & Differentiation: How KakshaSahay Differs

To understand KakshaSahay's role in the Indian EdTech landscape, we map its operational mechanism directly against established pedagogical interventions and commercial solutions:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        HOW KAKSHASAHAY COMPARES IN MECHANISM                           │
├────────────────────┬─────────────────────────────────┬─────────────────────────────────┤
│ Existing Approach  │ Operational Model               │ KakshaSahay Differentiating     │
│                    │                                 │ Mechanism                       │
├────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ Nali-Kali          │ Analog, physical card-based     │ Digitizes classroom timing and  │
│ (Karnataka Model)  │ multigrade self-paced learning; │ audio orchestration; adds       │
│                    │ requires heavy printed kits.    │ real-time ability-aware tasks.  │
├────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ Pratham's TaRL     │ Groups students by ability      │ Adapts TaRL micro-grouping      │
│ (J-PAL Validated)  │ (Beginner/Developing/Proficient)│ (Beginner/Developing/Proficient)│
│                    │ across term-long cohorts.       │ *inside a 15-minute rotation*.  │
├────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ Chimple /          │ Child-facing interactive tablet │ Teacher-facing classroom        │
│ LearnBharat        │ apps & gamified content libraries│ orchestrator; zero student-facing│
│                    │ requiring 1:1 hardware.         │ hardware required.              │
└────────────────────┴─────────────────────────────────┴─────────────────────────────────┘
```

* **vs. Nali-Kali (Karnataka):** Nali-Kali pioneered multigrade learning ladders in India using color-coded physical milestones and cards. While pedagogically sound, it requires substantial physical kit maintenance and recurring printing. KakshaSahay digitizes the orchestration layer (timing, phase transitions, teacher prompts) while retaining zero-cost blackboard/slate execution.
* **vs. Pratham's TaRL (Teaching at the Right Level):** TaRL groups students by foundational ability across hours or dedicated remedial terms. KakshaSahay embeds a lightweight micro-version of this principle directly into each 15-minute rotation cycle: with 1 tap, the teacher selects the active ability level, and both direct teacher instruction and peer slate tasks automatically adapt.
* **vs. Chimple / LearnBharat:** These platforms deliver gamified digital instruction directly to individual children on tablets. KakshaSahay is **strictly a teacher-facing tool**. It does not compete with child-facing content; rather, it could orchestrate the physical classroom while students use slates or paper workbooks.
* **Original Components:**
  * **Bhasha Setu:** Systematic bridging from 5 regional dialects to formal Hindi textbook concepts via grounded rural haat/village metaphors.
  * **Absentee Triage:** 120-second rapid oral screening that instantly pairs returning post-harvest children with designated peer buddies to prevent dropout cascades.

---

## 🎯 The Four Core Solvers

KakshaSahay implements four focused, deterministic solvers engineered for high-friction classroom environments:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               KAKSHASAHAY CORE SOLVERS                                │
├──────────────────────┬──────────────────────┬───────────────────┬──────────────────────┤
│ 1. ORCHESTRATE       │ 2. BRIDGE            │ 3. RECOVER        │ 4. CREATE            │
│ 15-Min MGML + TaRL   │ Bhasha Setu          │ Absentee Triage   │ Zero-Cost TLM        │
│ ──────────────────── │ ──────────────────── │ ───────────────── │ ──────────────────── │
│ Hardware delta clock │ Local dialect        │ 2-min oral check  │ Chalkboard trains    │
│ cycling direct       │ analogies (berries,  │ + peer buddy      │ + slate manipulatives│
│ teaching & peer work │ haat, stairs, coins) │ encrypted roster  │ (pebbles & chalk)    │
└──────────────────────┴──────────────────────┴───────────────────┴──────────────────────┘
```

### 1. Orchestrate — 15-Minute Multi-Grade Rotation Engine (MGML) with TaRL Micro-Grouping
* **Classroom Reality:** Simultaneous multigrade teaching without structured intervals leads to classroom management collapse.
* **Pedagogical Scaffolding:** Includes a 1-tap ability level selector (**Beginner / Developing / Proficient**) that differentiates the direct teacher instruction script for the active grade while simultaneously adjusting the peer practice task for the collaborative grade.
* **Engineering Solution:** An authoritative 15-minute countdown clock that calculates true delta-time (`Date.now() - startTime`) to eliminate background timer throttling on low-cost Android phones.
* **Acoustic Feedback:** Synthesizes an acoustic school bell chime via the Web Audio API without requiring streaming audio files.

### 2. Bridge — Bhasha Setu (Local Dialect Bridge)
* **Classroom Reality:** Standard curriculum introduces abstract concepts (e.g. subtraction, descending order, fractions) in formal Hindi that alienates dialect speakers.
* **Engineering Solution:** On-device pedagogical lookup and semantic synthesis matching syllabus concepts to grounded village archetypes (Awadhi/Bhojpuri, Bundeli/Malvi, Chhattisgarhi/Bagheli, Maithili/Angika, Urban Multilingual) with offline Web Speech synthesis.

### 3. Recover — 2-Minute Absenteeism Catch-Up Triage
* **Classroom Reality:** Post-harvest returnees lack foundational continuity; teachers cannot spare 30 minutes of individual re-teaching.
* **Engineering Solution:** 3-step rapid oral diagnostic card (Recognize → Count → Associate). Automatically pairs the returning child with a front-row **Peer Buddy (सहपाठी साथी)**, persisting student catch-up queues in encrypted browser storage. Includes exportable handoff reports.

### 4. Create — Zero-Cost Chalkboard TLM & Practice Generator
* **Classroom Reality:** Rural classrooms lack printed charts, flashcards, or interactive screens.
* **Engineering Solution:** Generates ASCII chalkboard number trains (*संख्या रेलगाड़ी*) and concrete math exercises utilizing slates, chalk, and natural manipulatives (counting pebbles, mud sticks).

---

## 🤖 What is Actually AI? (Technical Honesty & Architecture)

We explicitly distinguish between deterministic offline automation and experimental cloud intelligence:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SYSTEM ARCHITECTURE                                    │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │               OFFLINE CORE: 100% Deterministic Rule-Based Automation           │   │
│   │                                                                                │   │
│   │  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │   │
│   │  │   Service Worker     │  │  StateStore & FSM    │  │   TimerEngine        │  │   │
│   │  │   (sw.js Cache)      │  │  (Reactive State)    │  │   (True Delta Clock) │  │   │
│   │  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  │   │
│   │  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │   │
│   │  │   Curriculum Bank    │  │   StorageVault       │  │   Bilingual Engine   │  │   │
│   │  │   (Deterministic)    │  │   (AES-GCM / XOR)    │  │   (Instant Toggle)   │  │   │
│   │  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                            │
│                     (Optional Developer Configuration - Online Only)                   │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │   External Gemini API (Edge LLM Augmentation for Novel Unlisted Concepts)     │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **What is Deterministic Automation (The Core):**
   - The **15-Minute Rotation Timer**, the **Bhasha Setu Curriculum Knowledge Bank**, the **Absenteeism Diagnostic Decision Tree**, the **Chalkboard TLM Generator**, and the **Session Handoff Summary** are **100% deterministic, rule-based algorithms**.
   - They run entirely on-device in pure JavaScript with zero network calls, zero hallucinations, zero latency, and zero token costs.
2. **What is Generative AI (The Edge Extension):**
   - In `js/rag.js`, an optional developer configuration allows querying Google's Gemini 2.5 Flash API when an API key is provided.
   - This path is triggered **only** when a teacher searches for an arbitrary, novel syllabus topic that does not exist in the verified local curriculum dictionary.
   - If offline or unconfigured, the application falls back immediately to safe on-device semantic archetypes.
   - The UI never misrepresents deterministic outputs as model-generated.

---

## ⏱️ Live Judge Verification (2-Minute Offline Script)

Any evaluator or judge can verify all scoped offline claims directly in 2 minutes:

1. **Step 1: Initial Load & Cache**  
   Open [https://purangsrijan91-dev.github.io/KakshaSahay/](https://purangsrijan91-dev.github.io/KakshaSahay/) in Google Chrome or any modern browser. Verify the green trust badge reads: `"PWA: Cache Ready (Offline Validated)"`.
2. **Step 2: Sever Network Connection**  
   Open Chrome DevTools (`F12`), navigate to the **Network** tab, and toggle the dropdown to **Offline** (or toggle your computer's Wi-Fi off).
3. **Step 3: Verify the 4 Core Solvers Offline**
   - **Solver 1 (Timer & TaRL):** Click the ability level buttons (**Developing**, **Proficient**); observe direct instruction and peer task text switch instantly. Click **Start 15-Min Cycle**; verify the timer decrements with acoustic chime audio.
   - **Solver 2 (Bhasha Setu):** In the dialect dropdown, select **Bundeli**, enter or select **घटाव (Subtraction)**, and click **Explain Concept**. Verify the localized analogy and audio speech render with 0 bytes over the network.
   - **Solver 3 (Absentee Triage):** Enter a student name (e.g. `मीरा (कक्षा 2)`), click **Start 2-Min Oral Diagnostic**, check oral screening items, and click **Needs Peer Buddy**. Verify Mira is added to the active remediation roster.
   - **Solver 4 (Chalkboard TLM):** Type the missing carriage numbers in the number train and click **Verify Board Puzzle**.
4. **Step 4: Reload & Persistence Test**  
   While still in **Offline** mode, press `Ctrl + R` (Hard Reload). The application boots instantaneously from the Service Worker cache, and Mira remains in the remediation roster via encrypted localStorage.
5. **Step 5: Inspect Session Handoff**  
   Click **Print Session Handoff**; view the formatted report containing the TaRL ability level, screened students, and assigned buddies. Click **Copy Text** to copy the formatted handoff for WhatsApp/SMS.

---

## 📁 Repository Structure

```
KakshaSahay/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI (Linting, Jest, Evaluation, Playwright)
├── assets/                      # Application icons and SVG vector badges
├── css/
│   └── styles.css               # Precompiled production stylesheet
├── docs/
│   ├── accessibility-audit.md   # WCAG 2.2 AA audit results and remediation
│   ├── architecture-decisions.md# ADRs 01-10 covering architecture choices
│   ├── claim-evidence-matrix.md # Full claim-evidence mapping and phrasing rules
│   ├── competitive-analysis.md  # Multigrade analysis against DIKSHA, Khan Academy, TaRL
│   ├── demo-script.md           # 120-second live presentation script for judges
│   ├── design-rationale.md      # Pedagogical and architectural rationale for all 4 solvers
│   ├── final-acceptance-report.md# Complete final engineering acceptance report
│   ├── judge-questions.md       # Factual answers to 12 tough technical questions
│   ├── offline-test.md          # 10-step empirical offline verification protocol
│   ├── offline-validation.md    # Technical PWA caching and offline technical audit
│   └── validation-plan.md       # 4-week field pilot study methodology
├── evaluation/                  # Automated Pedagogical Evaluation Harness (Phase 24)
│   ├── cases.json               # 60 authentic multigrade test cases
│   ├── evaluator.js             # Automated schema, determinism & safety evaluator
│   ├── expected-schema.json     # Strict JSON schema definition
│   └── results.json             # Persisted benchmark output (100% pass)
├── js/
│   ├── app.js                   # Application controller and modal coordinator
│   ├── audio.js                 # Web Audio synthesized bell & Web Speech API engine
│   ├── diagnostics.js           # Real-time hardware & storage latency benchmark suite
│   ├── modal.js                 # Focus-trapped accessible dialog manager
│   ├── rag.js                   # Deterministic curriculum bank & educational safety guards
│   ├── state.js                 # Decoupled reactive StateStore & 3-grade classroom engine
│   ├── storage.js               # Web Crypto AES-GCM / XOR fallback storage vault
│   ├── timer.js                 # True delta clock with background throttling protection
│   └── voice.js                 # Voice command dispatcher
├── tests/
│   ├── a11y.spec.js             # Playwright + axe-core WCAG 2.2 AA regression tests
│   ├── classroom.test.js        # Centralized classroom state & lifecycle unit tests
│   ├── e2e.spec.js              # Playwright end-to-end integration workflows (14 tests)
│   ├── level.test.js            # TaRL ability level & session summary unit tests
│   ├── pedagogical.test.js      # Dialect reasoning & curriculum bank unit tests
│   ├── sanitizer.test.js        # DOM XSS sanitization unit tests
│   ├── state.test.js            # FSM state transitions & subscriber unit tests
│   ├── storage.test.js          # StorageVault encryption & persistence unit tests
│   └── timer.test.js            # Timer delta calculations & pause retention unit tests
├── index.html                   # Single-file production-ready application shell
├── eslint.config.mjs            # ESLint flat configuration
├── manifest.json                # PWA manifest
├── package.json                 # Project dependencies, scripts & metadata
├── playwright.config.js         # Playwright multi-environment test configuration
├── serve.js                     # Zero-dependency local Node static server
├── sw.js                        # Cache-first PWA Service Worker
└── tailwind.config.js           # Design system tokens
```

---

## 🔒 Security Hardening & Limitations

1. **Zero Committed Secrets:** Confirmed via full git log audit that no API keys or credentials have ever been committed.
2. **DOM XSS Defense:** All user input (student names, concept queries) is bound via `document.createElement()` and `textContent` text nodes, preventing script injection.
3. **Content Security Policy (CSP):**
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://generativelanguage.googleapis.com; frame-src https://drive.google.com; media-src 'self' blob:; img-src 'self' data:;" />
   ```
4. **Security Limitations (Honest Disclosure):**
   - Client-side API key entry in the Settings dialog is strictly an **optional developer/demo configuration**. Keys entered in the browser reside in `localStorage`.
   - Production multi-school deployments require a backend serverless proxy architecture (`Browser → Authenticated Proxy → LLM Endpoint`) to maintain enterprise secret boundaries.

---

## ♿ Accessibility Compliance & Audit

* **Target Standard:** Web Content Accessibility Guidelines (**WCAG 2.2 Level AA**).
* **Audit Document:** See [`docs/accessibility-audit.md`](docs/accessibility-audit.md).
* **Automated Audit Suite:** Audited via `@axe-core/playwright` (`tests/a11y.spec.js`).
* **Automated Violations on First-Party DOM:** **0 violations detected**.
* **Touch Target Geometry:** All buttons enforce minimum touch target geometry $\ge 40 \times 40\text{ px}$.
* **Focus Indicators:** Explicit 3px high-contrast amber/teal focus rings (`outline: 3px solid #0F766E`).

---

## 🧪 Automated Testing & Engineering Rigor

KakshaSahay maintains automated test suites across unit, benchmark, and end-to-end tiers:

### 1. Subsystem Unit Tests (Jest)
```bash
# Run unit tests
npm test

# Run unit tests with code coverage
npm run test:coverage
```
* **Coverage:** **60 passing unit tests across 8 suites** (`tests/orchestration.test.js`, `tests/classroom.test.js`, `tests/timer.test.js`, `tests/state.test.js`, `tests/storage.test.js`, `tests/sanitizer.test.js`, `tests/pedagogical.test.js`, `tests/level.test.js`).

### 2. Pedagogical Evaluation Harness (Phase 24)
```bash
# Run 60-case benchmark evaluation
npm run evaluate
```
* **Coverage:** **60/60 authentic multigrade cases passing (100.0%)** across Grades 1–3, Math/Hindi/EVS/FLN, 5 dialects, rural/urban settings, and safety boundary tests.

### 3. End-to-End & A11y Tests (Playwright)
```bash
# Run all E2E and Accessibility tests
npm run test:e2e
```
* **Coverage:** **20 automated Playwright tests passing (100%)** covering app boot, timer cycles, Bhasha Setu generation, absentee screening & reload persistence, chalkboard puzzles, bilingual toggle, audio concurrency & cross-tab coordination, DOM pruning, TaRL ability level switching, session summary & weekly dashboard, centralized classroom dashboard, demo mode, clear data modal, AudioCoordinator API, Start Classroom session CTA, adaptive teacher overrides, live offline diagnostics self-check, JSON data export, and automated axe-core WCAG 2.2 AA scans.

### 4. Code Quality & Linting
```bash
# Run ESLint pass
npm run lint
```
* Configured with ESLint 9+ flat config (`eslint.config.mjs`), passing with **0 errors and 0 warnings**.

---

## 📚 Complete Architectural & Pedagogical Documentation

* **[`ARCHITECTURE.md`](ARCHITECTURE.md)** / **[`docs/architecture.md`](docs/architecture.md)**: Full component architecture, offline data flow, and complete Mermaid diagram.
* **[`docs/pedagogical-framework.md`](docs/pedagogical-framework.md)**: FLN / NIPUN Bharat alignment, 15-minute attention span dynamics, and multigrade allocation rationales.
* **[`docs/pilot-framework.md`](docs/pilot-framework.md)**: 4-week field pilot study methodology across 3–5 rural schools in eastern UP.
* **[`docs/competitive-landscape.md`](docs/competitive-landscape.md)**: Deep comparative analysis vs DIKSHA, Khan Academy, Duolingo, Pratham TaRL kits, and generic LLMs.
* **[`SECURITY.md`](SECURITY.md)**: Threat model for rural schools, CSP lockdown, DOM XSS prevention, and Web Crypto storage vault.
* **[`TESTING.md`](TESTING.md)**: Multi-tier testing strategy, coverage metrics, and local reproduction commands.
* **[`LIMITATIONS.md`](LIMITATIONS.md)**: Transparent hardware, TTS voice pack, PWA storage eviction, and empirical validation disclaimers.
* **[`FINAL_AUDIT.md`](FINAL_AUDIT.md)**: Complete QA audit checklist certifying Sections A through F.

---

## 📊 Credibility Framework: Implemented vs. Planned

| Dimension | Feature / Claim | Status | Evidence Tier |
|:---|:---|:---:|:---:|
| **Classroom Orchestration** | 1-Teacher Multigrade Centralized Bar (Grades 1, 2, 3) | Implemented | `Verified by automated test` |
| **Explainable AI** | Deterministic Pedagogical Rationale Engine | Implemented | `Verified by automated test` |
| **Adaptive Flow** | 1-Tap "Mark Needs Support" Teacher Override | Implemented | `Verified by automated test` |
| **Diagnostics** | In-App Live Offline Diagnostics Modal & Self-Check | Implemented | `Verified by automated test` |
| **Data Sovereignty** | Clean Classroom Data JSON Export | Implemented | `Verified by automated test` |
| **Demo Automation** | 1-Click Realistic Classroom Scenario Loader | Implemented | `Verified by automated test` |
| **Core Solvers** | 15-Minute Multi-Grade Timer Engine | Implemented | `Verified by automated test` |
| **Pedagogy** | TaRL Micro-Grouping (Beginner/Dev/Proficient) | Implemented | `Verified by automated test` |
| **Core Solvers** | Bhasha Setu Local Dialect Analogies (5 Dialects) | Implemented | `Verified by automated test` |
| **Core Solvers** | 2-Minute Absentee Diagnostic & Peer Roster | Implemented | `Verified by automated test` |
| **Core Solvers** | Zero-Cost Chalkboard TLM & Train Puzzles | Implemented | `Verified by automated test` |
| **Audio Systems** | Web Audio Bell + AudioCoordinator Cross-Tab Sync | Implemented | `Verified by automated test` |
| **Data Hygiene** | Scoped `kakshasahay_*` Local Data Clear Modal | Implemented | `Verified by automated test` |
| **Reporting** | Session Summary Handoff & Weekly Dashboard | Implemented | `Verified by automated test` |
| **PWA & Offline** | Service Worker Cache-First Core Loading | Implemented | `Verified by automated test` |
| **A11y (Automated)**| WCAG 2.2 AA Automated axe-core Pass (0 violations) | Audited | `Verified by automated test` |
| **A11y (Human)** | TalkBack / NVDA Screen Reader Verification | Documented | `Requires human QA` |
| **Classroom Impact**| Reduced off-task time in multigrade rooms | Target Metric | `Not yet validated` |
| **Teacher Workload**| Pre/Post instructional fatigue reduction | Target Metric | `Not yet validated` |
| **Field Pilot Study**| 4-Week 5-Teacher Prathmik Vidyalaya Pilot | Planned | `Validation Plan` |

Detailed pilot protocol: **[`docs/pilot-framework.md`](docs/pilot-framework.md)**.  
*Disclaimer: KakshaSahay does not claim measured classroom learning impact or teacher time savings until the structured field pilot is completed.*

---

## 🚀 Quick Start & Local Preview

```bash
# 1. Clone repository
git clone https://github.com/purangsrijan91-dev/KakshaSahay.git
cd KakshaSahay

# 2. Install dependencies
npm install

# 3. Run lint pass and test suites
npm run lint
npm run evaluate
npm test
npm run test:e2e

# 4. Run local preview server
npm start
# Access http://localhost:3001
```

Or simply launch `index.html` directly in any modern desktop or mobile browser!

---

## 📄 License & Attribution

* **License:** [MIT License](LICENSE)
* **Author:** Srijan Purang
* **Mission Alignment:** Aligned with the Foundational Literacy & Numeracy guidelines of NIPUN Bharat and National Education Policy (NEP 2020).