# Validation Plan

Varuna Netra is a decision-support prototype. This document defines the evidence required before making strong operational accuracy claims.

## 1. SAR dark-spot detector

### Current implementation

The present detector is an experimental computer-vision heuristic using thresholding, morphology, contrast and contour-shape filtering. It is not a trained segmentation model.

### Dataset requirements

Build a labelled Sentinel-1 GRD evaluation set with:

- confirmed/credible oil-slick examples;
- hard negatives such as low-wind areas, wakes, biogenic films and natural lookalikes;
- multiple seasons and sea states;
- multiple geographic regions;
- preserved acquisition metadata and analyst labels.

Keep training/tuning scenes separate from final evaluation scenes if a learned model is introduced.

### Metrics

Report:

- number of scenes;
- number of labelled slicks/lookalikes;
- TP / FP / FN;
- precision;
- recall;
- F1 score;
- false positives per scene;
- IoU/Dice for polygon segmentation where applicable;
- median/95th-percentile inference latency;
- metrics by detector version.

Do not publish a single precision number without the underlying sample size.

## 2. Vessel-correlation engine

The correlation engine should be validated independently from spill detection.

### Evaluation cases

Use incidents or controlled scenarios where the likely/known source vessel is available from trusted records. For each case preserve:

- event/acquisition time;
- slick geometry;
- AIS history;
- wind/current inputs;
- expected/known vessel where available;
- provenance of the ground-truth label.

### Metrics

Report:

- Top-1 accuracy;
- Top-3 recall;
- mean reciprocal rank;
- ambiguity rate;
- no-candidate rate;
- performance by AIS coverage quality;
- performance with vs. without environmental data;
- failure cases where the responsible vessel is absent from AIS;
- calibration of score/confidence band against correctness.

### Ablation tests

Run the engine with individual factors disabled to show what each contributes:

- no drift;
- no heading;
- no continuity/reliability penalty;
- no gap fill;
- spatial + temporal only.

This is particularly useful for SIH judging because it proves the ranking is not arbitrary.

## 3. Drift model

The current lightweight reverse-Lagrangian model must be validated against stronger references before operational use.

Recommended checks:

- compare back-tracked origin estimates with OpenDrift or another established trajectory system;
- test multiple wind/current regimes;
- compare error as a function of spill age;
- record sensitivity to the wind-leeway coefficient;
- report the percentage of known sources falling inside 1-sigma / 2-sigma envelopes.

## 4. AIS integrity

Track and report:

- fraction of candidates with large AIS gaps;
- interpolated vs. transmitted fix counts;
- implausible jump/spoof flags;
- missing vessel identity fields;
- provider/source of each fix;
- temporal age of the latest AIS data.

Never present interpolated positions as transmitted AIS positions.

## 5. System performance

Measure end-to-end:

- scene discovery latency;
- preview/quicklook retrieval latency;
- detection latency;
- candidate-correlation latency;
- evidence/PDF generation latency;
- dashboard API p50/p95 latency;
- failure/retry counts for background jobs.

## 6. Security and access tests

Minimum acceptance tests:

- guest cannot write;
- viewer cannot call privileged endpoints;
- public signup cannot self-assign analyst/supervisor/admin;
- disabled users cannot log in or reactivate themselves;
- admin-only functions require current server-side role checks;
- auth endpoints are rate-limited;
- password-reset flow does not reveal whether an account exists;
- health/status responses do not leak API keys/tokens;
- repository secret scan is clean.

## 7. Evidence to show SIH judges

A strong judge-facing validation card should show only measured values:

| Evidence | Status |
|---|---|
| Detector version | display runtime version |
| Correlation version | display runtime version |
| Evaluation scene count | measured value only |
| Detector precision/recall/F1 | measured values only |
| Correlation Top-1/Top-3 | measured values only |
| Backend test pass count | latest CI value |
| Last real Sentinel-1 acquisition | runtime provenance |
| AIS provider/mode | runtime provenance |
| Drift input availability | runtime provenance |

If a metric has not been measured, display **NOT YET VALIDATED** rather than a placeholder percentage.

## 8. Claim language

Use:

- "experimental dark-spot detector"
- "candidate vessel ranking"
- "decision support"
- "analyst review required"
- "reference jurisdiction boundary"

Avoid until supported by validated evidence:

- "proves the polluter"
- "100% accurate"
- "AI identifies the guilty vessel"
- "real-time satellite detection" when the acquisition is historical
- "legally determines jurisdiction/responsibility"

## 9. Definition of SIH-ready validation

The system is presentation-ready when:

- no secrets are present in current Git history intended for publication;
- the reference demo case has real provenance;
- the detector limitation is disclosed;
- all numbers shown to judges are generated from stored/runtime data;
- at least one reproducible validation dataset/report is available;
- the correlation engine can explain why rank #1 exceeds rank #2;
- CI passes on the submitted commit.
