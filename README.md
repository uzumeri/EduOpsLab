<!--Copyright (c) 2026 Mustafa Uzumeri. All rights reserved.-->

# EduOpsLab

**Operations management principles applied to education — with working demonstrations.**

🔗 **Live demo:** [uzumeri.github.io/EduOpsLab](https://uzumeri.github.io/EduOpsLab/)

---

## The Thesis

Most educational technology is built on the wrong model. It treats teaching as content delivery — a knowledgeable person transferring knowledge to passive recipients. AI in education inherits this error, positioning itself as a better lecturer.

Teaching is not delivery. It is **co-production** — a joint process requiring active participation from both teacher and student, like healthcare or consulting. You cannot educate an unwilling student any more than you can treat a patient who won't describe their symptoms.

This reframing, grounded in operations management, has immediate practical consequences.

---

## Three Principles

### 1. The Constraint: Teacher Time

A university professor teaching 125 students has a fixed time budget. Five extra minutes per student is over ten hours of additional work falling on one person. This arithmetic systematically kills good teaching methods — active learning, individualized feedback, Socratic questioning — because they require teacher time that doesn't scale. The lecture survives not because it works but because it's the only format that doesn't blow up the constraint.

### 2. Co-Production, Not Delivery

In service co-production, the customer is a necessary input to the production process. Student engagement isn't a nice-to-have — it's a factor input with the same operational status as the teacher's preparation. Designing the process to elicit and sustain student input is as important as designing the content. The "confusion question" homework system (see below) is co-production by design: student cognitive output becomes teacher input for the next session.

### 3. Flow vs. Batch

Traditional education is batch processing. Everyone starts the same unit on Monday. Everyone takes the test on Friday. The batch hides enormous variability in learning rates — some students are bored, others are drowning, and the system responds to neither signal.

Education occurs as a flow process, not batch. But moving to flow without clobbering the instructor requires that teaching tools be reduced in scale to **micro-processes** — interactions a teacher can use wherever and whenever appropriate, without context-switching away from the act of teaching. The tool should disappear into the workflow. Aggregation is the machine's job, not the teacher's.

---

## Where AI Actually Belongs

AI designed under the delivery model keeps trying to clone the teacher.

AI designed under the co-production model asks: *where is the joint process breaking down, and what's the cheapest intervention that unblocks it?*

The highest-value applications are:
- **Managing input quality** — ensuring students arrive at the co-production moment prepared
- **Reducing co-production friction** — helping students articulate confusion they can't express on their own
- **Recycling output as input** — closing the feedback loop between student state and teacher adaptation
- **Monitoring co-production quality** — not student performance, but whether the joint process is actually running

---

## Demo Applications

Both apps run entirely in your browser — **no backend, no account, no data leaves your device.** All data is stored in `localStorage`. Click **"Load Demo"** inside either app to populate realistic sample data and see the full workflow immediately.

---

### 🤔 ConfusionEngine

**University homework built on one question: *"What in this reading confused you?"***

Students write 2–3 sentences per chapter. Teachers grade 0–3 on cognitive depth via a click-through interface designed for speed (one response, click to advance). The professor walks into every class knowing exactly where confusion is distributed across 125 minds.

#### How to use the demo

1. Open [ConfusionEngine](https://uzumeri.github.io/EduOpsLab/apps/confusion-engine/) or click it from the landing page.
2. The app opens in **Teacher mode** by default.

**Teacher workflow:**
- **Questions tab** — Create questions with chapter numbers, set open/close dates. Students can only answer while the window is open.
- **Grading tab** — One student response at a time. Four buttons (0–3) rate cognitive depth. Press a button, the next response loads. Grading 125 responses takes minutes.
- **Summary tab** — View/print a grade summary with all scores.

**Student workflow:**
- Toggle to **Student mode** using the switch in the header.
- Select your name from the class roll.
- See assigned questions, submit your confusion response, update it until the window closes.
- Your grade appears immediately once the teacher assigns it.

**AI grading (optional):**
- In Settings, paste an [OpenRouter](https://openrouter.ai/) API key.
- The AI pre-scores each response on the same 0–3 scale, giving the teacher a starting point. The teacher retains the final say — one click to accept or override.

---

### 👁️ ObservationTracker

**IEP progress tracking in seconds — not hours.**

Special education teachers are required to track student progress toward Individualized Education Program (IEP) goals. The traditional approach — end-of-period checklists, weekly spreadsheets, quarterly narrative reports — is a batch process imposed on what is fundamentally a flow problem. Students don't develop in batches.

ObservationTracker captures **micro-observations** during normal classroom activity. The teacher taps a 4-step flow on their phone (Student → Goal → Rating → Note) and gets back to teaching. The system aggregates observations into trends, flags students who haven't been observed recently, and generates progress reports.

#### How to use the demo

1. Open [ObservationTracker](https://uzumeri.github.io/EduOpsLab/apps/observation-tracker/) or click it from the landing page.
2. Click **"🚀 Load Demo Classroom"** to populate 8 students with IEP goals, rubrics, and 3 weeks of observation history.

**Dashboard (Students tab)**
- Summary stats: total students, observations, today's observations, students needing attention.
- Student cards with last-observed timestamp and attention status.
- Click any student to see their full profile with goal progress.

**Quick Log (Log tab)**
- **Step 1:** Select student
- **Step 2:** Select IEP goal
- **Step 3:** Rate against the rubric — the goal-specific criteria appear below the rating buttons so you're scoring against defined benchmarks, not gut feeling
- **Step 4:** Add an optional note (what you observed), then save
- Designed for mid-class use on a phone. The whole flow takes 5–10 seconds.

**Timeline tab**
- Chronological feed of all observations across all students.
- Color-coded rating dots. Filterable.

**Student Profile**
- Click any student from the dashboard.
- See IEP goals with mini progress charts (color-coded bars showing last 10 observations).
- Trend indicators: ↑ Improving, → Steady, ↓ Declining.
- **"Current:"** shows the rubric-level description for the most recent rating.
- **"▶ View Rubric"** expands to show all 4 levels of the goal-specific rubric.
- **"📝 Report"** generates a formatted IEP progress report (mock or AI-generated with OpenRouter key).

#### Goal Templates

Instead of entering the same rubric for every student individually, create **Goal Templates** once and apply them.

1. Go to **Manage → 📋 Goal Templates → + New**
2. Define the goal area, description, and 4-level rubric
3. Back on the template list, click **"Apply to All"** to assign it to every student
4. Or assign to individual students: go to a student profile → **"➕ Add Goal"** → pick from the template list at the top

Templates are copies, not references — once applied, a student's goal can be customized without affecting other students or the template.

#### Rating Rubrics

Every goal can have a 4-level rubric defining what each rating means for that specific goal:

| Rating | Default Label | Example (Seated Behavior) |
|--------|--------------|---------------------------|
| 🟥 1 | Struggling | Up and wandering 3+ times per lesson |
| 🟧 2 | Emerging | Stays seated 5–10 min with prompting |
| 🟦 3 | Developing | Stays seated 10–15 min independently |
| 🟩 4 | Mastered | Stays seated 15+ min, engaged and focused |

The rubric appears at the **point of decision** — during the Quick Log rating step — so the teacher doesn't need to memorize criteria. If no rubric is defined, the app falls back to the generic labels (Struggling / Emerging / Developing / Mastered).

---

## Design Philosophy: Micro-Process Tools

Both apps follow a core design rule: **the transaction cost of using the tool must be lower than the cognitive cost of not using it.**

If a tool demands a context switch — open laptop, navigate to app, fill out form, submit — it's a batch interrupt that steals time from the actual production process (teaching). The tool only works if it disappears into the workflow.

| Design Decision | Rationale |
|---|---|
| Mobile-first, phone-optimized | Teachers are already holding their phone or it's in a pocket |
| 4-tap observation flow | Faster than making a tally mark |
| Auto-advancing grading | One button press per student, no page navigation |
| AI aggregation, human input | Teacher contributes micro-inputs; machine synthesizes reports |
| No login required | Zero friction to start — all data stays in the browser |
| Demo data pre-loaded | Immediate access to the full workflow for evaluation |

---

## Technical Details

- **Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+). No frameworks, no build step, no dependencies.
- **Data:** `localStorage` only. Nothing leaves the browser. No backend.
- **AI:** Optional OpenRouter API integration for grading assistance (ConfusionEngine) and progress report generation (ObservationTracker). Works fully without it via mock fallbacks.
- **Deployment:** Static files hosted on GitHub Pages.

### Repository structure

```
EduOpsLab/
├── index.html                          ← Landing page
├── apps/
│   ├── confusion-engine/
│   │   ├── index.html                  ← ConfusionEngine app
│   │   ├── style.css
│   │   └── app.js
│   └── observation-tracker/
│       ├── index.html                  ← ObservationTracker app
│       ├── style.css
│       └── app.js
└── README.md
```

---

## Background

These ideas originated from the author's experience teaching operations management and supply chain at Auburn University, where the irony of teaching constraint theory inside a system that had never applied it to itself became impossible to ignore.

The ConfusionEngine was built and used in live classrooms twenty years ago. The ObservationTracker addresses problems reported by special education teachers who track IEP goals daily — a process that is simultaneously mandatory, high-stakes, and unreasonably time-consuming.

### Lineage: A Deeper View Tracking System

The ObservationTracker is a modern descendent of the **A Deeper View (ADV) Tracking System**, a web-based SaaS platform developed by the author circa 2010–2014. ADV was piloted in over 300 schools before a patent lawsuit forced it off the market. The original system documents are in the `reference/` directory.

ADV was built on a foundational insight: education has **two places to measure** — you can *test the outputs* (standardized exams), or you can *observe the process* (teacher observations during instruction). Billions of dollars flow to output testing. The process observation side had virtually no tooling.

The whitepaper identified **four compounding factors** that defeat every attempt to move beyond standardized testing toward more frequent, individualized assessment:

1. **Teacher workload** — measuring more often means more work per teacher
2. **Differing student needs** — individualization multiplies the measurement effort
3. **Budgets** — schools can't afford new measurement infrastructure
4. **Class size** — larger classes mean less time per student

ADV's response — and the ObservationTracker's — is to fit measurement into naturally occurring observation intervals during normal instruction: "twenty seconds here, fifteen seconds there." One-touch technology captures structured data in intervals too short for traditional note-keeping but more than sufficient for a 4-tap structured recording.

The system's design philosophy is captured in the whitepaper's closing line: *"With ADV Tracking, teachers can now afford to do data-driven teaching."*

*"Confusion is a higher state of knowledge than ignorance."*

---

## License

© 2026 Mustafa Uzumeri. All rights reserved.
