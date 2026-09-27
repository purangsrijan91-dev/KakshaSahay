# KakshaSahay — 4-Week Multi-School Field Pilot Protocol

## 1. Pilot Mission & Non-Negotiable Governance Disclaimer

> [!IMPORTANT]
> **Field Validation Disclaimer:** *KakshaSahay does not make unsubstantiated claims of quantified learning gains or government accreditation prior to empirical verification.* This document outlines the rigorous, evidence-driven 4-week field pilot study designed to measure operational feasibility, teacher cognitive relief, and student engagement in authentic multigrade classrooms.

---

## 2. Target Context & School Selection Criteria

The pilot study is structured for **3 to 5 government primary schools (Prathmik Vidyalayas)** in rural districts characterized by high multigrade prevalence and linguistic transition (e.g., Mirzapur or Sonbhadra districts in eastern Uttar Pradesh):

### Selection Criteria:
1. **Multigrade Structure:** 1 teacher managing Grades 1, 2, and 3 concurrently in a single physical classroom.
2. **Device Baseline:** Teacher owns a low-to-mid range Android smartphone or tablet (minimum Android 9+, 2GB RAM, Chrome browser).
3. **Linguistic Context:** Classrooms where the home dialect (Bhojpuri / Awadhi / Bagheli) differs from standard school textbook Hindi (*Khariboli*).
4. **Attendance Profile:** Schools experiencing episodic student absenteeism due to seasonal agricultural work or local market days.

---

## 3. Four-Week Pilot Timeline & Protocols

```
+---------------------------------------------------------------------------------+
| Week 0: Baseline & Setup | Pre-test FLN assessment, 30-min PWA caching, TLM kit   |
| Week 1: Rotation Engine  | Establish 15-min cycles, acoustic bell cues, slate tasks |
| Week 2: Bhasha & Triage  | Dialect analogies, 2-min absentee oral catch-up checks   |
| Week 3: Midline Checks   | Spot-check observation, adaptive overrides audit         |
| Week 4: Endline & Audit  | Post-test FLN assessment, NASA-TLX teacher survey        |
+---------------------------------------------------------------------------------+
```

### Week 0: Baseline Setup & Pre-Testing
- **Hardware Pre-Check:** Verify Service Worker registration, cache offline bundle, test acoustic bell volume and Hindi TTS fallback on teacher's actual phone.
- **Zero-Cost TLM Preparation:** Verify classroom has sufficient slates, chalk, and counting pebbles/seeds.
- **Baseline FLN Assessment:** 1-on-1 baseline screening of 20 students per school across letter recognition, 1-to-1 counting, and 2-digit numeral identification.

### Week 1: Multigrade Rotation Familiarization
- Teacher activates **15-Minute Multi-Grade Rotation Engine**.
- Observe student transition behaviors during the acoustic bell chime.
- Train students on independent slate tasks (Grade 2) and peer dyad cooperation (Grade 3).

### Week 2: Bhasha Setu & Absentee Catch-Up Integration
- Teacher deploys **Bhasha Setu** for 2 core concepts daily (Math and Language).
- Returning absent students undergo the **2-Minute Oral Diagnostic Screening** and receive a designated front-row buddy.

### Week 3: Midline Observation & Adaptive Override Testing
- Field researcher conducts structured 45-minute classroom observations using 3-minute momentary time sampling.
- Teacher utilizes the **"🙋 Mark Needs Support"** adaptive override whenever conceptual struggles occur; audit trail is logged locally.

### Week 4: Endline Evaluation & Teacher Debrief
- **Endline FLN Assessment:** Re-test student cohort using parallel-form assessment tools.
- **Local Data Export:** Teacher clicks "Export Classroom Data" to generate session JSON report.
- **Qualitative Teacher Interviews:** Adapted NASA-TLX survey measuring perceived cognitive load, classroom control, and perceived usability.

---

## 4. Quantitative & Qualitative Evaluation Metrics

| Metric Category | Specific Indicator | Measurement Tool | Target Hypothesis |
| :--- | :--- | :--- | :--- |
| **Classroom Engagement** | Active Academic Engaged Time (AET) | 3-minute momentary time sampling | AET $\ge 68\%$ across all 3 grades simultaneously. |
| **Teacher Cognitive Load** | Unplanned Teacher Interruptions | Observer event-frequency tally | $\le 2$ student interruptions per 15-minute direct instruction block. |
| **Pedagogical Flow** | Grade Transition Latency | Stopwatch timing between bell and next task start | Transition completed in $< 90\text{ seconds}$. |
| **Absentee Recovery** | Time-to-Reintegration | Screening records & teacher log | Absentee reintegrated into grade-level task within 2 classroom days. |
| **System Reliability** | Offline Uptime & Zero Crash Rate | Diagnostic test log in local vault | 100% offline completion without network call failures. |
| **Teacher Satisfaction** | Adapted NASA-TLX Cognitive Load | 10-point Likert scale interview | $\ge 30\%$ reduction in reported end-of-day teacher fatigue. |

---

## 5. Field Observation Rubric (Momentary Time Sampling)

Every 3 minutes across a 45-minute classroom session, the observer records the status of each grade group:

```
Timestamp: [MM:SS]
Grade 1: [ ] On-Task Teacher-Led  [ ] On-Task Independent  [ ] Off-Task / Idle
Grade 2: [ ] On-Task Teacher-Led  [ ] On-Task Independent  [ ] Off-Task / Idle
Grade 3: [ ] On-Task Teacher-Led  [ ] On-Task Peer Dyad    [ ] Off-Task / Idle

Acoustic Bell Reaction: [ ] Immediate Switch  [ ] Delayed (>60s)  [ ] Ignored
Teacher Distraction Level: [ ] Focused on Target Grade  [ ] Managing Out-of-Focus Disruption
```

---

## 6. Data Integrity & Ethical Safeguards

1. **Child Data Anonymization:** No child's full name, Aadhaar number, or biometric identifier is recorded. All local records use random IDs (`diag_01`, `diag_02`).
2. **Local Storage Quarantine:** All pilot data is stored in the teacher's browser memory under `kakshasahay_` namespace. No data is transmitted to third-party cloud analytics.
3. **Informed Consent:** Consent is obtained from headmasters and village education committees (SMC - School Management Committee) prior to classroom observations.
