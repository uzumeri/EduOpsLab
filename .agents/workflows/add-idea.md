---
description: Add one or more new ideas to the canonical ideas collection in framework/ideas.md, or revise an existing entry
---

## /add-idea — Add or Revise Ideas in the Collection

Use this workflow to add new insights to `framework/ideas.md` or revise existing entries. Each idea gets a succinct, self-contained description — readable without context, quotable in an article, and traceable by its stable ID.

### How to invoke

In chat, describe the idea naturally. Examples:

> `/add-idea The best teachers already teach in flow — they just do it informally and unsustainably. The tool doesn't introduce a new method; it makes their existing instinct survivable.`

> `/add-idea revise BE-3 — strengthen the connection to identity foreclosure. Kids don't just fall behind; they rewrite their self-concept around the failure.`

> `/add-idea There's an analogy between test-driven education and end-of-line inspection in manufacturing. Both catch defects too late. Both are cheap per unit but expensive in aggregate. SPC moved to in-process checks; education needs the same shift.`

You can also pass multiple ideas in one invocation — the agent will process each as a separate entry.

---

### Inputs

The user provides:
1. **Idea description** — a natural-language description of the insight. Can be rough, conversational, or fully formed. The agent will distill it into the collection's style.
2. **Revision target** (optional) — an existing ID (e.g., `BE-3`, `TC-1`) to revise rather than create a new entry.
3. **Section hint** (optional) — which section the idea belongs in. If omitted, the agent will determine placement.

---

### What the agent will do

#### Step 1 — Read the current collection

Read `framework/ideas.md` to understand:
- The existing sections, their prefixes, and the `→ Ebook:` pointer on each section header
- The current entries and their IDs (to avoid duplication and determine the next ID)
- The style and length of existing entries (typically 2–4 sentences)
- Existing cross-references (`→ [ID]` notation)

#### Step 2 — Read the voice rules

Read `writing/voice-rules.md` to ensure the new entry follows the established editorial principles — especially Rule 1 (feeling first, phrase second, term third) and Rule 3 (not just a school story).

#### Step 3 — Classify the idea

Determine whether this is:
- **New entry** — assign to the best-fit section, or propose a new section if none fits
- **Revision** — locate the existing entry by ID

If the user's idea overlaps with an existing entry, flag it: "This is close to [ID]. Want me to revise that entry instead, or create a separate one?"

#### Step 4 — Draft the entry

Write the entry following these rules:

**Format:**
```markdown
### [PREFIX]-[N]. [Title — short, declarative]

[Body — 2–5 sentences. Self-contained. Written in the analytical, confident voice of the collection. Include cross-references using → [ID] where connections exist.]
```

**Style rules:**
- **Succinct.** Each entry should be quotable in a single paragraph. No padding.
- **Self-contained.** A reader encountering this entry alone should understand the idea without needing the surrounding entries.
- **Grounded.** If the idea connects to a real example (Jo Mackiewicz, ADV system, Auburn classroom), name it concretely.
- **Feeling first.** If the idea connects to a lived experience, lead with that — not with the theoretical framework.
- **Cross-reference.** If the idea connects to or extends another entry, add `→ [ID]` at the end.
- **No jargon without setup.** Technical terms (batch processing, co-production, TOC) may appear because the collection assumes a reader already familiar with the framework — but new jargon should still be grounded in plain language.

**ID assignment:**
- New entries get the next sequential number within their section prefix (e.g., if the last entry is `HL-10`, the next is `HL-11`)
- If a new section is needed, propose a 2-letter prefix that follows the existing pattern

#### Step 5 — Present for approval

Show the drafted entry to the user. Include:
- The proposed ID, title, and body
- The section it will be placed in
- Any cross-references to existing entries
- Whether any existing entries should be revised to cross-reference back

Do NOT edit either file until the user approves.

#### Step 6 — Insert into the collection

After approval:

