<!--Copyright (c) 2026 Mustafa Uzumeri. All rights reserved.-->

# Working Demonstrations

This document maps the conceptual framework in [ideas.md](ideas.md) to the working software
demonstrations in the [`apps/`](../apps/) directory. Each app is described in terms of the
framework ideas it makes tangible, its design rationale, and its current limitations.

The apps run entirely in the browser — no backend, no account needed.

---

## Quick Reference

| App | Tab / Mode | Ideas demonstrated |
|---|---|---|
| [Workload Calculator](../apps/workload-calculator/) | Asymmetry | TC-1, TC-2 |
| [Workload Calculator](../apps/workload-calculator/) | Observation Burden | PO-3, PO-4 |
| [Workload Calculator](../apps/workload-calculator/) | Prep Overhead | CM-1, CM-2, CM-4 |
| [ObservationTracker](../apps/observation-tracker/) | — | MP-1, MP-2, MP-3, MP-4, PO-2, PO-4 |
| [ConfusionEngine](../apps/confusion-engine/) | — | CP-1, CP-3, HL-4 |

---

## Workload Calculator

**Path:** `apps/workload-calculator/`  
**Purpose:** Make the arithmetic of teacher constraint visible and interactive. Each tab
isolates one compounding cost that makes better teaching operationally impossible under
current conditions — and shows what changes when you change the process design.

### Tab 1 — The Asymmetry Problem

Demonstrates **TC-2** (the asymmetry that kills good teaching) and **TC-1** (teacher time
as the binding constraint).

The central insight: asking a teacher to add five minutes of individualized feedback per
student *sounds* reasonable at the per-student level. Run the aggregation and it becomes
2+ hours of additional work every day, falling on one person. The calculator makes the
aggregation visible and interactive — move the class-size slider and watch the
"per teacher, per year" and "equivalent weeks" metrics update live.

The design choice to show "equivalent weeks" (e.g. "9.4 extra weeks — that's 26% of a
full school year") rather than raw hours was deliberate: the figure is too large to ignore
and easy to communicate to a non-technical audience.

### Tab 2 — Observation Burden

Demonstrates **PO-3** (the four resistance factors) and **PO-4** (spread it thinner
and wider).

Compares the annual documentation time for IEP-tracked students under the traditional
batch method (binder, form, note, file) versus a micro-process method (4-tap mobile
observation). The "Time Recovered Per Year" metric — often 350–400 hours — is the
quantitative case for ObservationTracker (below).

### Tab 3 — Prep Overhead

Demonstrates **CM-1** (content microservices cost more per unit, but the library model
changes the economics), **CM-2** (transition cost is one-time), and **CM-4** (the
break-even library share rate is the key policy variable).

The core output is the **break-even library share rate**: at what fraction of
micro-units sourced from a shared library does Year 1 adoption cost equal or fall below
batch prep? A Year 1 / Year 2+ toggle shows the transition cost explicitly — Year 1 with
a thin library is more expensive; Year 2+ with a deep library is substantially cheaper.
The color-coded delta block (orange = micro costs more, teal = micro saves) makes the
crossover visceral.

**Limitation:** The model does not yet account for process microservice prep (PM section)
— a future tab could apply the same math to classroom procedure design costs.

---

## ObservationTracker

**Path:** `apps/observation-tracker/`  
**Purpose:** A working prototype of the micro-process observation tool design described
in the MP section. Demonstrates that the core tool-design principles (MP-1 through MP-4)
can be realized in software that fits inside a teacher's instructional flow.

**Ideas demonstrated:**

- **MP-1** (transaction cost must be lower than cognitive cost): The observation flow is
  Student → Goal → Rating → Note in four taps. No context switch, no binder, no form.
- **MP-2** (teachers contribute micro-judgments; machines aggregate): The teacher rates;
  the tracker accumulates, trends, and generates progress summaries — the teacher never
  synthesizes.
- **MP-3** (tools must fit inside the teacher's flow): Designed for a phone held in one
  hand during instruction.
- **MP-4** (the rubric as shared language): Goals use structured rubrics; ratings are
  anchored to descriptors, not free text.
- **PO-2** (observations degrade to impressions): The app is the capture mechanism
  that prevents this degradation.
- **PO-4** (spread it thinner and wider): Each observation takes under 30 seconds and
  can happen in a natural pause during instruction.

**Lineage:** ObservationTracker is a direct descendant of the ADV Tracking System (2014),
which originated the core insight that process observation could be made low-friction
enough to fit inside instruction rather than displacing it.

**Goal Templates** (current feature): Pre-built goal and rubric designs that a teacher
can adopt and customize — a rudimentary prototype of the CM/PM library concept in
practice. → CM-1, PM-2

---

## ConfusionEngine

**Path:** `apps/confusion-engine/`  
**Purpose:** A university homework system that operationalizes the co-production model
(CP section). Students submit a "confusion question" before class; the teacher sees
an aggregated view of where confusion is concentrated before walking in.

**Ideas demonstrated:**

- **CP-1** (teaching is co-production, not delivery): The confusion question is not
  an assessment — it is the student's required input to the production process.
- **CP-3** (student preparation is incoming material quality): A student who has engaged
  deeply enough to identify and articulate their confusion arrives at class as a
  higher-quality co-producer.
- **HL-4** (confusion is a higher state of knowledge than ignorance): The system is
  designed to elicit and surface confusion as signal, not punish it as failure.

**Design note:** The teacher-facing aggregation view is the key innovation. Without it,
confusion questions are a one-way submission. With it, the teacher walks in with a
real-time map of where attention should concentrate — turning co-production inputs into
teacher allocation information. → AI-4

---

*For a complete list of ideas, see [ideas.md](ideas.md).*  
*Last updated: 2026-04-20*
