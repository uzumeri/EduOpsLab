<!--Copyright (c) 2026 Mustafa Uzumeri. All rights reserved.-->

# EduOpsLab — AI Context

This is a **private, self-contained workbench** for exploring operations management principles applied to education — and for building working demo applications that illustrate those principles.

All context needed to work in this repo is here. There are no cross-repo dependencies.

---

## Repo Purpose

Apply three core operations management principles to reframe how education works and where AI belongs in it:

1. **Constraint (TOC)** — Teacher time is the bottleneck. Design everything to exploit it.
2. **Co-production** — Students are factor inputs, not passive recipients. Teaching is a joint process, not content delivery.
3. **Flow vs. Batch** — Lockstep cohort scheduling hides variability and destroys engagement. Individual-paced flow is both more effective and more humane.

The repo houses the **intellectual framework**, **working demo applications**, and **writing** (Substack drafts) that tie them together.

---

## Lineage: A Deeper View (ADV) Tracking System

The ObservationTracker is a spiritual successor to the **A Deeper View (ADV) Tracking System**, originally developed by the author (Vic Uzumeri) circa 2010–2014. ADV was a web-based, cloud-hosted SaaS platform that captured real-time classroom observations of student performance. It was piloted in 300+ public and private schools before a patent lawsuit forced it off the market for four years.

### Key concepts inherited from ADV

These principles, proven in the original ADV system, are the foundation of the ObservationTracker demo:

| ADV Concept | ObservationTracker Implementation |
|---|---|
| **"One-touch technology"** — observations recorded with a single button press in naturally occurring time gaps | 4-tap Quick Log flow (Student → Goal → Rating → Note) designed for mid-class use on a phone |
| **Multi-level rubrics** — customizable, target-specific criteria down to the individual student | Goal Templates (class-level defaults) + per-student rubric customization |
| **Rubric hierarchy** — Skill Domain → Skill → Skill Objectives → Target → Reinforcers → Secondary Behaviors → Session Quality | Simplified to Goal Area → Goal Description → 4-level Rubric (suitable for a demo) |
| **"Observations, not impressions"** — capturing teacher insights before they fade to memory | Timestamped, structured observations with notes, not end-of-week recollections |
| **Stakeholder collaboration** — teachers, therapists, consultants, administrators sharing data in real time | Not yet implemented (demo is single-user); the data model supports it |
| **Individualized targets** — measuring each student against their own criteria, not a standardized benchmark | Per-student goals with independent rubrics; goals can be customized after creation |
| **"Spread it thinner and wider"** — more frequent micro-measurements reduce workload vs. fewer, heavier batch assessments | The micro-process design philosophy: transaction cost of the tool < cognitive cost of skipping it |
| **RtI-compliant graphing** — visual progress data meeting Response-to-Intervention requirements | Mini progress bars, trend indicators, and generated progress reports |
| **Disruptive positioning** — a counterweight to excessive standardized testing | "Test-Free Student Assessment" — process observation as a complement to output testing |

### The "Two Places to Measure" framework

From the ADV pitch deck: education has two measurement points — **test the outputs** (standardized exams) and **observe the process** (teacher observations during instruction). Billions of dollars and thousands of tools support output testing. Teacher process observation had, at the time, virtually no tooling. ADV (and now ObservationTracker) occupy the process observation space.

### ADV's "Four Resistance Factors"

The ADV whitepaper identified four compounding forces that defeat every attempt at more individualized, more frequent student assessment:

1. **Teacher workload** — measuring more often ≈ more work per teacher
2. **Differing student needs** — individualization multiplies the effort
3. **Budgets** — schools can't afford new measurement infrastructure
4. **Class size** — larger classes mean less time per student

ADV's response was to spread measurement across naturally occurring observation intervals throughout the day — "twenty seconds here, fifteen seconds there" — and use one-touch technology to capture structured data in those intervals. The ObservationTracker demo carries this same design philosophy forward: the 4-tap flow fits into the same micro-intervals.

### What ADV had that the demo does not (yet)

- Multi-tiered stakeholder roles (teacher, therapist, consultant, administrator, parent/viewer)
- Cloud-hosted SaaS with authentication and access control
- Offline entry and video-coded observation support
- Cross-student, cross-school data aggregation and custom report builder
- Reinforcer and secondary behavior tracking per observation
- Data export for external analysis

These are excluded deliberately — the demo is a self-contained, zero-infrastructure illustration of the core workflow, not a production system.

