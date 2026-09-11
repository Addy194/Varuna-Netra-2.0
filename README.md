# Varuna Netra 2.0

**Explainable maritime oil-spill intelligence using Sentinel-1 SAR, AIS vessel telemetry, environmental drift modelling and evidence-backed vessel correlation.**

> **Decision support — not a legal determination.** Varuna Netra ranks investigation candidates and preserves evidence/provenance for analyst review. It does not automatically declare legal responsibility.

## Why this project exists

Oil discharges at sea are often detected after the responsible vessel has moved away. Investigators must combine satellite imagery, vessel tracks, timing, ocean conditions and jurisdictional context quickly and defensibly.

Varuna Netra brings that workflow into one platform:

1. Register or discover a Sentinel-1 SAR scene for an area of interest.
2. Screen the imagery for dark-spot spill candidates.
3. Retrieve AIS vessel positions in the relevant space-time window.
4. Back-track the slick using available wind/current inputs.
5. Rank candidate vessels with an explainable multi-factor correlation engine.
6. Preserve the evidence timeline, provenance, review state and jurisdictional context in an investigation case.

## SIH value proposition

- **Multi-source fusion:** satellite SAR + AIS + wind/current + jurisdiction/reference data.
- **Explainable attribution:** every vessel score is decomposed into factors rather than hidden behind a black box.
- **Uncertainty-aware:** weak detections, AIS gaps, spoof indicators and close candidate scores reduce/cap attribution confidence.
- **Evidence-first workflow:** provenance, audit logs, processing versions and evidence timelines are first-class features.
- **Safe public demo:** guests can explore read-only; new users default to viewer; elevated roles require controlled approval.
- **Global architecture:** India/Mumbai is an SIH preset, but the same pipeline can operate on other AOIs.

## Architecture

```text
                   +-----------------------------+
                   |  Sentinel-1 SAR / STAC     |
                   |  Microsoft Planetary PC    |
                   +--------------+--------------+
                                  |
                                  v
+-------------+          +-------------------+          +-------------------+
| AISStream / |--------->| FastAPI backend   |<---------| Wind / current     |
| AIS imports |          |                   |          | environmental data |
+-------------+          | scene ingest      |          +-------------------+
                         | dark-spot screen  |
                         | AIS processing     |
                         | drift backtrack    |
                         | correlation engine |
                         | audit/provenance   |
                         +---------+---------+
                                   |
                                   v
                         +-------------------+
                         | MongoDB           |
                         | cases, AIS, jobs, |
                         | reviews, evidence |
                         +---------+---------+
                                   |
                                   v
                         +-------------------+
                         | React dashboard   |
                         | map + SIH demo +  |
                         | evidence workflow |
                         +-------------------+
```

## Correlation engine

The current vessel-attribution engine (`corr-1.1.0`) is deterministic and explainable. It evaluates candidate vessels using:

| Factor | What it measures |
|---|---|
| Spatial | Closest approach of the vessel track to the spill geometry |
| Temporal | Whether the vessel was near the event at a plausible time |
| Continuity | AIS coverage quality, gaps and track continuity |
| Heading | Alignment between vessel course and slick orientation |
| Drift | Agreement with the back-tracked likely source region |
| Reliability | AIS quality flags, identity availability, jumps/spoof suspicion |

The engine also:

- fills selected AIS gaps by dead reckoning while marking interpolated positions;
- penalizes or rejects kinematically implausible gap closures;
- caps statuses when spill confidence or AIS reliability is weak;
- caps ambiguous top candidates when their scores are too close;
- records algorithm version, factor contributions, fix IDs, input hash and processing log.

This is intentionally **not a legal guilt classifier**. It is an analyst-facing candidate-ranking system.

## SAR spill detection: current status

The current detector is an **experimental computer-vision dark-spot screening heuristic** based on Otsu thresholding, morphology, contour shape/elongation and contrast checks on Sentinel-1 quicklooks.

It is intentionally labelled experimental because SAR dark formations can also be caused by low wind, biogenic films, wakes and other oceanographic effects. The detector therefore produces **investigation candidates**, not automatic proof of oil.

### Important honesty note

The current detector is **not a trained SAR segmentation model**. Future work should benchmark or replace/augment it with a validated segmentation/classification model while retaining analyst review and provenance.

## Drift model

The current lightweight back-tracking model uses:

- surface current when available;
- approximately 3% downwind contribution;
- hourly reverse-Lagrangian steps;
- uncertainty growth from velocity forcing error and horizontal diffusion;
- a 2-sigma likely origin envelope.

This is suitable for prototype decision support but should be validated against an established trajectory framework and time-indexed ocean products before operational use. Planned progression includes OpenDrift/HYCOM-class modelling.

