---
description: Synchronize ideas.md and TheOperationalImperative.md after significant changes to either document
---

# /sync-docs — Synchronize Framework and Ebook

Use this workflow after making significant changes to either `framework/ideas.md` or
`ebook/TheOperationalImperative.md`. It scans both documents, identifies gaps and
misalignments, and proposes targeted updates.

This workflow is a **gap scanner**, not an auto-writer. It will never write ebook prose
on its own — it identifies where prose needs to be written and proposes thread updates
for your review.

---

## How to invoke

```
/sync-docs
/sync-docs ideas          ← focus on propagating ideas.md changes → ebook
/sync-docs ebook          ← focus on propagating ebook changes → ideas.md
```

With no argument, runs the full bidirectional scan.

---

## What the agent will do

### Step 1 — Read both documents

Read:
- `framework/ideas.md` — full document, noting the timestamp, all section entries and
  their IDs, and the `→ Ebook:` pointer on each section header
- `ebook/TheOperationalImperative.md` — full document, noting all chapter `*Thread:*`
  drafting notes and all chapter description lines in the TOC

### Step 2 — Build the sync map

Construct a mapping from each `ideas.md` section to its ebook chapters (using the
`→ Ebook:` pointers). Then for each ebook chapter, extract the `*Thread:*` line listing
the entry IDs that chapter is supposed to draw from.

The sync map is:
```
Chapter N → [expected entry IDs from Thread line] vs. [entries in mapped ideas.md sections]
```

### Step 3 — Identify gaps (Ideas → Ebook direction)

For each ebook chapter:
1. List all entry IDs in the chapter's mapped `ideas.md` sections
2. Cross-check against the chapter's `*Thread:*` line
3. **Gap**: any entry ID present in step 1 but absent from step 2 — the entry exists in
   ideas.md but is not listed in the chapter's drafting thread

For each gap, assess whether the entry is:
- **High relevance** — clearly belongs in this chapter's prose, worth proposing a thread update
- **Adjacent relevance** — related but not central; note it but don't propose a thread update
- **Wrong chapter** — the `→ Ebook:` mapping on the section may be imprecise; flag for review

### Step 4 — Identify gaps (Ebook → Ideas direction)

For each `*Thread:*` entry ID listed in the ebook:
1. Verify the entry exists in `ideas.md` under its expected prefix
2. Check that the entry content has not substantially changed since it was added to the
   thread list (by reading the current entry text)
3. **Stale reference**: if the entry has been significantly revised or if the ID no longer
   exists, flag it

### Step 5 — Generate Sync Report

Output a structured report:

```
SYNC REPORT — [date]

== Ideas → Ebook gaps (entries not yet in any chapter thread) ==

[ID] [Title] — maps to [Chapter N]
  Proposed thread addition: add "[ID]" to Chapter N's *Thread:* line
  Reason: [one sentence]

== Ebook → Ideas stale references ==

Chapter N *Thread:* lists [ID] — entry has been [revised / not found]
  Proposed action: [update thread reference / note as removed]

== TOC description updates suggested ==

Chapter N description currently: "..."
  Suggested revision: "..."
  Reason: new entry [ID] shifts the chapter's emphasis

== No action needed ==
  [list of chapters where thread and ideas.md are in sync]
```

### Step 6 — Present for approval

Show the Sync Report to the user. Wait for approval on each proposed change before
making any edits.

### Step 7 — Apply approved changes

For each approved change:
- **Thread addition** → edit the `*Thread:*` line in the appropriate chapter of the ebook
- **TOC update** → edit the chapter description line in the ebook TOC
- **Stale reference note** → add a `<!-- STALE: [ID] -->` comment in the ebook chapter,
  or update the thread line if the entry has been renamed

Update the `ideas.md` timestamp after any sync edits to `ideas.md`.
Do not update the ebook's date — the ebook has no timestamp convention.

Commit both files together with message:
```
DOCS: sync framework ↔ ebook — [brief description of changes]
```

---

## Notes

- The workflow does not infer chapter prose from `ideas.md` entries. The ebook is written
  by the author; the workflow only manages the *thread* drafting notes and TOC descriptions.
- If a new `ideas.md` section appears that has no entry in the ebook cross-reference table,
  the workflow will flag it and propose a new chapter or chapter section in the ebook.
- The `→ Ebook:` pointers on `ideas.md` sections are the source of truth for the mapping.
  If the mapping needs updating (e.g., a new ebook chapter was added), update the pointer
  line in `ideas.md` first, then run `/sync-docs`.