### Reference documents

- `reference/ADEEPERVIEW Tracking System.pdf` — Pitch deck (Michael Darden as presenter, written by the author). 18-slide overview of the ADV platform, its market positioning, and its architecture. Dated November 2014.
- `reference/Test-Free Student Assessment.pdf` — Technical whitepaper by Vic Uzumeri (Assoc. Prof. Emeritus, Auburn University). 12-page overview of the problem statement, system design, rubric architecture, reporting capabilities, and use cases (ASD, special needs, home schooling, at-risk populations, Common Core). Dated October 2014.

---

## Directory Layout

```
EduOpsLab/
├── GEMINI.md                          ← this file
├── README.md                          ← project overview + framework summary
│
├── framework/                         ← the intellectual foundation
│   ├── co-production-model.md         ← teaching as co-production (not delivery)
│   ├── constraint-analysis.md         ← teacher time as bottleneck / TOC application
│   ├── flow-vs-batch.md               ← variable learning rates, bucket brigade analogy
│   └── ai-implications.md             ← where AI fits under this framework
│
├── apps/                              ← demo web applications
│   ├── confusion-engine/              ← "What confused you?" homework system
│   └── observation-tracker/           ← IEP progress tracking tool
│
├── writing/                           ← Substack drafts and derivatives
│   ├── drafts/
│   └── published/
│
└── reference/                         ← research links, source material
    ├── ADEEPERVIEW Tracking System.pdf ← ADV pitch deck (2014)
    ├── Test-Free Student Assessment.pdf ← ADV whitepaper (2014)
    └── claude-discussion.md           ← the conversation that started this
```

---

## Demo Applications

### ConfusionEngine

A university homework tool. Students answer one question per reading: *"What in this reading confused you?"* Teachers grade responses 0–3 on cognitive depth via a click-through interface designed for speed. Aggregate views provide a pre-class briefing on where confusion is distributed.

The rubric:
- **0** — No answer
- **1** — Named something
- **2** — Explained what was confusing
- **3** — Juxtaposed two ideas (text vs. text, or text vs. reality)

### ObservationTracker

A mobile-first tool for K–12 teachers, with particular relevance to special education. Captures micro-observations (5-second tap flows) during normal classroom activity — no separate testing session. Tracks individual student progress toward IEP goals, surfaces trends, and flags attention-equity gaps (students not observed recently).

Key features:
- **Goal Templates** — define rubric-equipped goals once, apply to all students or individually
- **Per-student rubric customization** — templates are copies, not references; each student's goal is independently editable
- **Rubric-guided rating** — during the Quick Log flow, the goal-specific rubric criteria appear at the point of decision
- **Progress reports** — mock or AI-generated (via OpenRouter), citing rubric context and trend data
- **Demo data** — pre-loaded with 8 students, 24 goals with realistic rubrics, and 3 weeks of observations

---

## Hosting

The applications are hosted via **GitHub Pages** at `https://uzumeri.github.io/EduOpsLab/`.

All apps are vanilla HTML/CSS/JS with no backend. Data persists in `localStorage` on the user's device. Nothing leaves the browser.

---

## Relationship to Other Repos

This is a **personal project** (`uzumeri/EduOpsLab`), not a DeeperPoint product.

The ops principles (constraint analysis, co-production, flow optimization) are the same analytical lens used in DeeperPoint's thin market theory, applied to a different domain. Cross-references to DeeperPoint are fine in passing but the repo must stand alone.

Writing from this repo publishes to `vicuzumeri.substack.com` (personal Substack), not the DeeperPoint blog or LinkedIn newsletter.

---

## Workflows

| Command | File | Purpose |
|---|---|---|
| `/add-idea` | `.agents/workflows/add-idea.md` | Add a new idea entry to `framework/ideas.md`, or revise an existing one |

---

## Global Instructions

* **Code Style:** Use functional programming patterns where possible.
* **Naming:** Use PascalCase for components and camelCase for functions/variables.
* **Documentation:** Every exported function must have a concise JSDoc comment.
* **Refactoring:** If you see a way to simplify logic while staying readable, suggest it.

## Commit Convention

```
FEAT: add ConfusionEngine student interface
FEAT: add ObservationTracker mobile capture flow
DOCS: add co-production framework document
FIX: correct grading screen auto-advance logic
```

## Copyright

Insert `<!--Copyright (c) 2026 Mustafa Uzumeri. All rights reserved.-->` at the top of every markdown file in this repo.
