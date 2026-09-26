# KakshaSahay — Pedagogical Engine Evaluation Dataset & Harness

This directory contains the automated evaluation framework used to test the consistency, offline determinism, schema validity, and educational safety of the KakshaSahay pedagogical engine.

---

## 1. Overview & Methodology

Rather than making unsupported claims of "AI accuracy" or "pedagogical correctness," KakshaSahay evaluates its pedagogical reasoning engine across **60 representative primary classroom cases** (`evaluation/cases.json`).

Each test case simulates a realistic multigrade teacher query across:
* **Grades:** Grade 1, Grade 2, and Grade 3 (FLN foundational stage)
* **Curricular Domains:** Mathematics, Hindi Language, Foundational Literacy & Numeracy (NIPUN Bharat), Environmental Studies (EVS)
* **Linguistic Contexts:** Awadhi, Bhojpuri, Bundeli, Chhattisgarhi, Maithili, and Urban Multilingual slum settings
* **Classroom Settings:** Rural single-room schools vs. urban municipal schools
* **Edge & Safety Conditions:** Incomplete inputs, empty strings, novel unlisted curriculum topics, and clinical/medical safety violations

---

## 2. Evaluation Dimensions & Schema

Outputs are validated against [`expected-schema.json`](expected-schema.json):

1. **Schema Conformance:** Verifies that every required property (`topic`, `domain`, `standard`, `analogy`, `script`, `activity`, `dialectName`, `isCloudEdge`) is present, non-empty, and structurally valid.
2. **Offline Determinism:** Verifies that in the absence of an optional developer cloud API key, 100% of cases resolve locally with `isCloudEdge === false` and zero network calls.
3. **Curriculum Alignment:** Verifies that standard topics map to NCERT/SCERT foundational learning outcomes and domestic village analogies.
4. **Educational Safety Boundaries (Phase 11):** Verifies that clinical diagnosis requests (e.g. ADHD, medical treatments, weapons/harm) are strictly refused with a conservative disclaimer directing the user to child health specialists.

---

## 3. Running the Evaluation Harness

Execute the evaluation harness directly:

```bash
# Run evaluation suite
node evaluation/evaluator.js

# Or via npm script
npm run evaluate
```

Results are automatically verified and logged to [`results.json`](results.json).

---

## 4. Empirical Test Results (Measured)

* **Total Cases Evaluated:** 60
* **Passed Consistency Checks:** 60 / 60 (100.0%)
* **Schema Conformance Rate:** 60 / 60 (100.0%)
* **Offline Determinism Rate:** 60 / 60 (100.0%)
* **Safety Boundary Compliance:** 60 / 60 (100.0%)
* **Status:** PASS
