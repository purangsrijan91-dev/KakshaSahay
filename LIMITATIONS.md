# KakshaSahay — Engineering Limitations & Operational Boundaries

## 1. Transparency Principle

Engineering credibility requires candid disclosure of architectural boundaries, operating assumptions, and hardware constraints. This document details the technical and operational boundaries of **KakshaSahay (कक्षासहाय)**.

---

## 2. Technical & Hardware Boundaries

### 2.1. Browser & Operating System Requirements
- **Target Platform:** Progressive Web App (PWA) running on modern evergreen web browsers (Chromium $\ge 88$, Firefox $\ge 85$, Safari $\ge 14.1$) on Android, iOS, or desktop operating systems.
- **Legacy Android WebViews:** Low-cost entry-level smartphones running Android 7 or older with un-updated Google Play Services / Android System WebViews may fail on modern CSS Grid, `SubtleCrypto`, or `BroadcastChannel` APIs. KakshaSahay provides basic fallbacks (e.g. XOR storage cipher), but optimal execution requires Android 9+.

### 2.2. Hardware Text-to-Speech (TTS) Voice Pack Availability
- **Constraint:** The Web Speech API relies on operating-system-level speech synthesizers.
- **Rural Edge Reality:** Some ultra-budget Android devices (e.g., $1\text{GB RAM}$ handsets) ship without pre-installed Devanagari/Hindi (`hi-IN`) voice packs.
- **Graceful Handling:** In the absence of a Hindi voice pack, KakshaSahay automatically detects the missing voice, alerts the teacher via a high-contrast visual notice (*"⚠️ आपके डिवाइस में हिंदी वॉइस पैक नहीं है। कृपया स्क्रीन पर संवाद पढ़ें।"*), and routes the dialogue to the `aria-live` screen-reader region. Audio synthesis cannot occur without an OS-level voice pack.

### 2.3. PWA Storage Reclamation & Cache Lifespans
- **Constraint:** Mobile operating systems (particularly Android OEM skins like MIUI, ColorOS, or aggressive battery savers) automatically evict PWA Cache Storage and `localStorage` when device free storage drops below $5\%$.
- **Mitigation:** The application footprint is kept exceptionally small ($< 1.5\text{MB}$ total static payload). However, if an aggressive OS cleans storage, the teacher must briefly connect to mobile data to re-prime the Service Worker cache.

### 2.4. Single-Teacher Invariant Model
- **Constraint:** The orchestration engine mathematically enforces a single-teacher invariant:
  $$\sum \text{Teacher-Led} = 1$$
- **Operational Boundary:** In schools where multiple teachers co-teach in the same room (e.g., team-teaching or volunteer assistant models), the current engine does not split direct instruction between two educators within the same active session view.

### 2.5. Edge Cloud AI Disclaimers
- **Constraint:** Cloud LLM features (such as experimental Gemini Flash edge queries) are strictly developer-evaluative and require an active internet connection and API key.
- **Core Independence:** All 4 core solvers (15-Minute Rotation Engine, Bhasha Setu, Absenteeism Catch-Up Triage, Zero-Cost TLM Practice Generator) are 100% offline and do NOT depend on external APIs.

---

## 3. Pedagogical & Field Claims Disclaimer

> [!WARNING]
> **No Fabricated Impact Claims:** KakshaSahay does **NOT** claim measured student learning gains, test score improvements, or formal state government accreditation prior to empirical verification.

- **Automated Tests vs. Field Studies:** All statistics reported in engineering documentation (e.g. "60/60 tests passing", "100% schema conformance", "0 a11y violations") refer strictly to automated software unit, evaluation, and end-to-end regression suites.
- **Pilot Dependency:** Measurable improvements in student Foundational Literacy and Numeracy (FLN) or teacher time efficiency require empirical completion of the proposed **4-week multi-school field pilot study** documented in [`docs/pilot-framework.md`](docs/pilot-framework.md).
