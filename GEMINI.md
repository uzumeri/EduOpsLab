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

A mobile-first tool for special needs teachers. Captures micro-observations (5-second tap flows) during normal classroom activity — no separate testing session. Tracks individual student progress toward IEP goals, surfaces trends, and flags attention-equity gaps (students not observed recently).

---

## Hosting — Open Decision

Hosting strategy is not yet decided. Options under consideration:

- **GitHub Pages** — zero cost, simplest deployment, good for static demos
- **AWS Elastic Beanstalk** — may piggyback on existing EC2 instance used for TeardownWorkbench
- **Other** — TBD based on whether demos need a backend

## Data Strategy — Open Decision

Demo data approach is not yet decided. Options:

- **Static seed data** — hardcoded sample students, responses, observations
- **LLM-generated data** — use a free-tier OpenRouter model to generate realistic student responses, observations, and progress data dynamically

The LLM approach would make demos more convincing and demonstrate the AI integration thesis directly.

---

## Relationship to Other Repos

This is a **personal project** (`uzumeri/EduOpsLab`), not a DeeperPoint product.

The ops principles (constraint analysis, co-production, flow optimization) are the same analytical lens used in DeeperPoint's thin market theory, applied to a different domain. Cross-references to DeeperPoint are fine in passing but the repo must stand alone.

Writing from this repo publishes to `vicuzumeri.substack.com` (personal Substack), not the DeeperPoint blog or LinkedIn newsletter.

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