1. **Edit `framework/ideas.md`** — insert the new entry at the end of the appropriate section (before the section's closing `---` divider). For revisions, replace the existing entry in place.
2. **Add back-references** — if the new entry is cross-referenced by, or should be referenced from, existing entries, update those entries to include `→ [NEW-ID]`.
3. **Update the timestamp** — change the `*Last updated:*` line at the bottom of the file to today's date.

#### Step 7 — Check ebook impact

Read `ebook/TheOperationalImperative.md` and locate the chapter(s) that correspond to the new entry's section (using the `→ Ebook:` pointer on the section header).

For each affected chapter:
1. Find the chapter's `*Thread:*` drafting note
2. Determine whether the new entry ID belongs in that thread
3. If yes, propose adding `[NEW-ID]` to the thread line
4. If the new entry meaningfully shifts the chapter's focus or adds a new angle, propose a revised chapter description line in the TOC

Present both changes to the user in a single review block before writing anything:

```
ideas.md: [ID] inserted in section [PREFIX] ✓

Ebook impact:
  Chapter N (*Thread:*): propose adding [ID]
  Reason: [one sentence]
  Current: *Thread: ...*
  Proposed: *Thread: ..., [ID]*

  Chapter M TOC description (optional — only if entry shifts focus):
  Current: "..."
  Proposed: "..."
```

#### Step 8 — Apply ebook updates

If the user approves the ebook changes:
1. Edit the `*Thread:*` line in the affected chapter(s) of `ebook/TheOperationalImperative.md`
2. If a TOC description update was approved, edit the TOC line as well

Commit both files together:
```
DOCS: add [ID] — [short title]
```

If the user declines the ebook update, commit only `ideas.md`:
```
DOCS: add [ID] — [short title] (ebook thread not yet updated)
```

---

### Section Reference

Current sections, prefixes, ebook chapter targets, and scope:

| Prefix | Section | → Ebook | Scope |
|--------|---------|---------|-------|
| HL | How Humans Learn | Part I Ch 1, 3, 4 · Part II Ch 6 | Universal observations about how learning works outside institutional constraints |
| BE | What's Wrong With Batch Education | Part I Ch 3 | Specific pathologies of batch-scheduled instruction |
| LP | Latent Defects — Teaching as a Special Process | Part I Ch 4 | ISO special-process concept; planted misconceptions; Dunning-Kruger failures |
| CP | Teaching as Co-Production | Part I Ch 1 · Part V Ch 17 | The co-production reframing and its operational consequences |
| TC | The Teacher Constraint | Part I Ch 2 · Part V Ch 15–16 | Teacher time as bottleneck, TOC analysis, attention allocation |
| PO | Process Observation vs. Output Testing | Part IV Ch 12–13 | Observation-based assessment, ADV heritage, measurement philosophy |
| MP | Micro-Process Design | Part IV Ch 14 | Design principles for tools that fit inside the teacher's flow |
| CM | Content Microservices | Part III Ch 9 | Bounded library units — economics, structure, lateral entry |
| PM | Process Microservices | Part III Ch 10 | Classroom operating procedures as libraryable assets |
| ES | Expert Knowledge Scaling | Part II Ch 5–7 · Part III Ch 8 | Expertise dilution, tacit knowledge at retirement, library as solution |
| EP | External Pressures on the Teaching System | [bridge chapter — to be placed] | Knowledge balkanization, economic realignment velocity, batch vs. flow response capacity |
| AI | Where AI Belongs | Part III Ch 11 · Part V Ch 16 | AI as production infrastructure under the co-production model |
| AID | Where AI Undermines Teaching | Part VI Ch 18–19 | AI failure modes; arms-race asymmetry; countermeasure design |
| OI | The Operational Imperative | Part VII Ch 20–21 | The closing argument: operational maturity, not richer theory |

If a new idea doesn't fit any existing section, propose a new one with a 2-letter prefix and a scope description. Update the `→ Ebook:` pointer on the new section header to indicate which ebook chapter it feeds.

---

### Notes

- IDs are **stable** — once assigned, an ID is never reused even if the entry is deleted. Cross-references in articles and ebook chapters trace back to these IDs.
- The collection is an **internal reference**, not a direct publication target. It feeds the ebook, Substack articles, and the shareable PDF.
- Run `/sync-docs` after any significant batch of changes to check for gaps between the two documents.
- When in doubt about placement, **ask the user** rather than guessing.
