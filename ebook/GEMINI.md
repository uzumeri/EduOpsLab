<!--Copyright (c) 2026 Mustafa Uzumeri. All rights reserved.-->

# The Operational Imperative — Ebook Context

This directory contains the manuscript, precis, and production assets for the EduOpsLab ebook.

---

## Book Identity

**Title:** *The Operational Imperative: Running Schools Like the Production Systems They Are*
**Author:** Mustafa Uzumeri
**Status:** Working manuscript
**Target length:** ~35,000–45,000 words

---

## Central Argument

Teaching has always been a production process. It has never been treated as one.
It has run on tacit mechanisms — informal teacher judgment, institutional apprenticeship,
slow knowledge turnover — that worked passably when the system's failure tempo was slow.
Those mechanisms are expiring simultaneously, under multiplied AI-driven pressure.
The response is operational maturity — not richer theory. The same institutional
discipline that transformed manufacturing quality a half-century ago, applied now to learning.

---

## Source Framework

All analytical claims in the ebook trace back to `framework/ideas.md`. The ideas.md
entry references (HL-1, BE-4, LP-3, etc.) are the primary source identifiers. If an
ebook claim contradicts ideas.md, the framework takes precedence — note the contradiction
explicitly and do not silently resolve it.

---

## Audience

Operators of educational systems:
- University administrators and department chairs
- School district instructional design leads
- Corporate Learning & Development directors
- Education technology designers and builders
- Policy people responsible for instructional quality at scale

**Explicitly not the primary audience:** classroom teachers (who are the workers
subject to these systems, not the designers of them) or academic researchers in
education (who are served by the learning sciences literature, not this book).

---

## Tone and Voice

- Authoritative, practitioner-focused, analytical
- Confident, precise, jargon-minimal
- First person where it adds credibility (the author's prior work thread)
- Lab notebook conclusions restated with connective tissue, stakes, and spine
- Same tone as *The Middle Power Pivot* — "practitioner reflecting on systemic design",
  not "academic arguing for a position"

---

## Structural Conventions (follow Middle Power Pivot model)

- **Parts** with descriptive subtitles → **Chapters** with numbered titles
- Each chapter begins with a brief framing paragraph and ends with a 3–5 sentence
  **Chapter Summary** in the same voice as the chapter
- **Fictional scenarios** are clearly labeled with a disclaimer ("This is a fictional
  scenario...") and use named characters in specific institutional settings
- **One hero image per Part** (`<!-- IMG:part-N-hero | description -->`)
- **Footnotes** for academic references; keep them technical and brief
- **Tables** for comparative frameworks; use sparingly, always with a framing paragraph

---

## File Naming

```
ebook/
  GEMINI.md                              ← this file
  TheOperationalImperative.md            ← main manuscript
  TheOperationalImperative_Precis.md    ← standalone precis (1,500–2,000 words)
  images/                               ← generated hero images
```

---

## Production Pipeline

The ebook will be built using the same `gen_pdf.py` pipeline as *The Middle Power Pivot*
in `DeeperPointBlogging/ebook/`. That pipeline will need to be adapted for this repo
once the manuscript is substantially complete.

---

## Copyright

Insert `<!--Copyright (c) 2026 Mustafa Uzumeri. All rights reserved.-->` at the top
of every markdown file in this directory.
