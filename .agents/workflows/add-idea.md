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
- The existing sections and their prefixes (HL, BE, CP, TC, PO, MP, AI)
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
- **Feeling first.** If the idea connects to a lived experience, lead with that — not with the theoretical framework. → voice-rules.md Rule 1
- **Cross-reference.** If the idea connects to or extends another entry, add `→ [ID]` at the end.
- **No jargon without setup.** Technical terms (batch processing, co-production, TOC) may appear because the collection assumes a reader already familiar with the framework — but new jargon should still be grounded in plain language.

**ID assignment:**
- New entries get the next sequential number within their section prefix (e.g., if the last entry is `HL-5`, the next is `HL-6`)
- If a new section is needed, propose a 2-letter prefix that follows the existing pattern

#### Step 5 — Present for approval

Show the drafted entry to the user. Include:
- The proposed ID, title, and body
- The section it will be placed in
- Any cross-references to existing entries
- Whether any existing entries should be revised to cross-reference back

Do NOT edit the file until the user approves.

#### Step 6 — Insert into the collection

After approval:

1. **Edit `framework/ideas.md`** — insert the new entry at the end of the appropriate section (before the section's closing `---` divider). For revisions, replace the existing entry in place.
2. **Add back-references** — if the new entry is cross-referenced by, or should be referenced from, existing entries, update those entries to include `→ [NEW-ID]`.
3. **Update the timestamp** — change the `*Last updated:*` line at the bottom of the file to today's date.
4. **Commit and push** with message: `DOCS: add [ID] — [short title]` or `DOCS: revise [ID] — [short description of change]`

---

### Section Reference

Current sections and their scope:

| Prefix | Section | Scope |
|--------|---------|-------|
| HL | How Humans Learn | Universal observations about how learning works outside institutional constraints |
| BE | What's Wrong With Batch Education | Specific pathologies of batch-scheduled instruction |
| CP | Teaching as Co-Production | The co-production reframing and its operational consequences |
| TC | The Teacher Constraint | Teacher time as bottleneck, TOC analysis, queuing theory |
| PO | Process Observation vs. Output Testing | Observation-based assessment, the ADV heritage, measurement philosophy |
| MP | Micro-Process Design | Design principles for tools that fit inside the teacher's flow |
| AI | Where AI Belongs | AI's role under the co-production model |

If a new idea doesn't fit any existing section, propose a new one with a 2-letter prefix and a clear scope description.

---

### Notes

- The ideas collection is a **living document**. Entries may be revised, merged, or reorganized as the thinking evolves.
- IDs are **stable** — once assigned, an ID should not be reused even if the entry is deleted. This ensures cross-references in articles and ebook chapters remain valid.
- The collection is an **internal reference**, not a publication target. It feeds the Substack articles and ebook but is not itself published.
- When in doubt about placement, **ask the user** rather than guessing. The section structure reflects how they think about these ideas.
