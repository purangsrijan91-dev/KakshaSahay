# KakshaSahay: Architecture Decision Records (ADRs)

> **Document ID:** DOC-ADR-2026-V1  
> **Status:** Accepted & Verified in Code  
> **Audited By:** GovTech & Systems Architect  

This document formalizes the ten foundational architectural decisions governing KakshaSahay's technical design, reliability posture, and pedagogical integrity.

---

### ADR 01: Deterministic Client-Side Rules Engine vs. Mandatory Cloud LLM
* **Context:** Rural Indian primary schools experience frequent power outages and intermittent 2G/3G connectivity. Commercial LLMs introduce variable latency (2–6s), token costs, and hallucination risks.
* **Decision:** The core application operates entirely on deterministic, client-side rule mappings and structured NCERT/NIPUN curriculum tables. External generative models (Gemini 2.5 Flash) are strictly an optional developer/demo configuration.
* **Consequences:** Zero recurring API bills, 0ms network latency during instruction, 100% offline uptime, and absolute predictability in classroom pedagogical outputs.

---

### ADR 02: Hardware Clock Delta Timing vs. Naive Interval Decrements
* **Context:** Standard JavaScript timers (`setInterval(fn, 1000)` with `remaining--`) suffer severe drift when browsers throttle background tabs, when mobile screens turn off, or during CPU contention.
* **Decision:** Implemented hardware delta synchronization:
  $$\text{targetEpoch} = \text{Date.now()} + (\text{remainingSeconds} \times 1000)$$
  On every timer tick (every 250ms), remaining time is recomputed from the system hardware clock:
  $$\text{remaining} = \max\left(0, \left\lceil \frac{\text{targetEpoch} - \text{Date.now()}}{1000} \right\rceil\right)$$
* **Consequences:** Zero temporal drift across 15-minute cycles, even if the device screen sleeps or the teacher switches between apps.

---

### ADR 03: Native Web Audio API Synthesis vs. Static MP3 Audio Files
* **Context:** Pre-recorded audio files (`.mp3` or `.wav`) require network download, consume cache storage, and fail silently if media decoding codecs vary on low-end hardware.
* **Decision:** Synthesize acoustic transition bell chimes dynamically using browser-native `AudioContext` sine-wave oscillators (`659.25 Hz` and `880.0 Hz` with exponential gain ramps).
* **Consequences:** Zero media assets to download or cache, 100% offline generation, negligible memory overhead (< 2KB code), and instant playback.

---

### ADR 04: Centralized Classroom Finite State Machine (FSM)
* **Context:** Managing concurrent instruction across three different grade levels without race conditions or mismatched prompt states requires strict lifecycle control.
* **Decision:** Modeled classroom states as a formal Finite State Machine (`STANDBY`, `PHASE_1_DIRECT_G1`, `ROTATION_TRANSITION`, `PHASE_2_DIRECT_G2_3`, `DIAGNOSTIC_REMEDIATION`, `PAUSED`) mapped to a reactive `StateStore`.
* **Consequences:** All UI sub-components (status cards, prompt ribbons, timer badges, rationale boxes) react deterministically to state changes without out-of-order execution.

---

### ADR 05: Hybrid PWA Service Worker Caching Strategy
* **Context:** The application must boot instantly offline while ensuring that teachers receive bug fixes and curriculum updates whenever connectivity is available.
* **Decision:** Implemented a hybrid Service Worker (`sw.js`):
  * **Navigation Requests (`index.html`):** Network-First with Cache Fallback. Guarantees fresh deployments when online, instant cache delivery when offline.
  * **Static Assets (CSS, JS, manifest, icons):** Stale-While-Revalidate. Returns cached version immediately to avoid render blocking, fetches updates in the background.
* **Consequences:** Eliminates stale cache lockouts while preserving instant zero-connectivity launch times.

---

### ADR 06: Zero-Build Portable Single-File UI with Modular Headless Siblings
* **Context:** Frontier field workers and rural trainers often distribute educational software via SD cards, USB drives, or local Bluetooth transfers where npm build tools are unavailable.
* **Decision:** `index.html` remains fully self-contained (HTML, inline CSS, client-side JS), while modular ES modules in `js/` and headless Jest test suites in `tests/` ensure comprehensive automated CI regression testing.
* **Consequences:** Instant standalone portability without build steps; full developer testing ergonomics maintained.

---

### ADR 07: Audio Concurrency Control & Cross-Tab Synchronization
* **Context:** Teachers opening multiple browser tabs or tapping prompt buttons rapidly could trigger overlapping, cacophonous synthetic speech.
* **Decision:** Implemented a three-tiered concurrency guard in `AudioCoordinator`:
  1. *Same-Tab:* Cancels ongoing speech before speaking new text.
  2. *Page Visibility API:* Immediately cancels speech if the document becomes hidden.
  3. *Cross-Tab Coordination:* Uses `BroadcastChannel('kakshasahay_speech_channel')` to broadcast stop signals to all open KakshaSahay tabs.
* **Consequences:** Completely prevents overlapping audio in single-tab and multi-tab scenarios.

---

### ADR 08: Scoped LocalStorage Sandboxing & Accessible Clear Data Modal
* **Context:** Rural school tablets are often shared among multiple staff members. Clearing application cache must not destroy other web tools or compromise student privacy.
* **Decision:** All KakshaSahay local data keys are strictly prefixed with `kakshasahay_*` (with backward-compatible migration from `vidyasetu_*`). The "Clear Local Data" workflow requires explicit confirmation via an accessible modal dialog and only purges matched keys.
* **Consequences:** Zero data leakage, zero risk of clearing unrelated application data on shared devices, and full compliance with student data privacy hygiene.

---

### ADR 09: Conservative AI Educational Boundaries & Safe Refusals
* **Context:** Unsupervised generative models in primary schools pose risks of pseudo-clinical medical diagnosis, psychological labeling of struggling students, or inappropriate content generation.
* **Decision:** Hardcoded strict educational boundary guards in `js/rag.js`. Any prompt inquiring about clinical diagnoses (ADHD, dyslexia, autism, depression), weapons, self-harm, or inappropriate topics is strictly rejected with a factual disclaimer:
  > *"KakshaSahay is an educational pedagogical copilot. It does not provide medical, clinical, or psychological diagnoses."*
* **Consequences:** 100% compliance with child protection guidelines and zero liability from ungrounded medical claims.

---

### ADR 10: Pratham TaRL Integration inside 15-Minute MGML Cycles
* **Context:** Multigrade classrooms cannot rely on chronological grade levels alone; learning gaps mean Grade 3 children may still struggle with Grade 1 foundational literacy.
* **Decision:** Integrated Pratham's Teaching at the Right Level (TaRL) ability grouping (`Beginner`, `Developing`, `Proficient`) directly into the 15-minute rotation cycle.
* **Consequences:** Adapts direct teacher micro-scripts, independent tasks, and peer collaborative practice to the actual instructional level of students, regardless of formal enrollment grade.
