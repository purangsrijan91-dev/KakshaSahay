# KakshaSahay: Technical Offline Audit & Validation Protocol

> **Document ID:** DOC-OFFLINE-2026-V2  
> **Audited By:** PWA & Offline Systems Architect  
> **Target Standard:** Offline-First Progressive Web App (PWA) under intermittent connectivity  
> **Evidence Tier:** `Verified in code` | `Verified by automated test` | `Verified manually`

---

## 1. Architectural Scope of Offline Guarantees

KakshaSahay is explicitly engineered for **single-teacher rural primary schools operating in zero-to-intermittent connectivity environments**. 

### 1.1 What is 100% Offline (Guaranteed)
Once the application shell is cached on the teacher's browser or device (upon first load or install), the following subsystems operate with **zero network requests, zero cloud latency, and zero data cost**:
1. **15-Minute Multi-Grade Rotation Engine:**
   * Drift-free hardware delta clock (`Date.now() - startTime`).
   * Multi-frequency acoustic chime generated client-side via `AudioContext` sine-wave oscillators (`659.25 Hz` and `880.0 Hz`).
   * TaRL ability-level grouping (`Beginner`, `Developing`, `Proficient`) with dynamic micro-script generation.
2. **Centralized Classroom State Model:**
   * Simultaneous 3-grade allocation tracking (Grades 1, 2, 3 active concurrently).
   * Deterministic Explainable Rationale generation for pedagogical allocations.
3. **Language Bridge (Bhasha Setu):**
   * Curated offline NCERT/NIPUN curriculum database across Grades 1–3 in Hindi, Mathematics, and English.
   * On-device vernacular analogy generator mapping textbook concepts to Awadhi, Bhojpuri, Bundeli, Chhattisgarhi, and Maithili home contexts.
4. **Rapid Absenteeism Recovery (Triage):**
   * 2-minute oral diagnostic screening workflow.
   * Front-row peer buddy matching and persistent roster saved to browser `localStorage`.
5. **Zero-Cost Chalkboard TLM & Practice Generator:**
   * Interactive ASCII missing number train puzzles with client-side verification.
   * Dynamic concrete addition/subtraction problem generation with real-time mastery tracking.
   * Manipulative guidance for slates, pebbles, chalk, and twigs.
6. **Bilingual User Interface:**
   * Instantaneous toggle between English and Hindi (`en` ⟷ `hi`) via in-memory dictionary.
7. **Local Data Management:**
   * Safe, scoped deletion of all `kakshasahay_*` keys via confirmation dialog.

### 1.2 What Requires Internet Connectivity (Explicitly Disclosed)
1. **Field Documentation Video:**
   * The embedded 90-second observational video relies on an external Google Drive stream.
   * When offline, the player container automatically detects disconnected state (`navigator.onLine === false`) and renders a prominent high-contrast fallback notice (`#video-offline-notice`) explaining that all core teaching tools remain fully functional without video.
2. **Cloud Edge LLM (Optional):**
   * Experimental Google Gemini 2.5 Flash API calls require active connectivity and a user-provided API key. Core classroom operations never call this endpoint.

---

## 2. PWA Caching Strategy (`sw.js`)

KakshaSahay utilizes a hybrid Service Worker architecture to ensure both instant offline access and seamless deployment updates:

```
├── Navigation Requests (index.html): Network-First with Cache Fallback
│   ├── Online: Fetches latest version from GitHub Pages, updates cache in background
│   └── Offline: Delivers cached index.html with 0ms delay
│
└── Static Assets (CSS, JS, manifest, SVG icons): Stale-While-Revalidate
    ├── Delivers cached asset immediately to avoid render blocking
    └── Fetches network update in background to refresh cache for next launch
```

### Pre-Cached Core Assets Inventory:
* `./`
* `./index.html`
* `./css/styles.css`
* `./manifest.json`
* `./assets/icon.svg`
* `./sw.js`
* `./js/bhasha-data.js`
* `./js/state.js`
* `./js/timer.js`
* `./js/audio.js`
* `./js/storage.js`
* `./js/modal.js`
* `./js/rag.js`
* `./js/voice.js`
* `./js/diagnostics.js`
* `./js/app.js`

---

## 3. Automated Offline Verification Protocol

### Test Case 1: Physical & Emulated Disconnect Execution
* **Automated Runner:** Playwright test suite (`tests/e2e.spec.js`)
* **Procedure:**
  ```javascript
  // 1. Warm cache on first page load
  await page.goto('http://localhost:3001');
  
  // 2. Cut network connection completely
  await context.setOffline(true);
  
  // 3. Trigger hard refresh
  await page.reload();
  
  // 4. Verify app shell renders with correct branding
  await expect(page.locator('header h1')).toContainText('KakshaSahay');
  ```
* **Status:** ✅ `PASS` (Verified in automated CI test suite)

### Test Case 2: 15-Minute Timer Drift Under Simulated Backgrounding
* **Methodology:** Verified that `setInterval` does not calculate remaining seconds via naive decrement (`remaining = remaining - 1`). Instead, it calculates:
  $$\text{remainingSeconds} = \max\left(0, \left\lceil \frac{\text{targetEpoch} - \text{Date.now()}}{1000} \right\rceil\right)$$
* **Result:** When the browser throttles background tabs or the screen dims on mobile, the hardware clock delta resynchronizes instantly upon reactivation without temporal drift.
* **Status:** ✅ `PASS` (Verified in `tests/timer.test.js` and `tests/e2e.spec.js`)

### Test Case 3: Offline Acoustic Bell Generation
* **Methodology:** Tested audio generation with physical network cable disconnected and airplane mode enabled on Android test device.
* **Mechanism:** Synthesizes audio using native Web Audio API oscillators (`AudioContext`). Does not request external `.mp3`, `.wav`, or `.ogg` media files.
* **Status:** ✅ `PASS` (Verified in code and manual audio audit)

### Test Case 4: Storage Vault Fault Tolerance
* **Methodology:** Simulated storage quota exhaustion and malformed JSON in `localStorage`.
* **Behavior:** `StorageVault` catches parse exceptions, outputs a structured console warning, and recovers with default in-memory structures without crashing DOM rendering.
* **Status:** ✅ `PASS` (Verified in `tests/storage.test.js`)

---

## 4. Hardware and Platform Compatibility

| Platform / Browser | Version Tested | Offline Shell Boot | Audio Chime | LocalStorage Persistence | Overall Result |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Android Chrome** (Mobile) | 126+ | ✅ Instant | ✅ Working | ✅ Working | **Fully Supported** |
| **Desktop Google Chrome** | 128+ | ✅ Instant | ✅ Working | ✅ Working | **Fully Supported** |
| **Desktop Microsoft Edge** | 128+ | ✅ Instant | ✅ Working | ✅ Working | **Fully Supported** |
| **Mozilla Firefox** | 129+ | ✅ Instant | ✅ Working | ✅ Working | **Fully Supported** |
| **Apple Safari** (iOS 17+) | 17.4+ | ✅ Instant | ⚠️ User touch required for AudioContext | ✅ Working | **Supported with touch activation** |

> [!NOTE]
> iOS Safari requires a direct user touch gesture to initialize the `AudioContext` before audio can play. In KakshaSahay, the initial tap on "Start 15-Min Cycle" satisfies this requirement.
