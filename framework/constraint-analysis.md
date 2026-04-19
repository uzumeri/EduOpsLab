<!--Copyright (c) 2026 Mustafa Uzumeri. All rights reserved.-->

# Constraint Analysis: Teacher Time as the Bottleneck

## The Core Problem

A classroom is a **queuing system** with one (or few) servers and many clients with heterogeneous, dynamically changing needs. Teacher time is the constrained resource. Every design decision about teaching methods, technology, and assessment should be evaluated against this constraint.

## The Asymmetry

When an innovation adds burden to students, it's distributed across N people. Five extra minutes costs the class 625 student-minutes total, but each individual bears only 5. The complaint is loud but the per-person cost is small.

When the same innovation adds burden to the teacher, it's not distributed at all. Five extra minutes per student is 625 minutes — over 10 hours — falling on one person. The cost is catastrophic but silent.

This asymmetry systematically kills good teaching methods. Active learning, Socratic questioning, open-ended projects, individualized feedback — everything research shows works better — requires teacher time that doesn't scale.

## Theory of Constraints Applied

Goldratt's five focusing steps apply directly:

1. **Identify the constraint** → Teacher time
2. **Exploit the constraint** → Use it only where it has highest marginal value
3. **Subordinate everything else** → Design student work, AI assistance, and course structure around protecting teacher time
4. **Elevate the constraint** → TA systems, AI offloading, better tools
5. **Repeat** → Don't let inertia become the new constraint

## What AI Enables

AI transforms the allocation problem from one with no information to one with rich information. Continuous monitoring of every student simultaneously produces a real-time needs signal for each one. The teacher's allocation problem becomes:

- Which students need *only* the teacher right now vs. which can be served by AI?
- What's the expected payoff of the next 5 minutes with Student A vs. Student B?
- How does that change if Student B is approaching a frustration threshold?

## The Priority Queue Interface

The teacher-facing interface should show a **continuously updated priority queue** — "given everything the AI knows right now, where is your next minute most valuable?" This is a fundamentally different paradigm than any current EdTech product.

Critically, the priority function must be **configurable and learnable** — incorporating the teacher's own judgment, historical intervention effectiveness, and specific accommodation profiles.

## The NC State Evidence

A 2026 NC State study confirmed that teachers are more likely to interact with students they have interacted with before — teacher help is "sticky" and recurs for previously supported students. Without explicit allocation support, attention follows social gradients rather than need gradients. This is the queuing problem, empirically confirmed.

## The University Case

At the university level, the constraint is especially severe:
- Class sizes are large and growing
- The instructor also manages research, advising, and administration
- TAs have competing demands and variable training
- Office hours are nominally available but practically inaccessible
- Career rewards are weakly tied to teaching quality

The lecture format persists not because lectures are good — the evidence that they aren't is overwhelming — but because lectures are the only format that doesn't blow up under the teacher-time constraint.