## Authentication and access model

| Role | Access |
|---|---|
| Guest | Read-only exploration |
| Viewer | Authenticated read-only user |
| Analyst | Investigation/analysis operations |
| Supervisor | Elevated review/operational functions |
| Admin | User, role and system administration |

Public signup is forced server-side to the lowest persistent role (`viewer`). Users cannot self-assign analyst, supervisor or admin privileges. Role elevation is handled through the controlled request/approval flow.

## Main technology stack

### Frontend

- React 19
- React Router
- Leaflet / React-Leaflet
- Recharts
- Tailwind CSS
- Axios

### Backend

- FastAPI
- Python
- Motor / MongoDB
- Shapely
- NumPy / SciPy / Pandas
- OpenCV
- Pillow
- PyJWT / bcrypt
- PyMuPDF / ReportLab
- WebSockets / async workers

### External data/services

- Microsoft Planetary Computer STAC (`sentinel-1-grd`)
- AISStream where configured
- Resend for optional email delivery
- Google authentication where configured
- Object storage integration where configured

## Repository layout

```text
backend/                 FastAPI API, correlation, detection, drift, jobs, auth
backend/routers/         API route modules
backend/tests/           Backend test suite
frontend/                React application
frontend/src/            UI, dashboard, maps, SIH walkthrough
memory/                  Local runtime/development state (must not contain secrets)
tests/                   Additional test assets
.github/workflows/       CI quality gates
SECURITY.md              Security and secret-handling guidance
docs/VALIDATION.md       Validation plan and evidence requirements
```

## Local setup

### 1. Backend

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
```

Configure at minimum:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=varuna_netra
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
```

Then start the API from `backend/`:

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
yarn install
yarn start
```

The frontend expects `REACT_APP_BACKEND_URL` to point to the backend origin.

## Environment variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example).

Secrets must never be committed. Production secrets should be injected through the deployment platform's secret/environment-variable system.

## Testing

Backend tests are under `backend/tests/` and include coverage for authentication/RBAC, public guest/viewer flows, security remediation and correlation behaviour.

Typical backend command:

```bash
cd backend
pytest -q
```

Frontend build/lint:

```bash
cd frontend
yarn lint
yarn build
```

CI is defined in `.github/workflows/ci.yml`.

## Validation before operational claims

A production-grade evaluation should report, at minimum:

### Spill detector

- labelled Sentinel-1 scene count;
- geographic diversity;
- true positives / false positives / false negatives;
- precision, recall and F1;
- segmentation IoU/Dice if polygon segmentation is evaluated;
- inference latency;
- results broken down by detector version.

### Vessel correlation

- labelled or controlled incidents;
- Top-1 and Top-3 candidate accuracy;
- performance with/without environmental data;
- sensitivity to AIS gaps;
- ambiguity rate;
- failure cases and confidence calibration.

Until those metrics exist on a sufficiently representative dataset, the platform should be presented as **decision support under validation**, not a validated enforcement system.

See [`docs/VALIDATION.md`](docs/VALIDATION.md).

## SIH judge walkthrough

The application includes a dedicated **Run SIH Demo** flow designed to show:

1. Problem and operational context
2. Area of interest
3. Sentinel-1 scene provenance
4. Spill candidate
5. AIS coverage
6. Candidate ranking and "Why this vessel?"
7. Evidence timeline
8. Jurisdictional context
9. Provenance
10. Full investigation case

For judging, prefer a pinned reference case with real Sentinel-1 provenance and real/historical AIS evidence rather than simulated data.

## Security

This repository previously contained generated credential/test artifacts. Treat any secret that was ever committed as exposed, even after the latest file is deleted.

Follow [`SECURITY.md`](SECURITY.md) to rotate credentials and remove sensitive blobs from Git history before final public submission.

## Known limitations

- SAR dark-spot detection is experimental and can produce lookalike false positives.
- The current drift model is lightweight and requires scientific validation for operational use.
- AIS coverage is dependent on the configured provider and may contain gaps/spoofed positions.
- In-process job execution is suitable for a prototype but should move to a durable distributed queue for larger deployments.
- Jurisdiction layers are reference context, not a substitute for authoritative legal determination.

## Roadmap

- Validated Sentinel-1 oil-slick segmentation/classification model
- Benchmark dataset and published detector/correlation metrics
- Time-indexed operational wind/current ingestion
- OpenDrift/HYCOM-class trajectory modelling
- Durable distributed job queue (Redis/RabbitMQ + worker tier)
- Stronger dark-vessel and multi-sensor fusion
- Automated validation/evidence reports
- Containerized deployment and stronger observability

## Project principle

**Detect cautiously. Correlate transparently. Preserve evidence. Keep the analyst in control.**
